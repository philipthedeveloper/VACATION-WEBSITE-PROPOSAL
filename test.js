const fs = require("fs");
const path = require("path");

const readableStream = fs.createReadStream(path.join(__dirname, "test.txt"));
const writeableStream = fs.createWriteStream(
  path.join(__dirname, "output.txt"),
  { flags: "a" }
);

readableStream.on("data", (chunk) => {
  writeableStream.write(chunk);
});

readableStream.on("error", (err) => {
  console.log("Error while writing file...");
});
