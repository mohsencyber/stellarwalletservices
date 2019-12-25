FROM node:8.17.0

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

#ARG DB_HOST
#ENV DB_HOST ifconfig docker0 | grep "inet " | awk '{print $2}'
#$(route -n | awk '/UG[ \t]/{print $2}')

EXPOSE 3000
CMD [ "nodejs", "serverRest.js" ]
