FROM eclipse-temurin:17-jre

ADD https://geoserver.org/acme-ldap/acme-ldap-1.0.jar /opt/acme-ldap/acme-ldap-1.0.jar

EXPOSE 10389

CMD ["java", "-jar", "/opt/acme-ldap/acme-ldap-1.0.jar"]
