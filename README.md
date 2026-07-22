# Vaulty

**Vaulty** est un outil de partage de secrets et de mots de passe à lecture unique (one-time secret), sécurisé et performant, écrit en Node.js natif (sans framework HTTP lourd comme Express) avec une base de données SQLite.

Le projet propose :
- Une interface web simple et intuitive pour chiffrer et partager des secrets.
- Destruction automatique du secret après première lecture (lecture unique / *burn after reading*).
- Gestion automatique de la durée de vie (TTL) et purge des secrets expirés.
- Chiffrement AES-256-GCM sécurisé des payloads en base de données.
- Un Rate Limiter (pare-feu) intégré pour protéger l'application contre les abus (voir `Firewall.js`).
- En-têtes de sécurité renforcés avec Politique de Sécurité du Contenu (CSP) stricte et nonces dynamiques.

---

## Prérequis

- [Docker](https://www.docker.com/) (avec Docker Compose)

---

## Installation et lancement local

Toutes les étapes (installation de Node.js, des dépendances et initialisation de la base de données SQLite) sont gérées automatiquement par Docker.

### Lancer l'application
Exécutez la commande suivante à la racine du projet :
```bash
docker compose up --build
```

Cette commande va :
1. Construire l'image du conteneur.
2. Installer les dépendances Node.js.
3. Initialiser la structure de la base de données SQLite (via les migrations automatiques).
4. Démarrer le serveur sur le port `3000`.

L'application sera alors accessible à l'adresse suivante : [http://localhost:3000](http://localhost:3000).

*Note : Les données de la base SQLite sont persistées localement dans le dossier `./data` de votre projet grâce au montage de volume défini dans `compose.yaml`.*

Pour exposer l'application sur internet avec un nom de domaine et un certificat SSL, vous pouvez utiliser un serveur web comme Nginx en tant que reverse proxy.

### Config Nginx reverse proxy

```nginx
# 1. Redirection HTTP vers HTTPS
server {
    listen 80;
    listen [::]:80;
    # ⚠️ À MODIFIER
    server_name YOUR_SERVER_NAME;

    # Redirection permanente vers le même lien en HTTPS
    return 301 https://$host$request_uri;
}

# 2. Configuration HTTPS et Reverse Proxy
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    # ⚠️ À MODIFIER
    server_name YOUR_SERVER_NAME;

    http2 on;

    # ⚠️ À MODIFIER : Chemins vers vos certificats SSL
    ssl_certificate YOUR_fullchain.pem;
    ssl_certificate_key YOUR_privkey.pem;

    # Optimisations SSL de base (Sécurité)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Logs (Optionnel mais recommandé)
    access_log /var/log/nginx/YOUR_SERVER_NAME.access.log;
    error_log /var/log/nginx/YOUR_SERVER_NAME.error.log;

    # Reverse Proxy vers le conteneur Node.js
    location / {
        proxy_pass http://127.0.0.1:3443;
        
        # Transmission des bons headers pour que Node sache d'où vient le trafic
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Sécurité : Évite le timeout si Node met du temps à répondre
        proxy_read_timeout 90;
    }
}
```

---

## Architecture du projet (Domain-Driven Design)

Le projet est structuré selon les principes du **Domain-Driven Design (DDD)** afin de séparer clairement les responsabilités et d'isoler la logique métier des détails techniques (frameworks, bases de données, etc.).

### 1. Couche Domaine (`src/Domain`)
C'est le cœur de l'application. Elle contient les concepts et les règles métier purs, sans aucune dépendance envers des bibliothèques externes ou des bases de données.
- **Entities & Aggregates** :
  - `Secret` : Représente le secret chiffré stocké temporairement.
- **Value Objects (VO)** : Objets immuables validant leurs règles métiers à la création :
  - `AccessSecretToken` : Valide le jeton unique permettant d'accéder au secret.
  - `SecretLookupHash` : Empreinte cryptographique de recherche (dbKey) permettant d'identifier le secret sans stocker le token en clair.
  - `EncryptedPayload` : Encapsule les données chiffrées (`ciphertext`, `iv`, `authTag`).
  - `SecretTTL` : Valide et calcule la durée de vie (Time-To-Live) et la date d'expiration du secret.
- **Interfaces (Contrats)** : Définissent les exigences du domaine pour les services externes (`SecretRepositoryInterface`, `SecretCryptoInterface`, `KeyGeneratorInterface`).

### 2. Couche Application (`src/Application`)
Elle orchestre les objets du domaine pour réaliser les cas d'utilisation métier (Use Cases) de l'application.
- **Use Cases** :
  - `CreateSecretUseCase` : Génère le token d'accès, chiffre le secret et enregistre l'entité `Secret` chiffrée.
  - `RetrieveSecretUseCase` : Récupère le secret, le supprime immédiatement en base (lecture unique destructive), vérifie son expiration et le déchiffre.
  - `CleanupExpiredSecretsUseCase` : Purge automatiquement les secrets dont le TTL est dépassé.

### 3. Couche Infrastructure (`src/Infrastructure`)
Elle fournit les implémentations concrètes des contrats définis par le domaine et gère les outils techniques.
- **Repositories** :
  - `SecretRepository` : Implémente la persistance et la suppression des secrets dans la base SQLite.
- **Services et Outils** :
  - `CryptoService` : Gère le chiffrement AES-256-GCM et la dérivation des clés cryptographiques.
  - `SecureTokenGenerator` : Génère des jetons aléatoires hautement sécurisés.
  - `Sqlite3` (gestionnaire de base de données), `Firewall` (rate-limiter d'adresses IP), et `Server` (serveur HTTP léger).

### 4. Couche Présentation (`src/Presentation`)
Gère les interfaces de communication avec l'utilisateur et les clients de l'API (HTTP, rendu HTML, CSS).
- **Routes & Contrôleurs** :
  - `SecretRoute` : Point de terminaison API `POST /api/secret` pour créer un secret.
  - `ViewSecretRoute` : Route HTML de consultation `GET /:token` qui déchiffre et affiche le secret une seule fois.
  - `HomeRoute` et `AssetsRoute` : Rendu de l'interface d'accueil et distribution des fichiers statiques.

---

## Utilisation des API

L'application expose une API simple permettant de créer des secrets de manière programmatique.

### Créer un secret
- **Méthode** : `POST`
- **Chemin** : `/api/secret`
- **En-tête** : `Content-Type: application/json`
- **Corps de la requête** :
  ```json
  {
    "secret": "MonMotDePasseTresSecret123!"
  }
  ```
- **Réponse (201 Created)** :
  ```json
  {
    "token": "a1b2c3d4e5f6g7h8i9j0",
    "secretUrl": "http://localhost:3000/a1b2c3d4e5f6g7h8i9j0"
  }
  ```

### Consulter un secret
- **Méthode** : `GET`
- **Chemin** : `/:token`
- **Description** : Renvoie la page HTML de consultation du secret. Dès la réception de la requête, le secret est déchiffré et détruit de la base de données. Toute tentative ultérieure de rechargement ou d'accès avec le même lien retournera une erreur de secret introuvable ou expiré.

