FROM tomcat:9-jdk11 AS mother
LABEL maintainer="Alessandro Parma<alessandro.parma@geosolutionsgroup.com>"
ARG MAPSTORE_WEBAPP_SRC=""
WORKDIR /tmp/build-context
COPY . .
RUN set -eux; \
    mkdir -p /mapstore; \
    WAR_SRC="${MAPSTORE_WEBAPP_SRC}"; \
    if [ -z "${WAR_SRC}" ]; then \
        for candidate in \
            "./product/target/mapstore.war" \
            "./web/target/mapstore.war"; do \
            if [ -f "${candidate}" ]; then \
                WAR_SRC="${candidate}"; \
                break; \
            fi; \
        done; \
    fi; \
    if [ -z "${WAR_SRC}" ]; then \
        echo "Unable to locate mapstore.war. Build the project or pass MAPSTORE_WEBAPP_SRC." >&2; \
        exit 1; \
    fi; \
    case "${WAR_SRC}" in \
        http://*|https://*) \
            apt-get update; \
            DEBIAN_FRONTEND=noninteractive apt-get install --yes curl ca-certificates; \
            curl -fsSL "${WAR_SRC}" -o /mapstore/mapstore.war; \
            apt-get purge --yes --auto-remove curl ca-certificates; \
            rm -rf /var/lib/apt/lists/*; \
            ;; \
        /*|./*) \
            cp "${WAR_SRC}" /mapstore/mapstore.war; \
            ;; \
        *) \
            if [ -f "${WAR_SRC}" ]; then \
                cp "${WAR_SRC}" /mapstore/mapstore.war; \
            else \
                echo "Invalid MAPSTORE_WEBAPP_SRC value: ${WAR_SRC}" >&2; \
                exit 1; \
            fi; \
            ;; \
    esac; \
    
    mkdir -p /mapstore/docker; \
    cp -r ./docker/. /mapstore/docker/
WORKDIR /mapstore

FROM tomcat:9-jdk11
ARG UID=1001
ARG GID=1001
ARG UNAME=tomcat
# Tomcat specific options
ENV CATALINA_BASE "$CATALINA_HOME"
ENV MAPSTORE_WEBAPP_DST="${CATALINA_BASE}/webapps"
ARG INITIAL_MEMORY="512m"
ARG MAXIMUM_MEMORY="512m"
ENV JAVA_OPTS="${JAVA_OPTS} -Xms${INITIAL_MEMORY} -Xmx${MAXIMUM_MEMORY}"

ARG OVR=""
# ENV GEOSTORE_OVR_OPT="-Dgeostore-ovr=file://${CATALINA_BASE}/conf/${OVR}"
ARG DATA_DIR="${CATALINA_BASE}/datadir"
ENV GEOSTORE_OVR_OPT=""
ENV JAVA_OPTS="${JAVA_OPTS} ${GEOSTORE_OVR_OPT} -Ddatadir.location=${DATA_DIR}"
ENV TERM xterm

COPY --from=mother "/mapstore/mapstore.war" "${MAPSTORE_WEBAPP_DST}/mapstore.war"
COPY --from=mother "/mapstore/docker" "${CATALINA_BASE}/docker/"

COPY binary/tomcat/conf/server.xml "${CATALINA_BASE}/conf/"

RUN mkdir -p ${DATA_DIR}


RUN cp ${CATALINA_BASE}/docker/wait-for-postgres.sh /usr/bin/wait-for-postgres

RUN apt-get update \
    && apt-get install --yes postgresql-client \
    && apt-get clean \
    && apt-get autoclean \
    && apt-get autoremove -y \
    && rm -rf /var/cache/apt/* \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /usr/share/man/* \
    && rm -rf /usr/share/doc/*

RUN groupadd -g $GID $UNAME
RUN useradd -m -u $UID -g $GID --system $UNAME
RUN chown -R $UID:$GID ${CATALINA_BASE} ${MAPSTORE_WEBAPP_DST} ${DATA_DIR}
USER $UNAME
WORKDIR ${CATALINA_BASE}

VOLUME [ "${DATA_DIR}" ]

EXPOSE 8080
