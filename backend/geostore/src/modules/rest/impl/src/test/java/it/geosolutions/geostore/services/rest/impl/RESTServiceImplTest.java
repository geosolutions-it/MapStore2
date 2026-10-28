/*
 *  Copyright (C) 2018 - 2025 GeoSolutions S.A.S.
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

import static org.junit.Assert.assertThrows;

import inet.ipaddr.IPAddress;

import it.geosolutions.geostore.core.model.Attribute;
import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.SecurityRule;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserAttribute;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.DataType;
import it.geosolutions.geostore.core.model.enums.GroupReservedNames;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.services.ResourcePermissionService;
import it.geosolutions.geostore.services.ResourcePermissionServiceImpl;
import it.geosolutions.geostore.services.ResourceService;
import it.geosolutions.geostore.services.SecurityService;
import it.geosolutions.geostore.services.ServiceTestBase;
import it.geosolutions.geostore.services.UserService;
import it.geosolutions.geostore.services.dto.ResourceSearchParameters;
import it.geosolutions.geostore.services.dto.ShortAttribute;
import it.geosolutions.geostore.services.dto.ShortResource;
import it.geosolutions.geostore.services.dto.search.SearchFilter;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.DuplicatedResourceNameServiceEx;
import it.geosolutions.geostore.services.exception.InternalErrorServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;
import it.geosolutions.geostore.services.rest.exception.InternalErrorWebEx;

import org.junit.Before;
import org.junit.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;

/**
 * This test checks that the resourceAccessRead and resourceAccessWrite methods properly check and
 * return expected canEdit and canWrite for a mock SecurityService.
 *
 * @author Lorenzo Natali, GeoSolutions S.a.s.
 */
public class RESTServiceImplTest extends ServiceTestBase {
    TESTRESTServiceImpl restService;
    TestSecurityService securityService;
    TestUserService userService;
    TestResourceService testResourceService;
    ResourcePermissionService resourcePermissionService;

    User user;
    UserGroup group;
    UserGroup everyone;

    private SecurityRule createSecurityRule(
            long id, User user, UserGroup group, boolean canRead, boolean canWrite) {
        SecurityRule sr = new SecurityRule();
        sr.setId(id);
        sr.setUser(user);
        sr.setGroup(group);
        sr.setCanRead(canRead);
        sr.setCanWrite(canWrite);
        return sr;
    }

    @Before
    public void setUp() {
        // set up services
        securityService = new TestSecurityService();
        restService = new TESTRESTServiceImpl();
        userService = new TestUserService();
        testResourceService = new TestResourceService();
        resourcePermissionService = new ResourcePermissionServiceImpl();
        restService.setSecurityService(securityService);
        restService.setUserService(userService);
        restService.setResourceService(testResourceService);
        restService.setResourcePermissionService(resourcePermissionService);

        // set up users and groups
        user = new User();
        user.setName("TEST_USER");
        user.setId(Long.valueOf(100));
        user.setRole(Role.USER);
        everyone = new UserGroup();
        everyone.setId(Long.valueOf(200));
        everyone.setGroupName("everyone");
        group = new UserGroup();
        group.setGroupName("TEST_GROUP");
        group.setId(Long.valueOf(201));
        HashSet<UserGroup> groups = new HashSet<UserGroup>();
        groups.add(everyone);
        groups.add(group);
        user.setGroups(groups);
        user.setGroups(groups);
    }

    @Test
    public void testRulesReadWrite() {

        Resource resource = new Resource();
        resource.setId(1L);
        testResourceService.resources = List.of(resource);

        SecurityRule groupSecurityReadWriteRule = createSecurityRule(1, null, group, true, true);
        SecurityRule userSecurityReadRule = createSecurityRule(1, user, null, true, false);

        resource.setSecurity(List.of(groupSecurityReadWriteRule, userSecurityReadRule));

        assertTrue(restService.resourceAccessRead(user, 1));
        assertTrue(restService.resourceAccessWrite(user, 1));

        SecurityRule groupSecurityReadRule = createSecurityRule(1, null, group, true, false);
        SecurityRule userSecurityReadWriteRule = createSecurityRule(1, user, null, true, true);

        resource.setSecurity(List.of(groupSecurityReadRule, userSecurityReadWriteRule));

        assertTrue(restService.resourceAccessRead(user, 1));
        assertTrue(restService.resourceAccessWrite(user, 1));
    }

