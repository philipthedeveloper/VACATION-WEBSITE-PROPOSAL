const PDFMerge = require("pdf-merge");

const fs = require("fs");
const path = require("path");
const promisify = require("util").promisify;

const asyncMakeDir = promisify(fs.mkdir);
const asyncReadDir = promisify(fs.readdir);
const CURRENT_DIR = __dirname;

const directoryReader = async (dirPath) => {
  try {
    let result = await asyncReadDir(dirPath);
    return result;
  } catch (error) {
    console.log("An error occurred while reading dir...", error);
  }
};

function joinPDFs(inputPaths, outputPath) {
  const merge = PDFMerge(inputPaths);
  const mergedStream = merge.asBuffer();

  const outputStream = fs.createWriteStream(outputPath);
  mergedStream.pipe(outputStream);

  outputStream.on("finish", () => {
    console.log("PDF files joined successfully!");
  });

  outputStream.on("error", (error) => {
    console.error("An error occurred:", error);
  });
}

const compiler = async (
  inputDir,
  fileExt,
  outputDir = CURRENT_DIR,
  outputFileName = "output"
) => {
  try {
    const files = await directoryReader(inputDir);
    const fileExtMatches = files.filter((file) => file.endsWith(fileExt));
    fileExtMatches.sort((a, b) => a - b);
    let outputFilePath = path.resolve(outputDir, `${outputFileName}${fileExt}`);
    const dirExist = fs.existsSync(outputDir);
    if (!dirExist) await asyncMakeDir(outputDir);
    joinPDFs(fileExtMatches, outputFilePath);
  } catch (err) {
    console.log("Error during merging...", err);
  }
};

compiler(CURRENT_DIR, ".pdf", path.join(CURRENT_DIR, "compiled"), "proposal");
