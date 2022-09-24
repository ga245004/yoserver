var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "crypto", "fs/promises", "path", "url", "./dirEntries.html", "./favico"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.yo = exports.MineTypes = void 0;
    const crypto_1 = require("crypto");
    const promises_1 = require("fs/promises");
    const path_1 = require("path");
    const url_1 = require("url");
    const dirEntries_html_1 = require("./dirEntries.html");
    const favico_1 = require("./favico");
    exports.MineTypes = {
        ".css": "text/css; charset=utf-8",
        ".htm": "text/html; charset=utf-8",
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".png": "image/png",
        ".svg": "image/svg+xml",
        ".ttf": "font/ttf",
        ".txt": "text/plain; charset=utf-8",
        ".wasm": "application/wasm",
        ".map": ""
    };
    const yo = (options) => __awaiter(void 0, void 0, void 0, function* () {
        const rootDir = (0, path_1.normalize)(options.rootDir || process.cwd());
        const useETag = typeof options.etag !== "undefined" ? options.etag : true;
        const expires = typeof options.expires != "undefined" ? options.expires : (5 * 1000);
        const notFound = (_request, _response, type = '') => __awaiter(void 0, void 0, void 0, function* () {
            _response.writeHead(404, 'Not Found');
            _response.end(`Not Found${type ? ` - ${type}` : ''}`);
        });
        const sendFile = (_request, _response, extension, content) => __awaiter(void 0, void 0, void 0, function* () {
            const headers = {};
            if (typeof exports.MineTypes[extension] !== 'undefined') {
                headers['Content-Type'] = exports.MineTypes[extension];
            }
            else {
                console.log(`Unhandled mime-type for ext name: ${extension}`);
            }
            if (expires) {
                headers['Expires'] = new Date(Date.now() + expires).toUTCString();
            }
            if (useETag) {
                const etag = (0, crypto_1.createHash)("md5").update(content).digest("hex");
                headers["Etag"] = etag;
                if (_request.headers['if-none-match'] === etag) {
                    _response.writeHead(304, 'Not modified', headers);
                    _response.end();
                    return;
                }
            }
            headers['Content-Length'] = content.byteLength;
            _response.writeHead(200, 'Ok', headers);
            _response.end(content);
        });
        const redirect = (_request, _response, location) => __awaiter(void 0, void 0, void 0, function* () {
            _response.writeHead(302, 'Found', {
                'Location': location
            });
            _response.end(`Location: ${location}`);
        });
        const sendDir = (_request, _response, dirpath, entries) => __awaiter(void 0, void 0, void 0, function* () {
            const relativePath = '/' + (0, path_1.relative)(rootDir, dirpath).replace(/\\/g, '/');
            const dirEntries = entries.sort((a, b) => {
                const aIsDir = a.isDirectory() ? 0 : 1;
                const bIsDir = b.isDirectory() ? 0 : 1;
                if (aIsDir === bIsDir) {
                    return a.name.localeCompare(b.name);
                }
                return aIsDir - bIsDir;
            }).map(d => ({
                name: d.name,
                isDirectory: d.isDirectory()
            }));
            return sendFile(_request, _response, '.html', Buffer.from((0, dirEntries_html_1.dirEntriesHtml)({
                relativePath,
                entries: dirEntries
            })));
        });
        const doHandle = (_request, _response) => __awaiter(void 0, void 0, void 0, function* () {
            const { method, url } = _request;
            if (method !== 'GET' || !url)
                return notFound(_request, _response, '1');
            const { pathname } = (0, url_1.parse)(url);
            if (!pathname)
                return notFound(_request, _response, '2');
            const requestedPath = (0, path_1.normalize)((0, path_1.join)(rootDir, pathname));
            if (!requestedPath.startsWith(rootDir))
                return notFound(_request, _response, '3');
            const content = yield safeReadFile(requestedPath);
            if (content) {
                return sendFile(_request, _response, (0, path_1.extname)(requestedPath), content);
            }
            if (requestedPath === (0, path_1.join)(rootDir, 'favicon.ico')) {
                return sendFile(_request, _response, (0, path_1.extname)(requestedPath), Buffer.from(favico_1.favico, 'base64'));
            }
            const stats = yield (0, promises_1.stat)(requestedPath);
            if (!stats || !stats.isDirectory())
                return notFound(_request, _response, '4');
            let expectedRequestPath = `${(0, path_1.relative)(rootDir, requestedPath).replace(/\\/g, '/')}/`;
            if (expectedRequestPath.charAt(0) !== '/') {
                expectedRequestPath = `/${expectedRequestPath}`;
            }
            if (pathname !== expectedRequestPath) {
                return redirect(_request, _response, expectedRequestPath);
            }
            const indexPath = (0, path_1.normalize)((0, path_1.join)(requestedPath, 'index.html'));
            const indexContent = yield safeReadFile(indexPath);
            if (indexContent) {
                return sendFile(_request, _response, (0, path_1.extname)(indexPath), indexContent);
            }
            const dirEntries = yield (0, promises_1.readdir)(requestedPath, { withFileTypes: true });
            if (dirEntries) {
                return sendDir(_request, _response, requestedPath, dirEntries);
            }
            return notFound(_request, _response, '5');
        });
        return {
            handle: (_request, _response) => {
                doHandle(_request, _response).then(undefined, err => {
                    console.log(err);
                    _response.writeHead(500, "Internal Server Error");
                    _response.end("Internal Server Error");
                });
            }
        };
    });
    exports.yo = yo;
    const safeReadFile = (path) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield (0, promises_1.readFile)(path);
        }
        catch (error) {
            return null;
        }
    });
});
