import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Server } from '../../Infrastructure/Server.js';

const PORT = parseInt(process.env.PORT, 10);
const HOST = process.env.HOST;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const relativeAssetPath = "../../assets";

export class AssetsRoute {
    static routePath = "/assets/";
    static routeMethod = "GET";
    
    static async handle(req, res) {
        const url = new URL(req.url, `http://${HOST}:${PORT}`);
        const pathname = url.pathname;
        let safeSuffix;
        try {
            safeSuffix = decodeURIComponent(pathname.substring(8)); // '/assets/'.length is 8
        } catch (e) {
            return Server.sendJSON(res, 400, { error: 'Bad Request', message: 'Invalid URL encoding' });
        }
    
        const assetsDir = path.join(__dirname, relativeAssetPath);
        const filePath = path.normalize(path.join(assetsDir, safeSuffix));
    
        const isSafe = filePath.startsWith(assetsDir + path.sep) || filePath === assetsDir;
        if (!isSafe) {
            return Server.sendJSON(res, 403, { error: 'Forbidden', message: 'Access denied' });
        }
    
        fs.stat(filePath, (err, stats) => {
            if (err || !stats.isFile()) {
            return Server.sendJSON(res, 404, { error: 'Not Found', message: 'Asset not found' });
            }
    
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.json': 'application/json',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.otf': 'font/otf'
            };
    
            const contentType = mimeTypes[ext] || 'application/octet-stream';
    
            res.writeHead(200, {
                'Content-Type': contentType,
            });
    
            const stream = fs.createReadStream(filePath);
            stream.on('error', (streamErr) => {
            console.error('Error reading asset file:', streamErr.message);
            if (!res.headersSent) {
                Server.sendJSON(res, 500, { error: 'Internal Server Error', message: 'Could not serve asset' });
            }
            });
            return stream.pipe(res);
        });
        return;
    }

}