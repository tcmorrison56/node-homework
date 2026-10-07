const os = require("os");
const path = require("path");
const fs = require("fs");

const sampleFilesDir = path.join(__dirname, "sample-files");
if (!fs.existsSync(sampleFilesDir)) {
  fs.mkdirSync(sampleFilesDir, { recursive: true });
}

// OS module
console.log(`Platform: ${os.platform()}`);
console.log(`CPU: ${os.cpus()[0].model}`);
console.log(`Total Memory: ${os.totalmem()}`);

// Path module
const demoFile = path.join(sampleFilesDir, "demo.txt");
console.log(`Joined path: ${demoFile}`);

// fs.promises API

fs.promises
  .writeFile(demoFile, "Hello from fs.promises!")
  .then(() => fs.promises.readFile(demoFile, "UTF8"))
  .then((data) => console.log("fs.promises read:", data))
  .catch((err) => console.log(err));

// Streams for large files- log first 40 chars of each chunk
const largeFilePath = path.join(sampleFilesDir, "largefile.txt");
let content = "";
for (let i = 0; i < 100; i++) {
  content =
    content +
    "This is a line in a large file that will be read using streams.\n";
}
fs.writeFileSync(largeFilePath, content);

const readStream = fs.createReadStream(largeFilePath, {
  encoding: "UTF8",
  highWaterMark: 1000,
});

readStream.on("data", (chunk) => {
  console.log("Read chunk:", chunk.slice(0, 40));
});
readStream.on("end", () => {
  console.log("Finished reading large file with streams.");
});
readStream.on("error", (err) => {
  console.log("Error reading file:", err.message);
});
