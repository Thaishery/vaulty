# Shorty

**Shorty** est un raccourcisseur d'URL simple, sécurisé et performant écrit en Node.js natif (sans framework HTTP lourd comme Express) avec une base de données SQLite.

Le projet propose :
- Une interface web.
- Génération de QR Codes pour télécharger ou partager les liens raccourcis.
- Un Rate Limiter (pare-feu) intégré pour protéger l'application contre les abus. (voir Firewall.js)
- En cas de détection d'un Agent Utilisateur Discord et détection d'Instagram, affichage d'une prévisualisation du lien (voir src/Domain/Links/RedirectionPolicy.js & src/Presentation/routes/CodeRoute.js).

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
3. Initialiser la structure de la base de données SQLite (via la migration automatique).
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
        proxy_pass http://127.0.0.1:3000;
        
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
  - `Link` : Représente le concept central d'un lien raccourci. Il est identifiable de manière unique par son `ShortCodeVo`.
- **Value Objects (VO)** : Objets immuables validant leurs règles métiers (invariants) à la création :
  - `OriginalUrlVo` : Valide la présence, la longueur (< 2048 caractères), le format et les protocoles autorisés (`http` / `https`).
  - `ShortCodeVo` : Valide le code unique généré pour l'URL.
  - `ClientAgentVo` : Encapsule les informations de l'agent utilisateur (User-Agent) effectuant la requête.
- **Policies** :
  - `RedirectionPolicy` : Encapsule la règle métier déterminant si la redirection nécessite l'affichage d'une prévisualisation (ex: intégration Instagram pour Discordbot).
- **Interfaces (Contrats)** : Définissent les exigences du domaine pour des services externes (`LinkRepositoryInterface`, `KeyGeneratorInterface`).

### 2. Couche Application (`src/Application`)
Elle orchestre les objets du domaine pour réaliser les cas d'utilisation métier (Use Cases) de l'application.
- **Use Cases** :
  - `ShortenUrlUseCase` : Coordonne la création d'un code unique, l'instanciation de l'entité `Link` et sa persistance.
  - `RedirectUrlUseCase` : Récupère le lien raccourci et applique la `RedirectionPolicy` pour déterminer le type de redirection à renvoyer.

### 3. Couche Infrastructure (`src/Infrastructure`)
Elle fournit les implémentations concrètes des contrats définis par le domaine et gère les outils techniques.
- **Repositories** :
  - `LinkRepository` : Implémente la persistance dans la base SQLite.
  - `CachedLinkRepository` : Un décorateur de repository qui encapsule `LinkRepository` pour lui adjoindre une stratégie de mise en cache rapide en mémoire via `UrlCache`.
- **Services et Outils** : `Sqlite3` (gestionnaire de connexion), `Firewall` (rate-limiter d'adresses IP), et `Server` (serveur HTTP léger).

### 4. Couche Présentation (`src/Presentation`)
Gère les interfaces de communication avec l'utilisateur et les clients de l'API (HTTP, templates HTML, CSS).
- **Routes & Contrôleurs** :
  - `ShortyRoute` : Point de terminaison API `POST /api/shorty`.
  - `CodeRoute` : Route de redirection `GET /:code` gérant le routage vers l'URL d'origine ou la page de prévisualisation.
  - `HomeRoute` et `AssetsRoute` : Rendu de l'interface graphique et des fichiers statiques.

---

## Utilisation des API

L'application expose également une API simple pour créer des liens raccourcis de manière programmatique en prévision d'une future intégration via une extension navigateur web.

### Raccourcir une URL
- **Méthode** : `POST`
- **Chemin** : `/api/shorty`
- **En-tête** : `Content-Type: application/json`
- **Corps de la requête** :
  ```json
  {
    "url": "https://example.com/une-tres-longue-adresse-a-raccourcir"
  }
  ```
- **Réponse (201 Created)** :
  ```json
  {
    "shortCode": "1a2b3c",
    "shortUrl": "http://localhost:3000/1a2b3c",
    "originalUrl": "https://example.com/une-tres-longue-adresse-a-raccourcir"
  }
  ```
