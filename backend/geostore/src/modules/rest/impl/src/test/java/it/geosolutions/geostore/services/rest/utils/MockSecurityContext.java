package it.geosolutions.geostore.services.rest.utils;

import it.geosolutions.geostore.core.model.User;

import jakarta.ws.rs.core.SecurityContext;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.security.Principal;
import java.util.Collection;

/**
 * Mock class to simulate REST Services Requests
 *
 * @author Lorenzo Natali, GeoSolutions s.a.s.
 */
public class MockSecurityContext implements SecurityContext {

    User user;
    Authentication principal;

    public MockSecurityContext(User uu) {
        this.user = uu;
        principal =
                new Authentication() {

                    @Override
                    public String getName() {
                        return user.getName();
                    }

                    @Override
                    public Collection<GrantedAuthority> getAuthorities() {
                        // TODO Auto-generated method stub
                        return null;
                    }

                    @Override
                    public Object getCredentials() {
                        // TODO Auto-generated method stub
                        return null;
                    }

                    @Override
                    public Object getDetails() {
                        // TODO Auto-generated method stub
                        return null;
                    }

                    @Override
                    public Object getPrincipal() {
                        return user;
                    }

                    @Override
                    public boolean isAuthenticated() {
                        // TODO Auto-generated method stub
                        return false;
                    }

                    @Override
                    public void setAuthenticated(boolean isAuthenticated)
                            throws IllegalArgumentException {
                        // TODO Auto-generated method stub
                    }
                };
    }

    @Override
    public Principal getUserPrincipal() {
        return principal;
    }

    @Override
    public boolean isUserInRole(String role) {
        return role != null && role.equals(user.getRole());
    }

    @Override
    public boolean isSecure() {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public String getAuthenticationScheme() {
        // TODO Auto-generated method stub
        return null;
    }
}
