# Node.js Fundamentals

## What is Node.js?

Node is a JavaScript runtime that can execute JavaScript code outside of the browser environment. It's built on Google's V8 engine wrapped in extra functionality, and it can access things like files, the network, and operating system. Node excels with I/O heavy tasks, but doesn't handle CPU intensive tasks as well. Another reason for Node's popularity is that it allows front end code and backend code to be written in the same language.

## How does Node.js differ from running JavaScript in the browser?

Node runs outside of the browser sandbox. This means that it does not have access to things like Window, Document, or browser storage, and cannot do DOM manipulation. However it does provide backend tools instead. Things like file system access, process information, environment variables, command line arguments, Networking APIs,a nd built in modules like fs, http, path, and os. Because Node is running on a server and not in a browser it can safely use secrets.

## What is the V8 engine, and how does Node use it?

The V8 engine is the engine developed by Google to run JavaScript in the Chrome browser. Node uses V8

## What are some key use cases for Node.js?

Some key use cases for Node.js are web servers and APIs to listen for requests and send back pages or JSON data, command line tools and scripts, and working with databases that are heavy with I/O tasks.

## Explain the difference between CommonJS and ES Modules. Give a code example of each.

**CommonJS (default in Node.js):**
CommonJS is the default node syntax for importing and exporting dependencies.

```js
const fs = require("fs");
module.exports = { functionA, functionB };
```

**ES Modules (supported in modern Node.js):**
ES Modules are the standard syntax used in browser JS, added in the 2015 release of ES6, and can be used in Node either by using the .mjs file extension or by adding the type: module to the package.json file.

```js
import fs from 'fs'
export functionA
```
