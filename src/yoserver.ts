import { createHash } from "crypto";
import { Dirent } from "fs";
import { readdir, readFile, stat } from "fs/promises";
import { IncomingMessage, ServerResponse } from "http"
import { extname, join, normalize, relative, sep } from "path";
import { parse } from "url";
import { dirEntriesHtml } from "./dirEntries.html";
import { favico } from "./favico";

export const MineTypes: { [extname: string]: string } = {
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
}

export interface IYoServerOptions {
    rootDir?: string;
    etag?: boolean;
    expires?: number;
}

export interface IYoServer {
    handle(request: IncomingMessage, response: ServerResponse): void
}

export const yo = async (options: IYoServerOptions): Promise<IYoServer> => {

    const rootDir = normalize(options.rootDir || process.cwd());
    const useETag = typeof options.etag !== "undefined" ? options.etag : true;
    const expires = typeof options.expires != "undefined" ? options.expires : (5 * 1000); //5sec 


    const notFound = async (_request: IncomingMessage, _response: ServerResponse, type = '') => {
        _response.writeHead(404, 'Not Found');
        _response.end(`Not Found${type ? ` - ${type}` : ''}`);
    }

    const sendFile = async (_request: IncomingMessage, _response: ServerResponse, extension: string, content: Buffer) => {
        const headers: { [header: string]: any } = {};
        if (typeof MineTypes[extension] !== 'undefined') {
            headers['Content-Type'] = MineTypes[extension];
        }
        else {
            console.log(`Unhandled mime-type for ext name: ${extension}`);
        }
        if (expires) {
            headers['Expires'] = new Date(Date.now() + expires).toUTCString();
        }

        if (useETag) {
            const etag = createHash("md5").update(content).digest("hex")
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
    }

    const redirect = async (_request: IncomingMessage, _response: ServerResponse, location: string,) => {
        _response.writeHead(302, 'Found', {
            'Location': location
        });
        _response.end(`Location: ${location}`);
    }

    const sendDir = async (_request: IncomingMessage, _response: ServerResponse, dirpath: string, entries: Dirent[]) => {
        const relativePath = '/' + relative(rootDir, dirpath).replace(/\\/g, '/');
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

        return sendFile(_request, _response, '.html', Buffer.from(dirEntriesHtml({
            relativePath,
            entries: dirEntries
        })))
    }

    const doHandle = async (_request: IncomingMessage, _response: ServerResponse) => {
        const { method, url } = _request;
        if (method !== 'GET' || !url) return notFound(_request, _response, '1');
        const { pathname } = parse(url);
        if (!pathname) return notFound(_request, _response, '2');
        const requestedPath = normalize(join(rootDir, pathname));
        if (!requestedPath.startsWith(rootDir)) return notFound(_request, _response, '3');

        const content = await safeReadFile(requestedPath);
        if (content) {
            return sendFile(_request, _response, extname(requestedPath), content);
        }

        if (requestedPath === join(rootDir, 'favicon.ico')) {
            return sendFile(_request, _response, extname(requestedPath), Buffer.from(favico, 'base64'));
        }

        const stats = await stat(requestedPath);
        if (!stats || !stats.isDirectory()) return notFound(_request, _response, '4');

        let expectedRequestPath = `${relative(rootDir, requestedPath).replace(/\\/g, '/')}/`;
        if (expectedRequestPath.charAt(0) !== '/') {
            expectedRequestPath = `/${expectedRequestPath}`;
        }
        if (pathname !== expectedRequestPath) {
            return redirect(_request, _response, expectedRequestPath);
        }

        const indexPath = normalize(join(requestedPath, 'index.html'));
        const indexContent = await safeReadFile(indexPath);
        if (indexContent) {
            return sendFile(_request, _response, extname(indexPath), indexContent);
        }

        const dirEntries = await readdir(requestedPath, { withFileTypes: true });
        if (dirEntries) {
            return sendDir(_request, _response, requestedPath, dirEntries)
        }
        return notFound(_request, _response, '5')

    }

    return {
        handle: (_request: IncomingMessage, _response: ServerResponse) => {
            doHandle(_request, _response).then(undefined, err => {
                console.log(err);
                _response.writeHead(500, "Internal Server Error");
                _response.end("Internal Server Error");
            })
        }
    }
}

const safeReadFile = async (path: string) => {
    try {
        return await readFile(path);
    } catch (error) {
        return null;
    }
}