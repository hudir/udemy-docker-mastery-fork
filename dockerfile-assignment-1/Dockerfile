# use this empty Dockerfile to build your assignment

# NOTE: The instructions are now in the README.md file in this directory.

FROM node:6-alpine

EXPOSE 3000

WORKDIR /usr/src/app

COPY . .

RUN apk add --no-cache tini \
    && npm install \
    && npm cache clean --force


# CMD /sbin/tini -- node ./bin/www
CMD ["/sbin/tini", "--", "node", "./bin/www"]