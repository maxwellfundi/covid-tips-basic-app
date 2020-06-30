import * as fs from "fs-extra";
import * as XLSX from "xlsx";
import * as path from "path";
import * as crowdin from "./crowdin-api";
import { WorkSheet } from "xlsx/types";

const INPUT_DIR = path.join(process.cwd(), "translations/input-files");
const OUTPUT_DIR = path.join(process.cwd(), "translations/output-files");

/***************************************************************************
 * Constants used for quality control
 ***************************************************************************/
const TARGET_SHEETS = [
  "SocialMedia",
  "Tipsheet1",
  "Tipsheet2",
  "Tipsheet3",
  "Tipsheet4",
  "Tipsheet5",
  "Tipsheet6",
];

/***************************************************************************
 * Main Methods
 * This is a custom implementation to extract translation strings from
 * excel files formatted in a highly specific way for the project, including
 * quality control scripts and upload to crowdin
 ***************************************************************************/
async function main() {
  cleanOutputFolder();
  const inputFiles = listXLSXFiles(INPUT_DIR);
  for (const filename of inputFiles) {
    const xlsxFilepath = `${INPUT_DIR}/${filename}`;
    const lang = path.basename(xlsxFilepath, ".xlsx");
    await runQualityCheck(lang, xlsxFilepath);
    /* Method 1 - upload strings directly */
    createTranslationJSON(lang, xlsxFilepath);
    const translationFiles = fs
      .readdirSync(`${OUTPUT_DIR}/${lang}`)
      .filter((f) => path.extname(f) === ".json");
    for (let file of translationFiles) {
      console.log("uploading translation file", file, lang);
      await crowdin.uploadJSONTranslationStrings(
        lang,
        `${OUTPUT_DIR}/${lang}/${file}`,
        file.replace(".json", ".csv")
      );
    }

    /* Method 2 - upload csv files for conversion */
    // createTranslationCSVs(lang, xlsxFilepath);
    // await crowdin.uploadCSVTranslationFiles(lang, `${OUTPUT_DIR}/${lang}`);
  }
}

/***************************************************************************
 * Quality Control
 * Custom methods to ensure data is in the correct format for translation
 * Specifically:
 * - language code specified by filename and supported on crowdin project
 * - specific sheets exist as expected for the project
 * - columns A and B represent source:translation respectively
 ***************************************************************************/
async function runQualityCheck(lang: string, xlsxFilepath: string) {
  // TEST - filename corresponds to language code specified on crowdin
  const { targetLanguageIds } = await crowdin.getProjectMeta();
  if (!targetLanguageIds.includes(lang)) {
    logError(
      `[${lang}] not available in project languages ${targetLanguageIds}`,
      xlsxFilepath
    );
  }
  // TEST - xlsx file contains all correct sheets
  const xlsxData = XLSX.readFile(xlsxFilepath);
  for (const sheetName of TARGET_SHEETS) {
    if (!xlsxData.SheetNames.includes(sheetName)) {
      logError(`does not contain [${sheetName}]`, xlsxFilepath, sheetName);
    }
    const ws: WorkSheet = xlsxData.Sheets[sheetName];
    // TEST - Cell A1 contains 'English' as start of english translation column
    const A2Val = ws["A2"].v;
    if (A2Val !== "English") {
      logError(
        `Cell [A2] should contain [English] column header`,
        xlsxFilepath,
        sheetName
      );
    }
    // TEST - Cell B1 contains 'Translation' as start of translation column
    const B2Val = ws["B2"].v;
    if (!B2Val.includes("Translation")) {
      logError(
        `Cell [B2] should contain [Translation-] column header`,
        xlsxFilepath,
        sheetName
      );
    }
  }
}

/*********************************************************************************
 * File Export
 *
 * When working with crowdin static files can be used for translation purposes.
 * The two main options are:
 * 1. CSVs - these can hold full translation data for source/translate strings
 * in columns, and later used to generate {source:translation} json files.
 * Recommended for cases where an initial template csv populated
 *
 * 2. JSON - directly create {source:translation} dictionary files
 * Recommended for general string addition
 *
 * This project originally used JSON, then CSV, and now static strings, so most
 * of the following methods are not in use, but could be required in the future
 ***********************************************************************************/

/**
 * Convert data from xlsx to {source:translation} translation pairs
 * and write json to json-output/lang/{sheetname}.json
 */
function createTranslationJSON(lang: string, xlsxFilepath: string) {
  const xlsxData = XLSX.readFile(xlsxFilepath);
  fs.ensureDirSync(`${OUTPUT_DIR}/${lang}`);
  for (const sheetName of TARGET_SHEETS) {
    const ws: WorkSheet = xlsxData.Sheets[sheetName];
    const jsonArr = XLSX.utils.sheet_to_json(ws);
    // this produces json in format [{english:'hello',translated:'hola'}...]
    // convert into dictionary format {"hello":"hola","goodbye":"adios"}
    const dictionary: { [englishKey: string]: string } = {};
    for (var i = 2; i < 1000; i++) {
      const keyCell = ws["A" + i];
      const valueCell = ws["B" + i];
      if (
        keyCell &&
        keyCell.v &&
        keyCell.v.trim &&
        keyCell.v.trim().length > 0 &&
        valueCell &&
        valueCell.v &&
        keyCell.v.trim &&
        keyCell.v.trim().length > 0
      ) {
        dictionary[keyCell.v] = valueCell.v;
      } else {
        break;
      }
    }
    fs.writeJSONSync(`${OUTPUT_DIR}/${lang}/${sheetName}.json`, dictionary);
  }
}

/**
 * Convert data from xlsx to csv
 * and write json to csv-output/lang/{sheetname}.csv
 */
function createTranslationCSVs(lang: string, xlsxFilepath: string) {
  const xlsxData = XLSX.readFile(xlsxFilepath);
  fs.ensureDirSync(`${OUTPUT_DIR}/${lang}`);
  for (const sheetName of TARGET_SHEETS) {
    const ws = xlsxData.Sheets[sheetName];
    const csvData = XLSX.utils.sheet_to_csv(ws);
    fs.writeFileSync(`${OUTPUT_DIR}/${lang}/${sheetName}.csv`, csvData, {
      encoding: "utf-8",
    });
  }
}

/***************************************************************************
 * Helper Methods
 ***************************************************************************/
function cleanOutputFolder() {
  fs.emptyDirSync(OUTPUT_DIR);
  fs.writeFile(`${OUTPUT_DIR}/.gitkeep`, "");
}

/**
 * Generate a list of all xlsx files in the input directory,
 * excluding office temp ~$ files
 */
function listXLSXFiles(directoryPath: string) {
  return fs
    .readdirSync(directoryPath)
    .filter(
      (filename) =>
        path.extname(filename) === ".xlsx" && !filename.includes("~$")
    );
}

function logError(
  message: string,
  xlsxFilepath: string,
  sheetname: string = ""
) {
  const filename = path.basename(xlsxFilepath);
  console.error(`
  ${filename} - ${sheetname}
  ${message}
  `);
  process.exitCode = 1;
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