    @Test
    public void testRulesReadOnly() {
        SecurityRule groupSecurityRule = createSecurityRule(1, null, group, true, false);
        SecurityRule userSecurityRule = createSecurityRule(1, user, null, true, false);

        Resource resource = new Resource();
        resource.setId(1L);
        resource.setSecurity(List.of(groupSecurityRule, userSecurityRule));

        testResourceService.resources = List.of(resource);

        assertTrue(restService.resourceAccessRead(user, 1));
        assertFalse(restService.resourceAccessWrite(user, 1));
    }

    @Test
    public void testRulesAccessDenied() {
        SecurityRule groupSecurityRule = createSecurityRule(1, null, group, false, false);
        SecurityRule userSecurityRule = createSecurityRule(1, user, null, false, false);

        Resource resource = new Resource();
        resource.setId(1L);
        resource.setSecurity(List.of(groupSecurityRule, userSecurityRule));

        testResourceService.resources = List.of(resource);

        assertFalse(restService.resourceAccessRead(user, 1));
        assertFalse(restService.resourceAccessWrite(user, 1));
    }

    @Test
    public void testIgnoreNotValidUserRules() {
        SecurityRule groupSecurityRule = createSecurityRule(1, null, group, false, false);
        SecurityRule invalidSecurityRule = createSecurityRule(1, null, group, true, false);
        SecurityRule userSecurityRule = createSecurityRule(1, user, null, true, true);

        Resource resource = new Resource();
        resource.setId(1L);
        resource.setSecurity(List.of(groupSecurityRule, invalidSecurityRule, userSecurityRule));

        testResourceService.resources = List.of(resource);

        assertTrue(restService.resourceAccessRead(user, 1));
        assertTrue(restService.resourceAccessWrite(user, 1));
    }

    @Test
    public void testGuestHasEveryoneGroup() {
        Principal principal = restService.createGuestPrincipal();
        assertTrue(principal instanceof UsernamePasswordAuthenticationToken);
        UsernamePasswordAuthenticationToken userPrincipal =
                (UsernamePasswordAuthenticationToken) principal;
        assertTrue(userPrincipal.getPrincipal() instanceof User);
        User user = (User) userPrincipal.getPrincipal();
        assertEquals(1, user.getGroups().size());
        assertEquals(
                GroupReservedNames.EVERYONE.groupName(),
                user.getGroups().iterator().next().getGroupName());
    }

    public void testExtractUserIP() {

        String remoteIP = "4.88.132.112";

        mockHttpRequestIPAddressAttribute(remoteIP, List.of(), "");

        IPAddress ipAddress =
                restService.extractAuthUser(new SimpleSecurityContext(user)).getIpAddress();

        assertEquals(remoteIP, ipAddress.toAddressString().toString());
    }

    public void testExtractUserIPv6() {

        String remoteIP = "0:0:0:0:0:0:0:1";

        mockHttpRequestIPAddressAttribute(remoteIP, List.of(), "");

        IPAddress ipAddress =
                restService.extractAuthUser(new SimpleSecurityContext(user)).getIpAddress();

        assertEquals(remoteIP, ipAddress.toAddressString().toString());
    }

    public void testExtractUserIPv6WithParenthesis() {

        String remoteIP = "[0:0:0:0:0:0:0:1]";

        mockHttpRequestIPAddressAttribute(remoteIP, List.of(), "");

        IPAddress ipAddress =
                restService.extractAuthUser(new SimpleSecurityContext(user)).getIpAddress();

        assertEquals("0:0:0:0:0:0:0:1", ipAddress.toAddressString().toString());
    }

