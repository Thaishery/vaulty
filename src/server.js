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
import { CryptoService } from './Infrastructure/Services/CryptoService.js';
import SecretRepository from './Infrastructure/Repository/SecretRepository.js';
import CreateSecretUseCase from './Application/UseCases/CreateSecretUseCase.js';
import RetrieveSecretUseCase from './Application/UseCases/RetrieveSecretUseCase.js';
import CleanupExpiredSecretsUseCase from './Application/UseCases/CleanupExpiredSecretsUseCase.js';
import { RobotsRoute } from './Presentation/Routes/RobotsRoute.js';
import { Firewall } from './Infrastructure/Firewall.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DB_PATH = process.env.DB_PATH || './data/vaulty.db';

// Pre-load static HTML templates to avoid blocking I/O on request handling
const indexHtmlContent = fs.readFileSync(path.join(__dirname, 'html', 'index.html'), 'utf8');
const secretHtmlContent = fs.readFileSync(path.join(__dirname, 'html', 'secret.html'), 'utf8');

const db = new Sqlite3(DB_PATH);
await db.connect();
const firewall = new Firewall();
const keyGenerator = new SecureTokenGenerator();
const cryptoService = new CryptoService();
const secretRepository = new SecretRepository(db);
const createSecretUseCase = new CreateSecretUseCase(secretRepository, keyGenerator, cryptoService);
const retrieveSecretUseCase = new RetrieveSecretUseCase(secretRepository, cryptoService);
const cleanupExpiredSecretsUseCase = new CleanupExpiredSecretsUseCase(secretRepository);

// Run initial cleanup of secrets on startup using domain default SecretTTL (365 days)
await cleanupExpiredSecretsUseCase.execute();
// Schedule cleanup task to run every 24 hours (24 * 60 * 60 * 1000 ms)
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
const cleanupInterval = setInterval(() => {
    cleanupExpiredSecretsUseCase.execute();
}, CLEANUP_INTERVAL_MS);

const secretRoute = new SecretRoute(createSecretUseCase);
const viewSecretRoute = new ViewSecretRoute(retrieveSecretUseCase, secretHtmlContent);
const homeRoute = new HomeRoute(indexHtmlContent);

const server = new Server(db, firewall);
server.addRoute(AssetsRoute.routeMethod, AssetsRoute.routePath, AssetsRoute.handle);
server.addRoute(RobotsRoute.routeMethod, RobotsRoute.routePath, RobotsRoute.handle);
server.addRoute(SecretRoute.routeMethod, SecretRoute.routePath, secretRoute.handle.bind(secretRoute));
server.addRoute(ViewSecretRoute.routeMethod, ViewSecretRoute.routePath, viewSecretRoute.handle.bind(viewSecretRoute));
server.addRoute(HomeRoute.routeMethod, HomeRoute.routePath, homeRoute.handle.bind(homeRoute));

server.start(PORT, HOST);

// Graceful shutdown
process.on('SIGTERM', () => {
    clearInterval(cleanupInterval);
    server.stop();
});
process.on('SIGINT', () => {
    clearInterval(cleanupInterval);
    server.stop();
});
