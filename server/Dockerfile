FROM node:20-slim

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the application
COPY . .

# Ensure the server knows it's in production
ENV NODE_ENV=production

# The port will be provided by Railway
EXPOSE 3000

CMD ["npm", "start"]
