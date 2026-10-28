/* ====================================================================
 *
 * Copyright (C) 2015 GeoSolutions S.A.S.
 * http://www.geo-solutions.it
 *
 * GPLv3 + Classpath exception
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.
 *
 * ====================================================================
 *
 * This software consists of voluntary contributions made by developers
 * of GeoSolutions.  For more information on GeoSolutions, please see
 * <http://www.geo-solutions.it/>.
 *
 */
package it.geosolutions.geostore.core.security.ldap;

import it.geosolutions.geostore.core.security.UserDetailsWithAttributes;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.ldap.userdetails.LdapUserDetails;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * Extends LdapUserDetails with the ability to store attributes coming from Ldap.
 *
 * @author Mauro Bartolomeoli
 */
public class LdapUserDetailsWithAttributes implements LdapUserDetails, UserDetailsWithAttributes {
    private LdapUserDetails delegate;

    private Map<String, Object> attributes = new HashMap<String, Object>();

    public LdapUserDetailsWithAttributes(LdapUserDetails delegate) {
        super();
        this.delegate = delegate;
    }

    public void setAttribute(String name, Object value) {
        this.attributes.put(name, value);
    }

    public Object getAttribute(String name) {
        return attributes.get(name);
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return delegate.getAuthorities();
    }

    public String getDn() {
        return delegate.getDn();
    }

    public String getPassword() {
        return delegate.getPassword();
    }

    public String getUsername() {
        return delegate.getUsername();
    }

    public boolean isAccountNonExpired() {
        return delegate.isAccountNonExpired();
    }

    public boolean isAccountNonLocked() {
        return delegate.isAccountNonLocked();
    }

    public boolean isCredentialsNonExpired() {
        return delegate.isCredentialsNonExpired();
    }

    public boolean isEnabled() {
        return delegate.isEnabled();
    }

    public boolean equals(Object obj) {
        return delegate.equals(obj);
    }

    public int hashCode() {
        return delegate.hashCode();
    }

    public String toString() {
        return delegate.toString();
    }

    @Override
    public void eraseCredentials() {
        delegate.eraseCredentials();
    }
}
