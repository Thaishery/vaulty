import { Server } from './Infrastructure/Server.js';
import { AssetsRoute } from './Presentation/routes/AssetsRoute.js';
import { HomeRoute } from './Presentation/routes/HomeRoute.js';
import Sqlite3 from './Infrastructure/Sqlite3.js';
import { ShortyRoute } from './Presentation/routes/api/ShortyRoute.js';
import { CodeRoute } from './Presentation/routes/CodeRoute.js';
import { KeyGenerator } from './Domain/Links/KeyGenerator.js';
import LinkFactory from './Domain/Links/LinkFactory.js';
import LinkRepository from './Infrastructure/Repository/LinkRepository.js';
import ShortenUrlUseCase from './Application/UseCases/ShortenUrlUseCase.js';
import RedirectUrlUseCase from './Application/UseCases/RedirectUrlUseCase.js';

const PORT = parseInt(process.env.PORT, 10);
const HOST = process.env.HOST;
const DB_PATH = process.env.DB_PATH;
const db = new Sqlite3(DB_PATH);
const urlCache = new Map();

const keyGenerator = new KeyGenerator();
const linkFactory = new LinkFactory(keyGenerator);
const linkRepository = new LinkRepository(db, urlCache);
const shortenUrlUseCase = new ShortenUrlUseCase(linkRepository, linkFactory);
const redirectUrlUseCase = new RedirectUrlUseCase(linkRepository);
const shortyRoute = new ShortyRoute(shortenUrlUseCase);
const codeRoute = new CodeRoute(redirectUrlUseCase);

const server = new Server(urlCache, db);
server.addRoute(AssetsRoute.routeMethod, AssetsRoute.routePath, AssetsRoute.handle);
server.addRoute(ShortyRoute.routeMethod, ShortyRoute.routePath, shortyRoute.handle.bind(shortyRoute));
server.addRoute(CodeRoute.routeMethod, CodeRoute.routePath, codeRoute.handle.bind(codeRoute));
server.addRoute(HomeRoute.routeMethod, HomeRoute.routePath, HomeRoute.handle);

server.start(PORT, HOST);

// Graceful shutdown
process.on('SIGTERM', server.stop.bind(server));
process.on('SIGINT', server.stop.bind(server));