    public void testExtractUserIPWhenForwarded() {

        String forwardedIP = "12.12.12.12";

        mockHttpRequestIPAddressAttribute("localhost", List.of(forwardedIP), "");

        IPAddress ipAddress =
                restService.extractAuthUser(new SimpleSecurityContext(user)).getIpAddress();

        assertEquals(forwardedIP, ipAddress.toAddressString().toString());
    }

    public void testExtractUserIPWhenForwardedMultipleTimes() {

        String forwardedIPA = "152.221.232.124";
        String forwardedIPB = "54.36.51.65";

        mockHttpRequestIPAddressAttribute("localhost", List.of(forwardedIPA, forwardedIPB), "");

        IPAddress ipAddress =
                restService.extractAuthUser(new SimpleSecurityContext(user)).getIpAddress();

        assertEquals(forwardedIPA, ipAddress.toAddressString().toString());
    }

    public void testExtractUserIPWhenForwardedWithRealIP() {

        String realIP = "112.112.112.1";

        mockHttpRequestIPAddressAttribute("localhost", List.of(), realIP);

        IPAddress ipAddress =
                restService.extractAuthUser(new SimpleSecurityContext(user)).getIpAddress();

        assertEquals(realIP, ipAddress.toAddressString().toString());
    }

    public void testExtractUserIPPrecedence() {

        String ipA = "76.41.15.54";
        String ipB = "12.6.0.3";
        String ipC = "1922.12.45.5";

        mockHttpRequestIPAddressAttribute(ipA, List.of(ipB), ipC);

        IPAddress ipAddress =
                restService.extractAuthUser(new SimpleSecurityContext(user)).getIpAddress();

        assertEquals(ipB, ipAddress.toAddressString().toString());
    }

    public void testErrorExtractingUserIp() {

        String remoteIP = "localhost";

        mockHttpRequestIPAddressAttribute(remoteIP, List.of(), "");

        assertThrows(
                InternalErrorWebEx.class,
                () -> restService.extractAuthUser(new SimpleSecurityContext(user)));
    }

    private static class TestUserService implements UserService {

        @Override
        public long insert(User user) throws BadRequestServiceEx, NotFoundServiceEx {
            // TODO Auto-generated method stub
            return 0;
        }

        @Override
        public long update(User user) throws NotFoundServiceEx, BadRequestServiceEx {
            // TODO Auto-generated method stub
            return 0;
        }

        @Override
        public boolean delete(long id) {
            // TODO Auto-generated method stub
            return false;
        }

