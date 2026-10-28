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

import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.ldap.userdetails.LdapUserDetails;
import org.springframework.security.ldap.userdetails.LdapUserDetailsMapper;

import java.util.Collection;
import java.util.Map;

/**
 * Extends LdapUserDetailsMapper with the ability to map LDAP attributes to UserDetails attributes.
 *
 * @author Mauro Bartolomeoli
 */
public class CustomAttributesLdapUserDetailsMapper extends LdapUserDetailsMapper {

    Map<String, String> attributeMappings;

    public CustomAttributesLdapUserDetailsMapper(Map<String, String> attributeMappings) {
        super();
        this.attributeMappings = attributeMappings;
    }

    @Override
    public UserDetails mapUserFromContext(
            DirContextOperations ctx,
            String username,
            Collection<? extends GrantedAuthority> authorities) {
        LdapUserDetails details =
                (LdapUserDetails) super.mapUserFromContext(ctx, username, authorities);
        LdapUserDetailsWithAttributes detailsWithAttributes =
                new LdapUserDetailsWithAttributes(details);
        for (String attributeName : attributeMappings.keySet()) {
            detailsWithAttributes.setAttribute(
                    attributeName, ctx.getStringAttribute(attributeMappings.get(attributeName)));
        }
        return detailsWithAttributes;
    }
}
