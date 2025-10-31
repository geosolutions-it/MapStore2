FROM mapstore-base:latest

ENV CATALINA_BASE="/usr/local/tomcat"
ARG MAPSTORE_WEBAPP_SRC="./product/target/mapstore.war"
ARG UID=1001
ARG GID=1001
ARG UNAME=tomcat

COPY ${MAPSTORE_WEBAPP_SRC} ${CATALINA_BASE}/webapps/mapstore.war

COPY binary/tomcat/conf/server.xml "${CATALINA_BASE}/conf/"

USER root
RUN chown $UID:$GID ${CATALINA_BASE}/webapps/mapstore.war ${CATALINA_BASE}/conf/server.xml
USER $UNAME

WORKDIR ${CATALINA_BASE}
