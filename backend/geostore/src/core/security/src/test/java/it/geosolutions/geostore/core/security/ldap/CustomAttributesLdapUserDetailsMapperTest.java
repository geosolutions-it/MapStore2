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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import it.geosolutions.geostore.core.ldap.MockDirContextOperations;
import it.geosolutions.geostore.core.security.UserDetailsWithAttributes;

import org.junit.Before;
import org.junit.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class CustomAttributesLdapUserDetailsMapperTest {

    private static final String SAMPLE_USERNAME = "username";

    private CustomAttributesLdapUserDetailsMapper mapper;
    private Map<String, String> attributeMappings;

    private Collection<GrantedAuthority> authorities;

    MockDirContextOperations ctx;

    @Before
    public void setUp() {
        attributeMappings = new HashMap<String, String>();
        authorities = Collections.EMPTY_LIST;
        mapper = new CustomAttributesLdapUserDetailsMapper(attributeMappings);
        ctx = new MockDirContextOperations();
    }

    @Test
    public void testMappings() {
        ctx.getLdapAttributes().put("cn", "mock");
        attributeMappings.put("FullName", "cn");
        UserDetails details = mapper.mapUserFromContext(ctx, SAMPLE_USERNAME, authorities);
        assertTrue(details instanceof UserDetailsWithAttributes);
        UserDetailsWithAttributes detailsWithAttribute = (UserDetailsWithAttributes) details;
        assertEquals("mock", detailsWithAttribute.getAttribute("FullName"));
    }
}
