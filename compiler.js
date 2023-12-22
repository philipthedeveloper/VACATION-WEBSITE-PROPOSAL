const fs = require("fs");
const path = require("path");
const promisify = require("util").promisify;

const asyncReadFile = promisify(fs.readFile);
const asyncWriteFile = promisify(fs.writeFile);
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
    let writeableStream = fs.createWriteStream(outputFilePath, { flags: "a" });
    writeableStream.on("close", () => console.log("writeable stream closed"));

    writeableStream.on("next", () => {
      fileExtMatches.shift();
      if (fileExtMatches.length === 0) {
        return console.log("Task ended");
      }
      fileWriter(inputDir, fileExtMatches[0], writeableStream);
    });
    fileWriter(inputDir, fileExtMatches[0], writeableStream);
  } catch (error) {
    console.log("Error during compilation...", error);
  }
};

const fileWriter = async (inputDir, fileName, writeableStream) => {
  try {
    let filePath = path.resolve(inputDir, fileName);
    let readableStream = fs.createReadStream(filePath);

    readableStream.on("open", () => console.log("Readable stream opened.."));
    readableStream.on("data", (chunk) => {
      writeableStream.write(chunk);
    });

    readableStream.on("close", () => {
      //   writeableStream.close();
      writeableStream.emit("next");
      //   readableStream.emit("end");
    });

    readableStream.on("end", () => console.log("Readable stream ended..."));
  } catch (error) {
    console.log("Error while writing file", error);
  }
};

compiler(CURRENT_DIR, ".pdf", path.join(CURRENT_DIR, "compiled"), "proposal");
