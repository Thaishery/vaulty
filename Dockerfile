# Use a lightweight, official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Set production environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy application manifests
COPY package.json ./
COPY html ./html/

# Install production dependencies and build native sqlite3 addon if needed
RUN apk add --no-cache --virtual .build-deps python3 make g++ && \
    npm install --omit=dev && \
    apk del .build-deps && \
    npm cache clean --force

# Copy the rest of the application source code
COPY server.js ./

# Create data directory and set ownership to node user
RUN mkdir -p /usr/src/app/data && chown -R node:node /usr/src/app

# Expose port 3000 to the container network
EXPOSE 3000

# Run the application under a non-privileged system user for security
USER node

# Define the command to run the app
CMD [ "node", "server.js" ]