        @Override
        public User get(long id) {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public User get(String name) throws NotFoundServiceEx {
            throw new NotFoundServiceEx(name);
        }

        @Override
        public List<User> getAll(Integer page, Integer entries) throws BadRequestServiceEx {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public List<User> getAll(
                Integer page, Integer entries, String nameLike, boolean includeAttributes)
                throws BadRequestServiceEx {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public long getCount(String nameLike) {
            // TODO Auto-generated method stub
            return 0;
        }

        @Override
        public void updateAttributes(long id, List<UserAttribute> attributes)
                throws NotFoundServiceEx {
            // TODO Auto-generated method stub

        }

        @Override
        public boolean insertSpecialUsers() {
            // TODO Auto-generated method stub
            return false;
        }

        @Override
        public Collection<User> getByAttribute(UserAttribute attribute) {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public Collection<User> getByGroup(UserGroup group) {
            // TODO Auto-generated method stub
            return null;
        }
    }

    private static class TestSecurityService implements SecurityService {
        private List<SecurityRule> userSecurityRules = null;
        private List<SecurityRule> groupSecurityRules = null;

        public void setUserSecurityRules(List<SecurityRule> userSecurityRules) {
            this.userSecurityRules = userSecurityRules;
        }

        public void setGroupSecurityRules(List<SecurityRule> groupSecurityRules) {
            this.groupSecurityRules = groupSecurityRules;
        }

        @Override
        public List<SecurityRule> getUserSecurityRule(String userName, long entityId) {
            return userSecurityRules;
        }

        @Override
        public List<SecurityRule> getGroupSecurityRule(List<String> groupNames, long entityId) {
            return groupSecurityRules;
        }
    }

    private static class TestResourceService implements ResourceService {

        List<Resource> resources = new ArrayList<>();

        @Override
        public long insert(Resource resource)
                throws BadRequestServiceEx, NotFoundServiceEx, DuplicatedResourceNameServiceEx {
            return 0;
        }

        @Override
        public long update(Resource resource)
                throws NotFoundServiceEx, DuplicatedResourceNameServiceEx {
            return 0;
        }

        @Override
        public boolean delete(long id) {
            return false;
        }

        @Override
        public void deleteResources(SearchFilter filter)
                throws BadRequestServiceEx, InternalErrorServiceEx {}

        @Override
        public Resource get(long id) {
            return null;
        }

        @Override
        public Resource getResource(
                long id,
                boolean includeAttributes,
                boolean includePermissions,
                boolean includeTags) {
            return this.resources.stream()
                    .filter(r -> r.getId().equals(id))
                    .findFirst()
                    .orElseThrow();
        }

        @Override
        public List<ShortResource> getList(ResourceSearchParameters resourceSearchParameters)
                throws BadRequestServiceEx, InternalErrorServiceEx {
            return List.of();
        }

        @Override
        public List<ShortResource> getAll(ResourceSearchParameters resourceSearchParameters)
                throws BadRequestServiceEx, InternalErrorServiceEx {
            return List.of();
        }

        @Override
        public long getCount(String nameLike) {
            return 0;
        }

        @Override
        public long getCountByFilter(SearchFilter filter)
                throws InternalErrorServiceEx, BadRequestServiceEx {
            return 0;
        }

        @Override
        public void updateAttributes(long id, List<Attribute> attributes)
                throws NotFoundServiceEx {}

        @Override
        public List<ShortAttribute> getAttributes(long id) {
            return List.of();
        }

        @Override
        public ShortAttribute getAttribute(long id, String name) {
            return null;
        }

        @Override
        public long updateAttribute(long id, String name, String value)
                throws InternalErrorServiceEx {
            return 0;
        }

        @Override
        public List<Resource> getResources(ResourceSearchParameters resourceSearchParameters)
                throws BadRequestServiceEx, InternalErrorServiceEx {
            return List.of();
        }

        @Override
        public List<ShortResource> getShortResources(
                ResourceSearchParameters resourceSearchParameters)
                throws BadRequestServiceEx, InternalErrorServiceEx {
            return List.of();
        }

        @Override
        public List<Resource> getResourcesFull(ResourceSearchParameters resourceSearchParameters)
                throws BadRequestServiceEx, InternalErrorServiceEx {
            return List.of();
        }

        @Override
        public List<SecurityRule> getSecurityRules(long id) {
            return List.of();
        }

        @Override
        public void updateSecurityRules(long id, List<SecurityRule> rules)
                throws BadRequestServiceEx, InternalErrorServiceEx, NotFoundServiceEx {}

        @Override
        public long count(SearchFilter filter, User user)
                throws BadRequestServiceEx, InternalErrorServiceEx {
            return 0;
        }

        @Override
        public long count(SearchFilter filter, User user, boolean favoritesOnly)
                throws BadRequestServiceEx, InternalErrorServiceEx {
            return 0;
        }

        @Override
        public long count(String nameLike, User user) throws BadRequestServiceEx {
            return 0;
        }

        @Override
        public long insertAttribute(long id, String name, String value, DataType type)
                throws InternalErrorServiceEx {
            return 0;
        }

        @Override
        public void fetchSecurityRules(Resource resource) {
            /* no-op */
        }

        @Override
        public void fetchFavorites(Resource resource) {
            /* no-op */
        }

        @Override
        public List<SecurityRule> getUserSecurityRule(String userName, long entityId) {
            return List.of();
        }

        @Override
        public List<SecurityRule> getGroupSecurityRule(List<String> groupNames, long entityId) {
            return List.of();
        }
    }

    private static class TESTRESTServiceImpl extends RESTServiceImpl {
        private SecurityService securityService = null;

        public void setSecurityService(SecurityService s) {
            securityService = s;
        }
    }
}
