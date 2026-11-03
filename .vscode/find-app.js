const fs = require("fs");
const path = require("path");

const match = process.cwd().match(/^\/workspace\/([^/]+)/);
if (match) {
    const appJs = path.join("/workspace", match[1], "app.js");

    if (fs.existsSync(appJs)) {
        console.log(`\n=== Launching ${appJs} ===\n`);
        require(appJs);
        return;
    }
}

throw new Error("app.js not found in current project folder");