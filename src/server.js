import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from './Infrastructure/Server.js';
import { AssetsRoute } from './Presentation/Routes/AssetsRoute.js';
import { HomeRoute } from './Presentation/Routes/HomeRoute.js';
import Sqlite3 from './Infrastructure/Sqlite3.js';
import { SecretRoute } from './Presentation/Routes/Api/SecretRoute.js';
import { ViewSecretRoute } from './Presentation/Routes/ViewSecretRoute.js';
import { SecureTokenGenerator } from './Infrastructure/Services/SecureTokenGenerator.js';
import SecretRepository from './Infrastructure/Repository/SecretRepository.js';
import CachedSecretRepository from './Infrastructure/Repository/CachedSecretRepository.js';
import CreateSecretUseCase from './Application/UseCases/CreateSecretUseCase.js';
import RetrieveSecretUseCase from './Application/UseCases/RetrieveSecretUseCase.js';
import UrlCache from './Infrastructure/UrlCache.js';
import { Firewall } from './Infrastructure/Firewall.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT, 10);
const HOST = process.env.HOST;
const DB_PATH = process.env.DB_PATH;

// Pre-load static HTML templates to avoid blocking I/O on request handling
const indexHtmlContent = fs.readFileSync(path.join(__dirname, 'html', 'index.html'), 'utf8');
const secretHtmlContent = fs.readFileSync(path.join(__dirname, 'html', 'secret.html'), 'utf8');

const db = new Sqlite3(DB_PATH);
await db.connect();
const urlCache = new UrlCache();
const firewall = new Firewall();
const keyGenerator = new SecureTokenGenerator();
const rawSecretRepository = new SecretRepository(db);
const secretRepository = new CachedSecretRepository(rawSecretRepository, urlCache);
const createSecretUseCase = new CreateSecretUseCase(secretRepository, keyGenerator);
const retrieveSecretUseCase = new RetrieveSecretUseCase(secretRepository);

const secretRoute = new SecretRoute(createSecretUseCase);
const viewSecretRoute = new ViewSecretRoute(retrieveSecretUseCase, secretHtmlContent);
const homeRoute = new HomeRoute(indexHtmlContent);

const server = new Server(db, firewall);
server.addRoute(AssetsRoute.routeMethod, AssetsRoute.routePath, AssetsRoute.handle);
server.addRoute(SecretRoute.routeMethod, SecretRoute.routePath, secretRoute.handle.bind(secretRoute));
server.addRoute(ViewSecretRoute.routeMethod, ViewSecretRoute.routePath, viewSecretRoute.handle.bind(viewSecretRoute));
server.addRoute(HomeRoute.routeMethod, HomeRoute.routePath, homeRoute.handle.bind(homeRoute));

server.start(PORT, HOST);

// Graceful shutdown
process.on('SIGTERM', server.stop.bind(server));
process.on('SIGINT', server.stop.bind(server));
