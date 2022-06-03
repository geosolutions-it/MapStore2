FROM alpine:latest

# Automatically run "apk update"
RUN apk add --no-cache openssl \
    && apk add --no-cache curl \
    && apk add --no-cache py3-pip \
    # Request library to execute the tests
    && python3 -m pip install requests 

# Dockerize is needed to sync containers startup
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

WORKDIR /tst
COPY ./tests.py /tst/tests.py