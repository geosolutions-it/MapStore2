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

import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.services.ServiceTestBase;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;
import it.geosolutions.geostore.services.rest.model.RESTUserGroup;
import it.geosolutions.geostore.services.rest.model.UserGroupList;
import it.geosolutions.geostore.services.rest.utils.MockSecurityContext;

import jakarta.ws.rs.core.SecurityContext;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.util.List;

/**
 * Class ResourceServiceImplTest.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public class RESTUserGroupServiceImplTest extends ServiceTestBase {

    RESTUserGroupServiceImpl restService;

    @Before
    public void setUp() throws BadRequestServiceEx, NotFoundServiceEx {
        restService = new RESTUserGroupServiceImpl();
        restService.setUserGroupService(userGroupService);
        restService.setUserService(userService);
    }

    @After
    public void tearDown() throws Exception {
        removeAll();
    }

    @Test
    public void testGetAllWithUsers() throws Exception {
        // create some sample users
        long adminID = createUser("admin", Role.ADMIN, "admin");
        long userID = createUser("user", Role.USER, "user");

        // create a some sample usergroup
        createUserGroup("group", new long[] {adminID, userID});
        // create security context for the request
        SecurityContext sc = new MockSecurityContext(userService.get(adminID));

        // retrieve the list of usergroups (with users flag set to true)
        UserGroupList res = restService.getAll(sc, 0, 1000, true, true, null);
        List<RESTUserGroup> groups = res.getUserGroupList();
        assertEquals(1, groups.size());
        RESTUserGroup group = groups.get(0);
        assertEquals(2, group.getRestUsers().getList().size());
    }

    @Test
    public void testGetAllWithoutUsers() throws Exception {
        // create some sample users
        long adminID = createUser("admin", Role.ADMIN, "admin");
        long userID = createUser("user", Role.USER, "user");

        // create a some sample usergroup
        createUserGroup("group", new long[] {adminID, userID});
        // create security context for the request
        SecurityContext sc = new MockSecurityContext(userService.get(adminID));

        // retrieve the list of usergroups (with users flag set to false)
        UserGroupList res = restService.getAll(sc, 0, 1000, true, false, null);
        List<RESTUserGroup> groups = res.getUserGroupList();
        assertEquals(1, groups.size());
        RESTUserGroup group = groups.get(0);
        assertEquals(0, group.getRestUsers().getList().size());
    }

    @Test
    public void testGetAllPagination() throws Exception {

        final String firstGroupName = "group1";
        final String secondGroupName = "group2";
        final String thirdGroupName = "group3";

        long adminID = createUser("admin", Role.ADMIN, "admin");

        createUserGroup(firstGroupName, new long[] {});
        createUserGroup(secondGroupName, new long[] {});
        createUserGroup(thirdGroupName, new long[] {});

        SecurityContext sc = new MockSecurityContext(userService.get(adminID));

        UserGroupList firstPage = restService.getAll(sc, 0, 2, false, false, null);
        assertEquals(3, firstPage.getCount());
        List<RESTUserGroup> firstPageGroups = firstPage.getUserGroupList();
        List<String> firstPageGroupsNames =
                firstPageGroups.stream().map(RESTUserGroup::getGroupName).toList();
        assertEquals(List.of(firstGroupName, secondGroupName), firstPageGroupsNames);

        UserGroupList secondPage = restService.getAll(sc, 1, 2, false, false, null);
        assertEquals(3, firstPage.getCount());
        List<RESTUserGroup> secondPageGroups = secondPage.getUserGroupList();
        List<String> secondPageGroupsNames =
                secondPageGroups.stream().map(RESTUserGroup::getGroupName).toList();
        assertEquals(List.of(thirdGroupName), secondPageGroupsNames);
    }

    @Test
    public void testGetAllFiltered() throws Exception {

        final String groupAName = "group_A";
        final String groupBName = "groupB";
        final String groupCName = "this is group C";

        long adminID = createUser("admin", Role.ADMIN, "admin");

        createUserGroup(groupAName, new long[] {});
        createUserGroup(groupBName, new long[] {});
        createUserGroup(groupCName, new long[] {});

        SecurityContext sc = new MockSecurityContext(userService.get(adminID));

        UserGroupList allGroupsMatched = restService.getAll(sc, null, null, false, false, "group%");
        List<RESTUserGroup> allGroupsMatchedGroups = allGroupsMatched.getUserGroupList();
        List<String> allGroupsMatchedGroupsNames =
                allGroupsMatchedGroups.stream().map(RESTUserGroup::getGroupName).toList();
        assertTrue(List.of(groupAName, groupBName).containsAll(allGroupsMatchedGroupsNames));

        UserGroupList oneGroupMatched = restService.getAll(sc, null, null, false, false, "group_a");
        List<RESTUserGroup> oneGroupsMatchedGroups = oneGroupMatched.getUserGroupList();
        List<String> oneGroupMatchedGroupsNames =
                oneGroupsMatchedGroups.stream().map(RESTUserGroup::getGroupName).toList();
        assertEquals(List.of(groupAName), oneGroupMatchedGroupsNames);
    }
}
