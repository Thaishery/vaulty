import { Server } from './Infrastructure/Server.js';
import { AssetsRoute } from './Presentation/routes/AssetsRoute.js';
import { HomeRoute } from './Presentation/routes/HomeRoute.js';
import Sqlite3 from './Infrastructure/Sqlite3.js';
import { ShortyRoute } from './Presentation/routes/api/ShortyRoute.js';
import { CodeRoute } from './Presentation/routes/CodeRoute.js';

const PORT = parseInt(process.env.PORT, 10);
const HOST = process.env.HOST;
const DB_PATH = process.env.DB_PATH;
const db = new Sqlite3(DB_PATH);
const urlCache = new Map();

//TODO : DDD speaking -> add Repository + Aggregate (link). Also add useCases.
// useCase will be construct with the repository, route with the useCases. Pure DDD mockable. 
const server = new Server(urlCache, db);
server.addRoute(AssetsRoute.routeMethod, AssetsRoute.routePath, AssetsRoute.handle);
server.addRoute(ShortyRoute.routeMethod, ShortyRoute.routePath, ShortyRoute.handle);
server.addRoute(CodeRoute.routeMethod, CodeRoute.routePath, CodeRoute.handle);
server.addRoute(HomeRoute.routeMethod, HomeRoute.routePath, HomeRoute.handle);

server.start(PORT, HOST);

// Graceful shutdown
process.on('SIGTERM', server.stop.bind(server));
process.on('SIGINT', server.stop.bind(server));
