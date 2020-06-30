import * as fs from "fs-extra";
import * as path from "path";
import { config } from "dotenv";
import * as logUpdate from "log-update";
const {
  CROWDIN_TOKEN,
  CROWDIN_WORKSPACE_NAME,
  CROWDIN_PROJECT_ID,
} = config().parsed;
const PROJECT_ID = Number(CROWDIN_PROJECT_ID);
import crowdin, {
  Credentials,
  ProjectsGroupsModel,
  UploadStorageModel,
  ResponseList,
  SourceFilesModel,
  ResponseObject,
  SourceStringsModel,
  TranslationsModel,
} from "@crowdin/crowdin-api-client";
if (!(CROWDIN_TOKEN && CROWDIN_WORKSPACE_NAME && CROWDIN_PROJECT_ID)) {
  throw new Error("Crowdin config not provided in .env");
}
const credentials: Credentials = {
  token: CROWDIN_TOKEN,
  organization: CROWDIN_WORKSPACE_NAME,
};

// initialization of crowdin client
const {
  projectsGroupsApi,
  sourceFilesApi,
  uploadStorageApi,
  stringTranslationsApi,
  translationsApi,
} = new crowdin(credentials);

let crowdinProject: ProjectsGroupsModel.Project;

/**
 * Simple wrapper around getProject api to avoid multiple repeat calls
 */
export async function getProjectMeta() {
  if (crowdinProject) {
    return crowdinProject;
  } else {
    crowdinProject = (await projectsGroupsApi.getProject(PROJECT_ID)).data;
  }
  return crowdinProject;
}

export async function getProjectDownloadUrl() {
  console.log("downloading");
  const { targetLanguageIds } = await getProjectMeta();
  const build = (
    await translationsApi.buildProject(PROJECT_ID, {
      targetLanguageIds,
    })
  ).data;
  await _waitForBuildComplete(build);
  const dl = await translationsApi.downloadTranslations(PROJECT_ID, build.id);
  return dl.data.url;
}

/**
 * Take a folder containing json dictionary files ({source:translation}) and upload one-by-one
 * to crowdin. Note, these strings will be appended to a custom csv file within crowdin.
 *
 * @param lang - language code, must match supported project language code
 * @param jsonFilepath - path to json file in dictionary format
 * @param parentCSV - name of file to hold list of strings on crowdin. Will create if does not already exist
 */
export async function uploadJSONTranslationStrings(
  languageId: string,
  jsonFilepath: string,
  parentCSV = "all-strings.csv"
) {
  const projectStrings = await listAllProjectSourceStrings();
  // save list of strings in hashmap for more efficient lookup (as the lists could get quite long)
  // note - rest api doesn't return correct identifiers, so recreate from text
  const projectStringsHash: { [id: string]: typeof projectStrings[0] } = {};
  projectStrings.forEach(
    (s) => (projectStringsHash[_generateIDFromText(s.data.text as string)] = s)
  );
  const projectFiles = await listAllProjectFiles();
  let projectFile = projectFiles.find((f) => f.data.name === parentCSV);
  if (!projectFile) {
    projectFile = await uploadJSONTranslationPlaceholderCSV(parentCSV);
  }
  const strings = fs.readJSONSync(jsonFilepath);
  const filename = path.basename(jsonFilepath);
  const total = Object.keys(strings).length;
  const log = { count: 0, total };
  for (let [source, translation] of Object.entries<string>(strings)) {
    // remove whitespace from start and end of strings as this can be problematic later
    // (crowdin server sometimes removes, other times doesn't...)
    source = source.trim();
    translation = translation.trim();
    const identifier = _generateIDFromText(source);
    let projectString = projectStringsHash[identifier];
    if (!projectString) {
      const context = filename;
      const text = source;
      const fileId = projectFile.data.id;
      projectString = await addString({ context, text, identifier, fileId });
    }
    await stringTranslationsApi.addTranslation(PROJECT_ID, {
      languageId,
      stringId: projectString.data.id,
      text: translation,
    });
    log.count++;
    logUpdate(`[${log.count}/${log.total}] ${filename}`);
  }
}
/**
 * When uploading strings to crowdin a csv file is required on the server which
 * will hold a list of strings
 */
async function uploadJSONTranslationPlaceholderCSV(csvName: string) {
  console.log("creating placeholder csv file");
  const template = fs.readFileSync(
    `${process.cwd()}/translations/crowdin-template.csv`
  );
  const storageFile: any = await uploadStorageApi.addStorage(csvName, template);
  const importOptions: SourceFilesModel.CreateFileRequest["importOptions"] = {
    firstLineContainsHeader: true,
    importTranslations: false,
    scheme: {
      identifier: 0,
      context: 1,
      sourcePhrase: 2,
      translation: 3,
    },
  };
  return sourceFilesApi.createFile(PROJECT_ID, {
    name: csvName,
    storageId: storageFile.data.id,
    importOptions,
  });
}

/**
 * When uploading files to crowdin, first the file must be populated in general storage
 * and then allocated to the project.
 * @param storageFilename - As storage does not contain same directory structure as project,
 * it is strongly recommended to generate a unique name based on project directory to avoid being overwritten
 */
async function uploadFileToStorage(filepath: string, storageFilename?: string) {
  if (!storageFilename) {
    storageFilename = path.basename(filepath);
  }
  const filedata = fs.readFileSync(filepath);
  const storageFiles = await listAllStorageFiles();
  let storageFile = storageFiles.find(
    (f) => f.data.fileName === storageFilename
  );
  if (storageFile) {
    await uploadStorageApi.deleteStorage(storageFile.data.id);
  }
  storageFile = await uploadStorageApi.addStorage(storageFilename, filedata);
  return storageFile.data;
}
/**
 *
 */
