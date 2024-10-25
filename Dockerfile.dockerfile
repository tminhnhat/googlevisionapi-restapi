# Use the official Node.js image as the base image
FROM node:14 AS builder

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Use a smaller base image for the final stage
FROM node:14-slim

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy only the necessary files from the builder stage
COPY --from=builder /usr/src/app .

# Expose the port the app runs on
EXPOSE 3000

# Define environment variable for Google Cloud credentials
ENV GOOGLE_APPLICATION_CREDENTIALS=/usr/src/app/path/to/your/service-account-file.json

# Start the application
CMD ["node", "index.js"]