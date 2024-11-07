# Image size ~ 400MB
FROM node:21-alpine3.18 as builder

RUN apk add --no-cache git python3 make g++
# Switch to the "node" user
USER node

# Set home to the user's home directory
ENV HOME=/home/node \
	  PATH=/home/node/.local/bin:$PATH

# Set the working directory to the user's home directory
WORKDIR $HOME/app

# Copy the current directory contents into the container at $HOME/app setting the owner to the user
COPY --chown=node . $HOME/app

# Loading Dependencies
RUN npm install --legacy-peer-deps

RUN npm install --os=linux --libc=musl --cpu=x64 sharp

RUN npm run build

# Expose application's default port
EXPOSE 3008

# Entry Point
CMD ["npm", "start"]
