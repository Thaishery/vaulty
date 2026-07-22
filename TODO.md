# 📌 Vaulty - Roadmap & TODO

## 🔒 Chiffrement Zero-Knowledge Côté Client (Front-End)

Actuellement, le chiffrement et le déchiffrement sont gérés côté serveur par Node.js dans `CryptoService.js`.

### Objectif Cible
Déplacer l'intégralité des opérations cryptographiques dans le navigateur client (Web Crypto API) afin de garantir une architecture Zero-Knowledge (End-to-End Encryption - E2EE) où le serveur n'a jamais accès au mot de passe en clair ni au jeton original.

### Spécifications Techniques
1. **Génération de Token Client :**
   - Utiliser `window.crypto.getRandomValues(new Uint8Array(32))` pour générer un jeton de 256 bits d'entropie dans le navigateur.

2. **Chiffrement Client (`AES-256-GCM`) :**
   - Utiliser `window.crypto.subtle.encrypt('AES-GCM', key, data)` pour chiffrer la donnée avant envoi HTTP.

3. **Format d'URL avec Fragment (`#`) :**
   - Transmettre l'URL sous la forme `https://vaulty.com/secret#<token>`.
   - Le fragment `#` n'est **jamais transmis au serveur** dans les requêtes HTTP, ce qui empêche toute inscription du token dans les journaux d'accès HTTP (Nginx/Node) ou les en-têtes `Referer`.

4. **Serveur Minimaliste :**
   - Le serveur agit uniquement comme un coffre-fort aveugle recevant `(dbKey, ciphertext, iv, authTag)` et renvoyant le bloc chiffré lors de la consultation.
