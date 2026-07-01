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
COPY index.html ./

# Install production dependencies (if any are added later)
RUN npm install --omit=dev && npm cache clean --force

# Copy the rest of the application source code
COPY server.js ./

# Expose port 3000 to the container network
EXPOSE 3000

# Run the application under a non-privileged system user for security
USER node

# Define the command to run the app
CMD [ "node", "server.js" ]
