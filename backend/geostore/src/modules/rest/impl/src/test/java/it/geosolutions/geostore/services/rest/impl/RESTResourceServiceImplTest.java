/*
 *  Copyright (C) 2007 - 2025 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package it.geosolutions.geostore.services.rest.impl;

import static org.junit.jupiter.api.Assertions.assertThrows;

import it.geosolutions.geostore.core.model.Attribute;
import it.geosolutions.geostore.core.model.IPRange;
import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.SecurityRule;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.DataType;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.services.ServiceTestBase;
import it.geosolutions.geostore.services.rest.exception.ForbiddenErrorWebEx;
import it.geosolutions.geostore.services.rest.model.RESTAttribute;
import it.geosolutions.geostore.services.rest.model.SecurityRuleList;
import it.geosolutions.geostore.services.rest.utils.MockSecurityContext;

import jakarta.ws.rs.core.SecurityContext;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.springframework.web.context.request.RequestContextHolder;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Class ResourceServiceImplTest.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public class RESTResourceServiceImplTest extends ServiceTestBase {

    RESTResourceServiceImpl restResourceService;

    @Before
    public void setUp() throws Exception {
        super.setUp();
        restResourceService = new RESTResourceServiceImpl();
        restResourceService.setResourceService(resourceService);
        restResourceService.setResourcePermissionService(resourcePermissionService);
        mockHttpRequestIPAddressAttribute();
    }

    @After
    public void cleanup() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    public void testUpdateResource_editorUpdate() throws Exception {
        // insert fake user for security context
        long u0ID = createUser("u0", Role.USER, "p0");
        User user = new User();
        user.setId(u0ID);
        user.setName("u0");

        List<SecurityRule> rules = new ArrayList<>();

        SecurityRule rule = new SecurityRule();
        rule.setUser(user);
        rule.setCanRead(true);
        rule.setCanWrite(true);
        rules.add(rule);

        long groupId = createGroup("group1");
        UserGroup group = new UserGroup();
        group.setId(groupId);

        rule = new SecurityRule();
        rule.setCanRead(true);
        rule.setCanWrite(true);
        rule.setGroup(group);
        rules.add(rule);

        // create a sample resource
        long resourceId = createResource("name1", "description1", "MAP", rules);

        // create security context for the request
        SecurityContext sc = new MockSecurityContext(userService.get(u0ID));

        // prepare request content
        RESTAttribute restAttribute = new RESTAttribute();
        String NAME = "NAME";
        String VALUE = "VALUE";
        restAttribute.setName(NAME);
        restAttribute.setValue(VALUE);

        // attempt to update the attribute from rest service
        restResourceService.updateAttribute(sc, resourceId, restAttribute);

        Resource sr = restResourceService.get(sc, resourceId, false);

        // verify the attribute has been changed
        Attribute attribute = sr.getAttribute().get(0);
        assertEquals(NAME, attribute.getName());
        assertEquals(VALUE, attribute.getValue());
        assertEquals(DataType.STRING, attribute.getType());

        assertEquals("u0", sr.getCreator());
        assertEquals("u0", sr.getEditor());

        // Update rule as "user1"
        // insert fake user for security context
        long u1ID = createUser("u1", Role.USER, "p1", groupId);
        user = new User();
        user.setId(u1ID);
        user.setName("u1");

        sc = new MockSecurityContext(userService.get(u1ID));

        // prepare request content
        restAttribute = new RESTAttribute();
        NAME = "NAME";
        VALUE = "VALUE1";
        restAttribute.setName(NAME);
        restAttribute.setValue(VALUE);

        // attempt to update the attribute from rest service
        restResourceService.updateAttribute(sc, resourceId, restAttribute);

        sr = restResourceService.get(sc, resourceId, false);

        // verify the attribute has been changed
        attribute = sr.getAttribute().get(0);
        assertEquals(NAME, attribute.getName());
        assertEquals(VALUE, attribute.getValue());
        assertEquals(DataType.STRING, attribute.getType());

        assertEquals("u0", sr.getCreator());
        assertEquals("u1", sr.getEditor());
    }

    @Test
    public void testUpdateResourceSecurityRules_withoutPermissions() throws Exception {

        long resourceId = createResource("name1", "description1", "MAP");

        long userId = createUser("user", Role.USER, "user");
        SecurityContext sc = new MockSecurityContext(userService.get(userId));

        SecurityRule securityRule = new SecurityRuleBuilder().build();

        assertThrows(
                ForbiddenErrorWebEx.class,
                () ->
                        restResourceService.updateSecurityRules(
                                sc, resourceId, new SecurityRuleList(List.of(securityRule))));
    }

    @Test
    public void testUpdateResourceSecurityRules_ipRangeUpdate() throws Exception {

        long adminId = createUser("user", Role.ADMIN, "user");
        long resourceId = createResource("name1", "description1", "MAP");

        SecurityContext sc = new MockSecurityContext(userService.get(adminId));

        IPRange ipRange = new IPRange();
        ipRange.setCidr("192.168.1.1/24");
        ipRange.setDescription("range");
        ipRangeService.insert(ipRange);

        SecurityRuleList securityRulelist =
                new SecurityRuleList(
                        List.of(new SecurityRuleBuilder().ipRanges(Set.of(ipRange)).build()));

        restResourceService.updateSecurityRules(sc, resourceId, securityRulelist);

        List<SecurityRule> securityRules = resourceService.getSecurityRules(resourceId);

        assertEquals(1, securityRules.size());
        Set<IPRange> ipRanges = securityRules.get(0).getIpRanges();
        assertEquals(1, ipRanges.size());
        IPRange savedIpRange = new ArrayList<>(ipRanges).get(0);
        assertEquals(ipRange.getCidr(), savedIpRange.getCidr());
        assertEquals(ipRange.getDescription(), savedIpRange.getDescription());
    }
}
