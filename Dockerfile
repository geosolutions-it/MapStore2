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
ARG OVR=""
ENV JAVA_OPTS="${JAVA_OPTS} -Xms${INITIAL_MEMORY} -Xmx${MAXIMUM_MEMORY}"
ENV GEOSTORE_OVR_OPT="-Dgeostore-ovr=file://${CATALINA_BASE}/conf/${OVR}"
ENV JAVA_OPTS="${JAVA_OPTS} ${GEOSTORE_OVR_OPT}"
ENV TERM xterm

COPY --from=mother "/mapstore/mapstore.war" "${MAPSTORE_WEBAPP_DST}/mapstore.war"
COPY --from=mother "/mapstore/docker" "${CATALINA_BASE}/docker/"

WORKDIR ${CATALINA_BASE}

RUN cp ${CATALINA_BASE}/docker/wait-for-postgres.sh /usr/bin/wait-for-postgres

RUN cp ${CATALINA_BASE}/docker/${OVR} ${CATALINA_BASE}/conf

RUN apt-get update \
    && apt-get install --yes postgresql-client \
    && apt-get clean \
    && apt-get autoclean \
    && apt-get autoremove -y \
    && rm -rf /var/cache/apt/* \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /usr/share/man/* \
    && rm -rf /usr/share/doc/*

EXPOSE 8080
