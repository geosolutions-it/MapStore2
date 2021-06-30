FROM tomcat:9-jdk11-openjdk AS mother
LABEL maintainer="Alessandro Parma<alessandro.parma@geo-solutions.it>"
ARG MAPSTORE_WEBAPP_SRC="./.placeholder"
ADD "${MAPSTORE_WEBAPP_SRC}" "/mapstore/"

COPY ./docker/* /mapstore/docker/
WORKDIR /mapstore

FROM tomcat:9-jdk11-openjdk

# Tomcat specific options
ENV CATALINA_BASE "$CATALINA_HOME"
ENV MAPSTORE_WEBAPP_DST="${CATALINA_BASE}/webapps"
ENV INITIAL_MEMORY="512m"
ENV MAXIMUM_MEMORY="512m"
ENV JAVA_OPTS="${JAVA_OPTS}  -Xms${INITIAL_MEMORY} -Xmx${MAXIMUM_MEMORY} -XX:MaxPermSize=128m"
ENV GEOSTORE_OVR_OPT="-Dgeostore-ovr=${CATALINA_BASE}/conf/${OVR}"
ARG OVR=""
ARG PG_CLIENT_VERSION=""

COPY --from=mother "/mapstore/mapstore.war" "${MAPSTORE_WEBAPP_DST}/mapstore.war"
COPY --from=mother "/mapstore/docker" "${CATALINA_BASE}/docker/"

WORKDIR ${CATALINA_BASE}

# adding the env
RUN if [ "${OVR}" = "geostore-datasource-ovr.properties" ]; then \
        cp ${CATALINA_BASE}/docker/geostore-datasource-ovr.properties ${CATALINA_BASE}/conf; \
    fi

RUN apt-get update \
    && apt-get install --yes postgresql-client-${PG_CLIENT_VERSION}

RUN apt-get clean \
    && apt-get autoclean \
    && apt-get autoremove \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /usr/share/man/* \
    && rm -rf /usr/share/doc/*

ENV JAVA_OPTS="${JAVA_OPTS} ${GEOSTORE_OVR_OPT}"

# Set variable to better handle terminal commands
ENV TERM xterm

EXPOSE 8080
