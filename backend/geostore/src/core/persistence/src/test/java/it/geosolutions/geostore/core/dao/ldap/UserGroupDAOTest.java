/*
 *  Copyright (C) 2019 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.core.dao.ldap;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import com.googlecode.genericdao.search.Filter;
import com.googlecode.genericdao.search.Search;

import it.geosolutions.geostore.core.dao.ldap.impl.UserGroupDAOImpl;
import it.geosolutions.geostore.core.ldap.MockContextSource;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;

import org.junit.Test;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class UserGroupDAOTest extends BaseDAOTest {

    @Test
    public void testFindAll() {
        UserGroupDAOImpl userGroupDAO =
                new UserGroupDAOImpl(new MockContextSource(buildContextForGroups()));
        userGroupDAO.setSearchBase("ou=groups");
        List<UserGroup> groups = userGroupDAO.findAll();
        assertEquals(2, groups.size());
        UserGroup group = groups.get(0);
        assertEquals("group", group.getGroupName());
    }

    @Test
    public void testSearchByName() {
        UserGroupDAOImpl userGroupDAO =
                new UserGroupDAOImpl(new MockContextSource(buildContextForGroups()));
        userGroupDAO.setSearchBase("ou=groups");

        Search search = new Search().addFilter(Filter.equal("groupName", "group"));

        List<UserGroup> groups = userGroupDAO.search(search);

        assertEquals(1, groups.size());
        UserGroup group = groups.get(0);
        assertEquals("group", group.getGroupName());
    }

    @Test
    public void testSearchByUser() {
        UserGroupDAOImpl userGroupDAO =
                new UserGroupDAOImpl(new MockContextSource(buildContextForGroups()));

        Set<String> userRoles = Set.of("USER", "MANAGER", "EDITOR");

        User user = new User();
        user.setId(-1L);
        user.setName("user");
        /* with LDAP direct, groups are created from user roles */
        user.setGroups(
                userRoles.stream()
                        .map(
                                groupName -> {
                                    UserGroup userGroup = new UserGroup();
                                    userGroup.setGroupName(groupName);
                                    return userGroup;
                                })
                        .collect(Collectors.toSet()));

        List<UserGroup> groups = userGroupDAO.searchByUser(user, new Search());

        assertEquals(3, groups.size());

        List<String> groupsNames = groups.stream().map(UserGroup::getGroupName).toList();
        assertTrue(groupsNames.containsAll(userRoles));
    }

    @Test
    public void testSearchByUserWithNameLikeFilter() {
        UserGroupDAOImpl userGroupDAO =
                new UserGroupDAOImpl(new MockContextSource(buildContextForGroups()));

        Set<String> userRoles = Set.of("USER", "USERS", "EDITOR");

        User user = new User();
        user.setId(-1L);
        user.setName("user");
        /* with LDAP direct, groups are created from user roles */
        user.setGroups(
                userRoles.stream()
                        .map(
                                groupName -> {
                                    UserGroup userGroup = new UserGroup();
                                    userGroup.setGroupName(groupName);
                                    return userGroup;
                                })
                        .collect(Collectors.toSet()));

        Search filteredSearch = new Search().addFilterILike("groupName", "*se*");

        List<UserGroup> groups = userGroupDAO.searchByUser(user, filteredSearch);

        assertEquals(2, groups.size());

        List<String> groupsNames = groups.stream().map(UserGroup::getGroupName).toList();
        assertTrue(groupsNames.containsAll(Set.of("USER", "USERS")));
    }

    @Test
    public void testSearchByUserWithNameLikeWildcardFilter() {
        UserGroupDAOImpl userGroupDAO =
                new UserGroupDAOImpl(new MockContextSource(buildContextForGroups()));

        Set<String> userRoles = Set.of("USER", "USERS", "EDITOR");

        User user = new User();
        user.setId(-1L);
        user.setName("user");
        /* with LDAP direct, groups are created from user roles */
        user.setGroups(
                userRoles.stream()
                        .map(
                                groupName -> {
                                    UserGroup userGroup = new UserGroup();
                                    userGroup.setGroupName(groupName);
                                    return userGroup;
                                })
                        .collect(Collectors.toSet()));

        Search filteredSearch = new Search().addFilterILike("groupName", "*");

        List<UserGroup> groups = userGroupDAO.searchByUser(user, filteredSearch);

        assertEquals(3, groups.size());

        List<String> groupsNames = groups.stream().map(UserGroup::getGroupName).toList();
        assertTrue(groupsNames.containsAll(userRoles));
    }

    @Test
    public void testAddEveryOne() {
        UserGroupDAOImpl userGroupDAO =
                new UserGroupDAOImpl(new MockContextSource(buildContextForGroups()));
        userGroupDAO.setSearchBase("ou=groups");
        userGroupDAO.setAddEveryOneGroup(true);

        List<UserGroup> groups = userGroupDAO.findAll();

        List<String> groupsNames = groups.stream().map(UserGroup::getGroupName).toList();
        assertTrue(groupsNames.containsAll(List.of("group", "group2", "everyone")));
    }
}
