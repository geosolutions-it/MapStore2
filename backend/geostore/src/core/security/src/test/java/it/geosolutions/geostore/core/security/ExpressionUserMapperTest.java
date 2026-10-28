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
package it.geosolutions.geostore.core.security;

import static org.junit.Assert.assertEquals;

import it.geosolutions.geostore.core.model.User;

import org.junit.Before;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

public class ExpressionUserMapperTest {
    ExpressionUserMapper mapper;
    private Map<String, String> attributeMappings;

    String SAMPLE_JSON = "{\"user_id\":\"123\",\"email\":\"myemail@email.com\"}";

    @Before
    public void setUp() {
        attributeMappings = new HashMap<String, String>();
    }

    @Test
    public void testUserDetailsMapping() {
        MockUserDetailsWithAttributes detailsWithAttributes = new MockUserDetailsWithAttributes();
        mapper = new UserDetailsExpressionUserMapper(attributeMappings);
        User user = new User();
        detailsWithAttributes.getAttributes().put("sample", "mock");
        attributeMappings.put("transformed", "sample");
        mapper.mapUser(detailsWithAttributes, user);

        assertEquals(1, user.getAttribute().size());
        assertEquals("transformed", user.getAttribute().get(0).getName());
        assertEquals("mock", user.getAttribute().get(0).getValue());
    }

    @Test
    public void testJsonsMapping() {
        mapper = new JSONExpressionUserMapper(attributeMappings);
        User user = new User();
        attributeMappings.put("transformed", "email");
        mapper.mapUser(SAMPLE_JSON, user);

        assertEquals(1, user.getAttribute().size());
        assertEquals("transformed", user.getAttribute().get(0).getName());
        assertEquals("myemail@email.com", user.getAttribute().get(0).getValue());
    }

    @Test
    public void testMapMapping() {
        mapper = new MapExpressionUserMapper(attributeMappings);
        User user = new User();
        attributeMappings.put("transformed", "my_email");
        Map<String, String> attributes = new HashMap<String, String>();
        attributes.put("my_email", "myemail@email.com");
        mapper.mapUser(attributes, user);

        assertEquals(1, user.getAttribute().size());
        assertEquals("transformed", user.getAttribute().get(0).getName());
        assertEquals("myemail@email.com", user.getAttribute().get(0).getValue());
    }
}
