const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "sample-files", "sample.txt");
// const callbackPath = path.join(__dirname, "sample-files", "callback.txt");

// Write a sample file for demonstration
fs.writeFileSync(filePath, "Hello, async world!");

// 1. Callback style
fs.readFile(filePath, "UTF8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Callback:", data);
});

// Callback hell example (test and leave it in comments):
/* Callback hell is when a callback function calls another function or operation that passes a new callback, and then that callback can call another function or operation, and so on. This can lead to a very confusing flow because each new callback is a layer deeper into the nested functions. It can also lead to repetitive code like the need to handle errors at each level*/
/* fs.writeFile(callbackPath, "Hello, callback hell", "UTF8", (err) => {
  if (err) {
    console.log(err);
    return;
  }
  fs.readFile(callbackPath, "UTF8", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(data);
  });
}); */

// 2. Promise style
fs.promises
  .readFile(filePath, "UTF8")
  .then((data) => console.log("Promise:", data))
  .catch((err) => console.log(err));

// 3. Async/Await style
async function run() {
  try {
    const data = await fs.promises.readFile(filePath, "UTF8");
    console.log("Async/Await:", data);
  } catch (err) {
    console.log(err);
  }
}

run();
