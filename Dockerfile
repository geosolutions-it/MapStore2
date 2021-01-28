ARG OVR=""
FROM alpine AS base
LABEL maintainer="Alessandro Parma<alessandro.parma@geo-solutions.it>"
LABEL maintainer="Asdrubal Gonzalez<asdubal.gonzalez@geo-solutions.it>"
LABEL description="MapStore Docker image"
LABEL "com.url"="https://dev.mapstore.geo-solutions.it"

#ARG OVR=""
ARG MAPSTORE_WEBAPP_SRC="./.placeholder"
ADD "${MAPSTORE_WEBAPP_SRC}" "/mapstore/"

COPY ./docker/* /mapstore/docker/
WORKDIR /mapstore

#RUN wget https://github.com/geosolutions-it/MapStore2/releases/latest/download/mapstore.war

FROM tomcat:9-jdk11-openjdk

# Tomcat specific options
ENV CATALINA_BASE "$CATALINA_HOME"
ENV MAPSTORE_WEBAPP_DST="${CATALINA_BASE}/webapps"
ENV INITIAL_MEMORY="512m"
ENV MAXIMUM_MEMORY="512m"
ENV JAVA_OPTS="${JAVA_OPTS}  -Xms${INITIAL_MEMORY} -Xmx${MAXIMUM_MEMORY} -XX:MaxPermSize=128m"
ENV GEOSTORE_OVR_OPT="-Dgeostore-ovr=${CATALINA_BASE}/conf/${OVR} \
                      -Duser.timezone=UTC"
ARG TOMCAT_EXTRAS=false
#ARG OVR=""

# Optionally remove Tomcat manager, docs, and examples
RUN if [ "$TOMCAT_EXTRAS" = false ]; then \
      find "${MAPSTORE_WEBAPP_DST}" -delete; \
    fi

COPY --from=base "/mapstore/mapstore.war" "${MAPSTORE_WEBAPP_DST}/mapstore.war"
COPY --from=base "/mapstore/docker" "${CATALINA_BASE}/docker"

WORKDIR ${CATALINA_BASE}

# adding the env
RUN if [ "${OVR}" == "geostore-datasource-ovr-postgres.properties" ]; then \
        cp ${CATALINA_BASE}/docker/geostore-datasource-ovr-postgres.properties ${CATALINA_BASE}/conf/geostore-datasource-ovr-postgres.properties; \
    else \
        cp ${CATALINA_BASE}/docker/geostore-datasource-ovr.properties ${CATALINA_BASE}/conf/geostore-datasource-ovr.properties; \
    fi

RUN apt-get update \
    && apt-get install --yes postgresql-client-11 \
    && apt-get clean \
    && apt-get autoclean \
    && apt-get autoremove \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /usr/share/man/* \
    && rm -rf /usr/share/doc/*

ENV JAVA_OPTS="${JAVA_OPTS} ${GEOSTORE_OVR_OPT}"

# Set variable to better handle terminal commands
ENV TERM xterm

EXPOSE 8080
