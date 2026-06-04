FROM osixia/openldap:1.5.0

# Bootstrap LDIF is baked into the image (runs once when ldap_data volume is empty).
COPY ldif/ /container/service/slapd/assets/config/bootstrap/ldif/custom/
