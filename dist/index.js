(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "http", "path", "./yoserver"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const http_1 = require("http");
    const path_1 = require("path");
    const yoserver_1 = require("./yoserver");
    let [__port, __root] = ["--port", "--root"].map(a => process.argv.indexOf(a)).map(a => {
        return a !== -1 && a + 1 < process.argv.length ? process.argv[a + 1] : null;
    });
    const port = parseInt(__port || '8080', 10);
    const rootDir = (0, path_1.join)(process.cwd(), __root || './');
    (0, yoserver_1.yo)({ rootDir: rootDir }).then((yoserver) => {
        const server = (0, http_1.createServer)((req, resp) => {
            yoserver.handle(req, resp);
        });
        server.listen(port, () => {
            console.log(`Listeningat http://localhost:${port}`);
        });
    });
});
