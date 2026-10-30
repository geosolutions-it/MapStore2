# Build environment for the Anthropic OSS Scanner (https://github.com/anthropics/oss-scanner).
# The scanner builds this file with the repository as context and then runs the image without network,
# so every npm package and Maven artifact needed to build, test and run MapStore is downloaded here.
FROM node:24-bookworm

ENV DEBIAN_FRONTEND=noninteractive
# JDK and Maven for the backend, Chromium for the Karma frontend tests (ChromeHeadless).
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl git python3 procps unzip \
      openjdk-17-jdk-headless maven chromium \
    && rm -rf /var/lib/apt/lists/*
ENV CHROME_BIN=/usr/bin/chromium

# scanner contract: the checkout lives inside the image, at /src
COPY . /src
WORKDIR /src

# Frontend: dependencies and the production bundle that the war packages.
RUN npm install --no-audit --no-fund \
    && NODE_OPTIONS=--max-old-space-size=8192 npm run fe:build

# Backend (java/ services, web, printing) and the mapstore.war in product/target. Java tests run here;
# a failing test is reported but does not fail the image.
RUN mvn -B -ntp install -Pprinting -Dmaven.test.failure.ignore=true

# Tomcat with the war, to run MapStore offline with the same JVM option as the official image:
#   INITIAL_ADMIN_PASSWORD=<password> CATALINA_OPTS=-XX:-UseBASE64Intrinsics /opt/tomcat/bin/catalina.sh run
# The application is then at http://localhost:8080/mapstore/ (admin user created from INITIAL_ADMIN_PASSWORD).
RUN TOMCAT_VERSION=$(sed -n 's:.*<tomcat.version>\(.*\)</tomcat.version>.*:\1:p' pom.xml | head -1) \
    && mvn -B -ntp dependency:copy -Dartifact=org.apache.tomcat:tomcat:${TOMCAT_VERSION}:zip -DoutputDirectory=/tmp/tomcat \
    && unzip -q /tmp/tomcat/tomcat-${TOMCAT_VERSION}.zip -d /opt \
    && mv /opt/apache-tomcat-${TOMCAT_VERSION} /opt/tomcat \
    && chmod +x /opt/tomcat/bin/*.sh \
    && cp product/target/mapstore.war /opt/tomcat/webapps/ \
    && rm -rf /tmp/tomcat

# Maven offline mode refuses artifacts whose _remote.repositories marker names a repository other than the
# one it would ask now. Without network every cached artifact is valid, so drop the markers.
RUN find /root/.m2/repository -name _remote.repositories -delete
