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

import static org.junit.Assert.*;

import com.googlecode.genericdao.search.Filter;
import com.googlecode.genericdao.search.Search;

import it.geosolutions.geostore.core.dao.ldap.impl.UserDAOImpl;
import it.geosolutions.geostore.core.dao.ldap.impl.UserGroupDAOImpl;
import it.geosolutions.geostore.core.ldap.MockContextSource;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.Role;

import org.junit.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UserDAOTest extends BaseDAOTest {

    @Test
    public void testFindAll() {
        UserDAOImpl userDAO = new UserDAOImpl(new MockContextSource(buildContextForUsers()));
        userDAO.setSearchBase("ou=users");
        List<User> users = userDAO.findAll();
        assertEquals(2, users.size());
        User user = users.get(0);
        assertEquals("username", user.getName());
    }

    @Test
    public void testSearchByName() {
        UserDAOImpl userDAO = new UserDAOImpl(new MockContextSource(buildContextForUsers()));
        userDAO.setSearchBase("ou=users");
        Search search = new Search(User.class);
        List<User> users = userDAO.search(search.addFilter(Filter.equal("name", "username")));
        assertEquals(1, users.size());
        User user = users.get(0);
        assertEquals("username", user.getName());
    }

    @Test
    public void testGroupsAreFetched() {
        UserDAOImpl userDAO = new UserDAOImpl(new MockContextSource(buildContextForUsers()));
        userDAO.setSearchBase("ou=users");
        UserGroupDAOImpl userGroupDAO =
                new UserGroupDAOImpl(new MockContextSource(buildContextForGroups()));
        userGroupDAO.setSearchBase("ou=groups");
        userDAO.setUserGroupDAO(userGroupDAO);

        Search search = new Search(User.class);
        List<User> users = userDAO.search(search.addFilter(Filter.equal("name", "username")));

        User user = users.get(0);
        assertEquals(2, user.getGroups().size());
    }

    @Test
    public void testRolesAreAssigned() {
        UserDAOImpl userDAO = new UserDAOImpl(new MockContextSource(buildContextForUsers()));
        userDAO.setSearchBase("ou=users");
        userDAO.setAdminRoleGroup("admin");
        UserGroupDAOImpl userGroupDAO =
                new UserGroupDAOImpl(new MockContextSource(buildContextForGroups()));
        userGroupDAO.setSearchBase("ou=groups");
        userDAO.setUserGroupDAO(userGroupDAO);

        Search search = new Search(User.class);
        List<User> users = userDAO.search(search.addFilter(Filter.equal("name", "username")));

        User user = users.get(0);
        assertEquals(Role.ADMIN, user.getRole());

        search = new Search(User.class);
        users = userDAO.search(search.addFilter(Filter.equal("name", "username2")));

        user = users.get(0);
        assertEquals(Role.USER, user.getRole());
    }

    @Test
    public void testAttributesMapper() {
        UserDAOImpl userDAO = new UserDAOImpl(new MockContextSource(buildContextForUsers()));
        Map<String, String> mapper = new HashMap<>();
        mapper.put("mail", "email");
        userDAO.setAttributesMapper(mapper);
        userDAO.setSearchBase("ou=users");
        List<User> users = userDAO.findAll();
        User user = users.get(0);
        assertEquals("username", user.getName());
        assertEquals(1, user.getAttribute().size());
        assertEquals("email", user.getAttribute().get(0).getName());
    }

    @Test
    public void testSearchByGroup() {
        UserGroupDAOImpl userGroupDAO =
                new UserGroupDAOImpl(new MockContextSource(buildContextForGroupsMembership(null)));
        userGroupDAO.setSearchBase("ou=groups");
        UserDAOImpl userDAO = new UserDAOImpl(new MockContextSource(buildContextForUsers()));
        userDAO.setUserGroupDAO(userGroupDAO);
        userDAO.setSearchBase("ou=users");
        userGroupDAO.setUserDAO(userDAO);
        Search search = new Search(User.class);
        List<User> users =
                userDAO.search(
                        search.addFilter(
                                Filter.some("groups", Filter.equal("groupName", "group"))));
        assertEquals(1, users.size());
        User user = users.get(0);
        assertEquals("username", user.getName());
    }

    @Test
    public void testMemberPattern() {
        UserGroupDAOImpl userGroupDAO =
                new UserGroupDAOImpl(
                        new MockContextSource(
                                buildContextForGroupsMembership("uid=username,ou=users")));
        userGroupDAO.setSearchBase("ou=groups");
        UserDAOImpl userDAO = new UserDAOImpl(new MockContextSource(buildContextForUsers()));
        userDAO.setUserGroupDAO(userGroupDAO);
        userDAO.setSearchBase("ou=users");
        userDAO.setMemberPattern("^uid=([^,]+).*$");
        userGroupDAO.setUserDAO(userDAO);
        Search search = new Search(User.class);
        List<User> users =
                userDAO.search(
                        search.addFilter(
                                Filter.some("groups", Filter.equal("groupName", "group"))));
        assertEquals(1, users.size());
        User user = users.get(0);
        assertEquals("username", user.getName());
    }

    @Test
    public void testGroupsAreFetchedWithoutNestedUsers() {
        UserDAOImpl userDAO = new UserDAOImpl(new MockContextSource(buildContextForUsers()));
        userDAO.setSearchBase("ou=users");
        UserGroupDAOImpl userGroupDAO =
                new UserGroupDAOImpl(new MockContextSource(buildContextForGroups()));
        userGroupDAO.setSearchBase("ou=groups");
        userDAO.setUserGroupDAO(userGroupDAO);

        Search search = new Search(User.class);
        List<User> users = userDAO.search(search.addFilter(Filter.equal("name", "username")));

        User user = users.get(0);
        assertEquals(2, user.getGroups().size());
        assertTrue(user.getGroups().stream().anyMatch(g -> g.getGroupName().equals("group")));
        // nested users not available when requesting them through UserDAO
        for (UserGroup group : user.getGroups()) {
            assertTrue(group.getUsers().isEmpty());
        }

        // but yes, the group with groupName group actually jas user assigned to it.
        Search search1 = new Search();
        Filter filter = Filter.equal("groupName", "group");
        search1.addFilter(filter);
        List<UserGroup> groups = userGroupDAO.search(search1);
        assertFalse(groups.get(0).getUsers().isEmpty());
    }
}
