import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from './Infrastructure/Server.js';
import { AssetsRoute } from './Presentation/routes/AssetsRoute.js';
import { HomeRoute } from './Presentation/routes/HomeRoute.js';
import Sqlite3 from './Infrastructure/Sqlite3.js';
import { ShortyRoute } from './Presentation/routes/api/ShortyRoute.js';
import { CodeRoute } from './Presentation/routes/CodeRoute.js';
import { TimeBasedKeyGenerator } from './Infrastructure/Services/TimeBasedKeyGenerator.js';
import LinkRepository from './Infrastructure/Repository/LinkRepository.js';
import CachedLinkRepository from './Infrastructure/Repository/CachedLinkRepository.js';
import ShortenUrlUseCase from './Application/UseCases/ShortenUrlUseCase.js';
import RedirectUrlUseCase from './Application/UseCases/RedirectUrlUseCase.js';
import UrlCache from './Infrastructure/UrlCache.js';
import { Firewall } from './Infrastructure/Firewall.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT, 10);
const HOST = process.env.HOST;
const DB_PATH = process.env.DB_PATH;

// Pre-load static HTML templates to avoid blocking I/O on request handling
const indexHtmlContent = fs.readFileSync(path.join(__dirname, 'html', 'index.html'), 'utf8');
const previewHtmlContent = fs.readFileSync(path.join(__dirname, 'html', 'preview.html'), 'utf8');

const db = new Sqlite3(DB_PATH);
await db.connect();
const urlCache = new UrlCache();
const firewall = new Firewall();
const keyGenerator = new TimeBasedKeyGenerator();
const rawLinkRepository = new LinkRepository(db);
const linkRepository = new CachedLinkRepository(rawLinkRepository, urlCache);
const shortenUrlUseCase = new ShortenUrlUseCase(linkRepository, keyGenerator);
const redirectUrlUseCase = new RedirectUrlUseCase(linkRepository);

const shortyRoute = new ShortyRoute(shortenUrlUseCase);
const codeRoute = new CodeRoute(redirectUrlUseCase, previewHtmlContent);
const homeRoute = new HomeRoute(indexHtmlContent);

const server = new Server(db, firewall);
server.addRoute(AssetsRoute.routeMethod, AssetsRoute.routePath, AssetsRoute.handle);
server.addRoute(ShortyRoute.routeMethod, ShortyRoute.routePath, shortyRoute.handle.bind(shortyRoute));
server.addRoute(CodeRoute.routeMethod, CodeRoute.routePath, codeRoute.handle.bind(codeRoute));
server.addRoute(HomeRoute.routeMethod, HomeRoute.routePath, homeRoute.handle.bind(homeRoute));

server.start(PORT, HOST);

// Graceful shutdown
process.on('SIGTERM', server.stop.bind(server));
process.on('SIGINT', server.stop.bind(server));
