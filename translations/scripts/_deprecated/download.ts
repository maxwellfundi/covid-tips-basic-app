import * as fs from "fs-extra";
import * as path from "path";
import * as AdmZip from "adm-zip";
import * as crowdin from "../crowdin-api";
import * as papa from "papaparse";
import * as http from "https";
const OUTPUT_DIR = path.join(process.cwd(), "translations/output-files");
const APP_OUTPUT_DIR = path.join(process.cwd(), "src/assets/i18n");

/**************************************************************************************
 * DEPRECATED - 2020/06/22
 *
 * These methods were originially designed for use when manually downloading and processing
 * files from crowdin, however we are now focused on using string translation instead of
 * file-by-file translation.
 *
 * The methods are retained for future reference if required
 *
 * ************************************************************************************
 *
 * When downloading translations from crowdin, preference is to download the csv
 * files that contain full lists of strings and convert into json format.
 * This is due to the fact that pulling json lists of translations is not possible
 * without a large number of api calls.
 *
 * This method downloads all translation csvs as zip, unpacks to output-files folder,
 * and passes all individual csv files to json dictionary ({source:translation}) format
 */
async function main() {
  console.log("downloading translation files");
  const dlUrl = await crowdin.getProjectDownloadUrl();
  const zipFilePath = `${OUTPUT_DIR}/translations.zip`;
  await downloadUrlToZip(dlUrl, zipFilePath);
  unzipFile(zipFilePath);
  console.log("converting csvs");
  await convertTranslationCSVs();
  console.log("copying to app");
  copyTranslationsToApp();
  console.log("complete");
}

async function convertTranslationCSVs() {
  console.log("converting translation files");
  const langFolders = fs
    .readdirSync(OUTPUT_DIR)
    .filter((dir) => fs.statSync(`${OUTPUT_DIR}/${dir}`).isDirectory());
  for (const lang of langFolders) {
    const csvPaths = fs
      .readdirSync(`${OUTPUT_DIR}/${lang}`)
      .filter((p) => path.extname(p) === ".csv");
    for (const csvPath of csvPaths) {
      const base = `${OUTPUT_DIR}/${lang}/${csvPath}`;
      const csvData = fs.readFileSync(base, { encoding: "utf-8" });
      const jsonArr = await csvToJson<any>(csvData);
      const dict = jsonArrToDictionary(jsonArr, "sourcePhrase", "translation");
      const jsonPath = base.replace(".csv", ".json");
      fs.writeJSONSync(jsonPath, dict);
      // delete csv
      fs.removeSync(base);
    }
  }
  console.log("copying translation files");
}
function copyTranslationsToApp() {
  const langFolders = fs
    .readdirSync(OUTPUT_DIR)
    .filter((dir) => fs.statSync(`${OUTPUT_DIR}/${dir}`).isDirectory());
  for (const lang of langFolders) {
    const targetDir = path.join(APP_OUTPUT_DIR, lang);
    fs.ensureDirSync(targetDir);
    fs.emptyDirSync(targetDir);
    const jsonFiles = fs
      .readdirSync(`${OUTPUT_DIR}/${lang}`)
      .filter((f) => path.extname(f) === ".json");
    for (const file of jsonFiles) {
      const source = path.resolve(`${OUTPUT_DIR}/${lang}/${file}`);
      const dest = path.resolve(`${APP_OUTPUT_DIR}/${lang}/${file}`);
      fs.copyFile(source, dest);
    }
  }
}

function jsonArrToDictionary(arr: any[], keyField: string, valField: string) {
  const dictionary = {};
  arr.forEach((el) => (dictionary[el[keyField]] = el[valField]));
  return dictionary;
}

function csvToJson<T>(csvData: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    papa.parse<T>(csvData, {
      skipEmptyLines: true,
      header: true,
      complete: (res) => {
        if (res.errors.length > 0) {
          reject(res.errors);
        } else {
          resolve(res.data);
        }
      },
    });
  });
}

function unzipFile(filepath: string) {
  const zip = new AdmZip(filepath);
  zip.extractAllTo(`${OUTPUT_DIR}`, true);
}

async function downloadUrlToZip(url: string, outputFilePath: string) {
  const writer = fs.createWriteStream(outputFilePath);
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      res.pipe(writer);
    });
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function _readDirRecursive(
  root: string,
  dirFilter: (filename: string) => boolean = (filename) => true,
  files = [],
  prefix = ""
) {
  const dir = path.join(root, prefix);
  if (!fs.existsSync(dir)) {
    return files;
  }
  if (fs.statSync(dir).isDirectory()) {
    fs.readdirSync(dir)
      .filter((name) => {
        return dirFilter(name);
      })
      .forEach((name) => {
        _readDirRecursive(root, dirFilter, files, path.join(prefix, name));
      });
  } else {
    files.push(prefix);
  }

  return files;
}
main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
