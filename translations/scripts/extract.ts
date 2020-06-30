import { spawnSync } from "child_process";
import * as path from "path";
import * as fs from "fs-extra";

const TIP_SHEETS_CONTENT_DIR = "./src/app/tip-sheets/content";
const I18N_DIR = "./src/assets/i18n";
const TRANSLATE_BIN_PATH = path.resolve(
  process.cwd(),
  "node_modules/.bin/ngx-translate-extract"
);
const PRETTIER_BIN_PATH = path.resolve(
  process.cwd(),
  "node_modules/.bin/prettier"
);

/*********************************************************************************
 * This script extracts all strings from the src directory of the project,
 * with additional customisation of splitting files used in tip sheets content
 * as individual json files, and a single json file for the rest of app content.
 *********************************************************************************/
function main() {
  extractStringsByTipSheet();
  extractOtherAppStrings();
  copyEnTranslations();
  formatJSONFiles();
}
main();

/**
 * Extract strings from tip sheets into individual files for translation
 */
function extractStringsByTipSheet() {
  const sheetFiles = fs
    .readdirSync(TIP_SHEETS_CONTENT_DIR)
    .filter((f) => path.extname(f) === ".html");
  // extract individual tip sheet html files
  for (let file of sheetFiles) {
    const outFile = `${I18N_DIR}/${file.replace(".html", ".json")}`;
    spawnSync(
      `${TRANSLATE_BIN_PATH} --input ${TIP_SHEETS_CONTENT_DIR}/${file} --output ${outFile} --key-as-default-value --replace --format-indentation "  "`,
      { shell: true, stdio: "inherit" }
    );
  }
}

/**
 * Extract strings from all files that are not tip-sheets to single app-strings file
 * As there is no nice way to exclude a folder from input glob (only file type), move
 * the folder before generating, and then move back
 */
function extractOtherAppStrings() {
  // move tips content so not read by extraction
  fs.moveSync(TIP_SHEETS_CONTENT_DIR, "./tip-sheets-content-tmp");
  // extract all strings
  const outFile = "./src/assets/i18n/app-strings.json";
  spawnSync(
    `${TRANSLATE_BIN_PATH} --input ./src --output ${outFile} --key-as-default-value --replace --format-indentation "  "`,
    { shell: true, stdio: "inherit" }
  );
  // move tip sheets content back
  fs.moveSync("./tip-sheets-content-tmp", TIP_SHEETS_CONTENT_DIR);
}

/**
 * Use the base translation files to populate an `en` folder also for consistency when loading language files
 */
function copyEnTranslations() {
  const translationFiles = fs
    .readdirSync(I18N_DIR)
    .filter((f) => path.extname(f) === ".json");
  for (let filename of translationFiles) {
    fs.copySync(`${I18N_DIR}/${filename}`, `${I18N_DIR}/en/${filename}`);
  }
}

function formatJSONFiles() {
  spawnSync(`${PRETTIER_BIN_PATH} ${I18N_DIR}/**/*.json --write`, {
    shell: true,
    stdio: "inherit",
  });
}
