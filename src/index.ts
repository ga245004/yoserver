import { createServer } from "http";
import { join } from "path";
import { yo } from "./yoserver";

let [__port, __root] = ["--port", "--root"].map(a => process.argv.indexOf(a)).map(a => {
    return a !== -1 && a + 1 < process.argv.length ? process.argv[a + 1] : null
});

const port = parseInt(__port || '8080', 10)
const rootDir = join(process.cwd(), __root || './');

yo({ rootDir : rootDir}).then((yoserver) => {
    const server = createServer((req, resp) => {
        yoserver.handle(req, resp);
    })

    server.listen(port, () => {
        console.log(`Listeningat http://localhost:${port}`);
    })
});