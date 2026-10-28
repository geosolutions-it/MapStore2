package it.geosolutions.geostore.services.rest.security;

import it.geosolutions.geostore.core.ldap.MockDirContextOperations;

import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.core.Authentication;
import org.springframework.security.ldap.authentication.LdapAuthenticator;

public class MockLdapAuthenticator implements LdapAuthenticator {

    @Override
    public DirContextOperations authenticate(Authentication authentication) {
        return new MockDirContextOperations();
    }
}
