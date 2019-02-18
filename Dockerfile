FROM tomcat:7.0.92-jre7-alpine
MAINTAINER geosolutions<info@geo-solutions.it>

# Install utilities
RUN  apk update \
     && apk add vim \
     && rm -rf /var/cache/apk/*

# Tomcat specific options
ENV CATALINA_BASE "$CATALINA_HOME"
ENV JAVA_OPTS="${JAVA_OPTS}  -Xms512m -Xmx512m -XX:MaxPermSize=128m"

# Optionally remove Tomcat manager, docs, and examples
ARG TOMCAT_EXTRAS=false
RUN if [ "$TOMCAT_EXTRAS" = false ]; then \
      find "${CATALINA_BASE}/webapps/" -delete; \
    fi

# Add war files to be deployed
COPY docker/*.war "${CATALINA_BASE}/webapps/"

# Geostore externalization template. Disabled by default
COPY docker/geostore-datasource-ovr.properties "${CATALINA_BASE}/conf/"
ARG GEOSTORE_OVR_OPT=""
ENV JAVA_OPTS="${JAVA_OPTS} ${GEOSTORE_OVR_OPT}"

# Set variable to better handle terminal commands
ENV TERM xterm

EXPOSE 8080