async function linkFileToProject(
  storageFile: UploadStorageModel.Storage,
  importOptions: SourceFilesModel.CreateFileRequest["importOptions"],
  projectFilename?: string,
  projectDirectoryId?: number
) {
  if (!projectFilename) {
    projectFilename = storageFile.fileName;
  }
  // update or upload project file, clearing existing translations and approvals
  // see https://support.crowdin.com/api/v2/#operation/api.projects.files.put
  // for more scheme options/settings
  const projectFiles = await listAllProjectFiles();
  let projectFile = projectFiles.find((f) => f.data.name === projectFilename);
  if (projectFile) {
    const updateOption =
      SourceFilesModel.UpdateOption.CLEAR_TRANSLATIONS_AND_APPROVALS;
    projectFile = await sourceFilesApi.updateOrRestoreFile(
      PROJECT_ID,
      projectFile.data.id,
      {
        storageId: storageFile.id,
        updateOption,
        importOptions,
      }
    );
  } else {
    console.log("creating file", projectFilename);
    projectFile = await sourceFilesApi.createFile(PROJECT_ID, {
      name: projectFilename,
      storageId: storageFile.id,
      directoryId: projectDirectoryId ? projectDirectoryId : null,
      importOptions,
    });
  }
}

/**
 * Upload csv files containing translations (CLEARS EXISTING TRANSLATIONS/APPROVALS)
 * @remark - cannot check if file has been modified so overwrites server version regardless
 * Places in files/{lang} folder on crowdin.
 * TODO - approach has been deprecated in favour of json/string upload methods. Retaining
 * in case required in future, will need testing first
 */
export async function uploadCSVTranslationFiles(
  lang: string,
  filesDir: string
) {
  const dirs = (await sourceFilesApi.listProjectDirectories(PROJECT_ID)).data;
  let langDir = dirs.find((d) => d.data.name === lang);
  if (!langDir) {
    langDir = await sourceFilesApi.createDirectory(PROJECT_ID, { name: lang });
  }
  const filesToUpload = fs
    .readdirSync(filesDir)
    .filter((f) => f.includes(".csv"));

  for (const filename of filesToUpload) {
    const storageFilename = `${lang}_${filename}`;
    const storageFile = await uploadFileToStorage(
      `${filesDir}/filename`,
      storageFilename
    );
    const importOptions = {
      firstLineContainsHeader: true,
      importTranslations: true,
      scheme: { sourcePhrase: 0, [lang]: 1 } as any,
    };
    await linkFileToProject(storageFile, importOptions, filename);
  }
}

/****************************************************************************************
 * Custom API Methods
 * The current crowdin js library doesn't offer full support for rest api features,
 * notably use of pagination in specific queries (making it impossible to download a
 * full resource list)
 *
 * Current workaround is to call rest api endpoints directly via their integrated http
 * client (axios), and offer some helper methods to run batched requests
 ***************************************************************************************/
/**
 * Get list of all source strings for a project
 */
async function listAllProjectSourceStrings() {
  return _crowdinBatchGet<SourceStringsModel.String>(
    `projects/${PROJECT_ID}/strings`
  );
}
async function listAllStorageFiles() {
  return _crowdinBatchGet<UploadStorageModel.Storage>("storages");
}
async function listAllProjectFiles() {
  return _crowdinBatchGet<SourceFilesModel.File>(
    `projects/${PROJECT_ID}/files`
  );
}
// in place of default methods which doesn't pass context correctly
async function addString(data: SourceStringsModel.CreateStringRequest) {
  const { url, token, httpClient } = uploadStorageApi;
  return httpClient.post<ResponseObject<SourceStringsModel.String>>(
    `${url}/projects/${PROJECT_ID}/strings`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

/**
 * Recursively send requests to crowdin api for resources, and return once
 * all retrieved
 * NOTE - max limit results is 500. max limit for parallel requests is 20.
 * @param endpoint - api endpoint such as 'storages' or 'projects/.../files'
 * @param batch - current batch, used to recursively fetch full lists
 */
async function _crowdinBatchGet<T>(
  endpoint: string,
  batch: ResponseList<T> = { data: [], pagination: { offset: 0, limit: 500 } }
): Promise<ResponseObject<T>[]> {
  // get child http client from any crowdin api method
  const { url, token, httpClient } = uploadStorageApi;
  //  send paginated request
  const { limit, offset } = batch.pagination;
  const res = await httpClient.get<ResponseList<T>>(
    `${url}/${endpoint}?limit=${limit}&offset=${offset}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  res.data.forEach((el) => batch.data.push(el));
  batch.pagination.offset += limit;
  //   return results where full limit not reached (no more possible results)
  if (res.data.length < limit) {
    return batch.data;
  } else {
    return _crowdinBatchGet(endpoint, batch);
  }
}

/****************************************************************************************
 * Helper methods
 ****************************************************************************************/

/**
 * Take a given text string and generate an id by removing whitespace at start and end,
 * converting to lower case and replacing all special characters and spaces with an underscore
 */
function _generateIDFromText(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^A-Z0-9]/gi, "_");
}

async function _waitForBuildComplete(build: TranslationsModel.Build) {
  const status = await translationsApi.checkBuildStatus(PROJECT_ID, build.id);
  const { progress } = status.data;
  console.log("progress", progress);
  if (progress === 100) {
    return status;
  } else {
    await new Promise((r) => setTimeout(r, 500));
    return _waitForBuildComplete(build);
  }
}
