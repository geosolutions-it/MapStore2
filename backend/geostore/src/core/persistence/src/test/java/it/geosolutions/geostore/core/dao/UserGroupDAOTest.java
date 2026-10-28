/*
 *  Copyright (C) 2007 - 2011 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.core.dao;

import com.googlecode.genericdao.search.Filter;
import com.googlecode.genericdao.search.Search;

import it.geosolutions.geostore.core.model.Category;
import it.geosolutions.geostore.core.model.SecurityRule;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.Role;

import jakarta.persistence.PersistenceException;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Test;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Class UserGroupDAOTest.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 * @author DamianoG
 */
public class UserGroupDAOTest extends BaseDAOTest {

    private static final Logger LOGGER = LogManager.getLogger(UserGroupDAOTest.class);

    /**
     * @throws Exception
     */
    @Test
    public void testPersistUserGroup() throws Exception {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Persisting UserGroup");
        }

        long securityId1;
        long securityId2;
        long userId1;
        long groupId2;
        User user2;

        //
        // PERSIST
        //
        {
            Category category = new Category();
            category.setName("MAP");

            categoryDAO.persist(category);

            assertEquals(1, categoryDAO.count(null));
            assertEquals(1, categoryDAO.findAll().size());

            Set<UserGroup> groups = new HashSet<UserGroup>();
            UserGroup g1 = new UserGroup();
            g1.setGroupName("GROUP1");
            UserGroup g2 = new UserGroup();
            g2.setGroupName("GROUP2");

            try {
                UserGroup g3 = new UserGroup();
                g3.setGroupName(
                        "GROUP3GROUP3GROUP3GROUP3GROUP3GROUP3GROUP3GROUP3GROUP3GROUP3GROUP3GROUP3GROUP3GROUP3GROUP3GROUP3GROUP3GROUP3");
                userGroupDAO.persist(g3);
            } catch (PersistenceException e) {
                assertTrue(true);
            }

            groups.add(g1);
            groups.add(g2);

            userGroupDAO.persist(g1);
            userGroupDAO.persist(g2);

            groupId2 = g2.getId();

            assertEquals(3, userGroupDAO.count(null));
            assertEquals(3, userGroupDAO.findAll().size());

            // Create User1, associate to him group1 and group2 and set an example security rule
            User user1 = new User();
            user1.setGroups(groups);
            user1.setName("USER1_NAME");
            user1.setNewPassword("user");
            user1.setRole(Role.ADMIN);

            userDAO.persist(user1);
            userId1 = user1.getId();

            assertEquals(1, userDAO.findAll().size());
            assertEquals(1, userDAO.count(null));

            SecurityRule security = new SecurityRule();
            security.setCanRead(true);
            security.setCanWrite(true);
            // Why set both user and group? just for test? The Application shouldn't allows that...
            security.setGroup(g1);
            security.setUser(user1);

            securityDAO.persist(security);
            securityId1 = security.getId();

            assertEquals(1, securityDAO.count(null));
            assertEquals(1, securityDAO.findAll().size());

            // Create User2, associate to him group2 and set an example security rule
            user2 = new User();
            user2.setGroups(groups);
            user2.setName("USER2_NAME");
            user2.setNewPassword("user");
            user2.setRole(Role.USER);

            userDAO.persist(user2);

            assertEquals(2, userDAO.findAll().size());
            assertEquals(2, userDAO.count(null));

            SecurityRule security2 = new SecurityRule();
            security2.setCanRead(true);
            security2.setCanWrite(true);
            // Set a security rule just for the group (the GeoStore application logic creates
            // another rule also for the owner user)
            security2.setGroup(g2);

            securityDAO.persist(security2);
            securityId2 = security2.getId();

            assertEquals(2, securityDAO.count(null));
            assertEquals(2, securityDAO.findAll().size());
        }

        //
        // LOAD, REMOVE, CASCADING
        //
        {
            // USER REMOVAL, the cascading on security rules relation  will remove also the related
            // rules.
            // The user is also the owner of the many2many relations with entity GROUP so the entry
            // on that relation table is automatically deleted.
            User user1 = userDAO.find(userId1);
            userDAO.remove(user1);
            assertEquals(1, securityDAO.count(null));
            assertEquals(1, securityDAO.findAll().size());
            assertEquals(1, userDAO.findAll().size());
            assertEquals(1, userDAO.count(null));
            assertEquals(3, userGroupDAO.findAll().size());
            assertEquals(3, userGroupDAO.count(null));
            assertNull("SecurityRule not deleted", securityDAO.find(securityId1));
            assertNotNull(
                    "Group SecurityRule deleted... that's a mistake!",
                    securityDAO.find(securityId2));

            // GROUP REMOVAL, being the entity USER the owner of the relation we should remove
            // manually the entries in the relationship table
            // removing the group association to all user
            UserGroup group2 = userGroupDAO.find(groupId2);
            assertNotNull(group2);
            List<User> users;
            {
                Search searchByGroup = new Search(User.class);
                searchByGroup.addFilterSome("groups", Filter.equal("id", groupId2));
                users = userDAO.search(searchByGroup);
            }
            assertEquals(1, users.size());
            assertEquals(2, users.get(0).getGroups().size());

            for (User u : users) {
                LOGGER.info("Removing group " + group2 + " from user " + u);
                assertTrue(u.removeGroup(groupId2));
                userDAO.merge(u);
            }

            {
                Search searchByGroup = new Search(User.class);
                searchByGroup.addFilterSome("groups", Filter.equal("id", groupId2));
                users = userDAO.search(searchByGroup);

                for (User u : users) {
                    LOGGER.error("Found user " + u);
                }
            }
            assertEquals(0, users.size());

            userGroupDAO.remove(group2);
            assertEquals(2, userGroupDAO.findAll().size());
            assertEquals(2, userGroupDAO.count(null));
            assertNull("Group SecurityRule not deleted", securityDAO.find(securityId2));
            userDAO.remove(user2);
        }
    }
}
