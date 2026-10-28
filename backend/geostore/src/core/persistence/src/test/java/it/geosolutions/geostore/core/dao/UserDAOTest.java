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

import it.geosolutions.geostore.core.model.Category;
import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.SecurityRule;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserAttribute;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.Role;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Test;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/**
 * Class UserDAOTest.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public class UserDAOTest extends BaseDAOTest {

    private static final Logger LOGGER = LogManager.getLogger(UserDAOTest.class);

    /**
     * @throws Exception
     */
    @Test
    public void testPersistUser() throws Exception {

        final String NAME = "NAME";
        final String VALUE = "value";

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Persisting User");
        }

        long securityId1;
        long securityId2;
        long userId;
        long attributeId;

        //
        // PERSIST
        //
        {
            Category category = new Category();
            category.setName("MAP");

            categoryDAO.persist(category);

            assertEquals(1, categoryDAO.count(null));
            assertEquals(1, categoryDAO.findAll().size());

            Resource resource = new Resource();
            resource.setName(NAME);
            resource.setCreation(new Date());
            resource.setCategory(category);

            resourceDAO.persist(resource);

            assertEquals(1, resourceDAO.count(null));
            assertEquals(1, resourceDAO.findAll().size());

            Set<UserGroup> groups = new HashSet<UserGroup>();
            UserGroup g1 = new UserGroup();
            g1.setGroupName("GROUP1");
            UserGroup g2 = new UserGroup();
            g2.setGroupName("GROUP2");
            groups.add(g1);
            groups.add(g2);

            userGroupDAO.persist(g1);
            userGroupDAO.persist(g2);

            assertEquals(2, userGroupDAO.count(null));
            assertEquals(2, userGroupDAO.findAll().size());

            User user = new User();
            user.setGroups(groups);
            user.setName("USER_NAME");
            user.setNewPassword("user");
            user.setRole(Role.ADMIN);

            userDAO.persist(user);
            userId = user.getId();

            assertEquals(1, userDAO.count(null));
            assertEquals(1, userDAO.findAll().size());

            UserAttribute attribute = new UserAttribute();
            attribute.setName("attr1");
            attribute.setValue(VALUE);
            attribute.setUser(user);

            userAttributeDAO.persist(attribute);
            attributeId = attribute.getId();

            assertEquals(1, userAttributeDAO.count(null));
            assertEquals(1, userAttributeDAO.findAll().size());

            SecurityRule security1 = new SecurityRule();
            security1.setCanRead(true);
            security1.setCanWrite(true);
            security1.setResource(resource);
            security1.setGroup(g1);
            security1.setUser(user);

            securityDAO.persist(security1);
            securityId1 = security1.getId();

            assertEquals(1, securityDAO.count(null));
            assertEquals(1, securityDAO.findAll().size());

            SecurityRule security2 = new SecurityRule();
            security2.setCanRead(true);
            security2.setCanWrite(true);
            security2.setResource(resource);
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
            User loaded = userDAO.find(userId);
            assertNotNull("Can't retrieve User", loaded);

            userDAO.removeById(userId);
            assertNull("User not deleted", userDAO.find(userId));

            //
            // Cascading
            //
            assertNull("SecurityRule not deleted", securityDAO.find(securityId1));
            assertNotNull(
                    "Group SecurityRule deleted while deleting user...",
                    securityDAO.find(securityId2));
            assertNull("UserAttribute not deleted", userAttributeDAO.find(attributeId));
        }
    }
}
