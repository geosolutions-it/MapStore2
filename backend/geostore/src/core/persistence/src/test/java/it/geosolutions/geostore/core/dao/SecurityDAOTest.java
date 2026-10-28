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
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.Role;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Test;

import java.util.Date;

/**
 * Class SecurityDAOTest.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public class SecurityDAOTest extends BaseDAOTest {

    private static final Logger LOGGER = LogManager.getLogger(SecurityDAOTest.class);

    /**
     * @throws Exception
     */
    @Test
    public void testPersistSecurity() throws Exception {
        final String NAME = "NAME";

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Persisting Security");
        }

        long categoryId;
        long resourceId;
        long securityId;

        //
        // PRE-PERSIST
        //
        {
            Category category = new Category();
            category.setName("MAP");

            categoryDAO.persist(category);
            categoryId = category.getId();

            assertEquals(1, categoryDAO.count(null));
            assertEquals(1, categoryDAO.findAll().size());

            Resource resource = new Resource();
            resource.setName(NAME);
            resource.setCreation(new Date());
            resource.setCategory(category);

            resourceDAO.persist(resource);
            resourceId = resource.getId();

            assertEquals(1, resourceDAO.count(null));
            assertEquals(1, resourceDAO.findAll().size());

            Resource loaded = resourceDAO.find(resourceId);
            assertNotNull(loaded);
            assertNull(loaded.getCreator());
            assertNull(loaded.getEditor());

            // SecurityRule security = new SecurityRule();
            // security.setCanRead(true);
            // security.setCanWrite(true);
            // security.setCategory(category);
            // security.setResource(resource);
            //
            // // ///////////////////////////////////////////////////////
            // // The Exception should be trapped because only one
            // // between resource and category can be specified
            // // ///////////////////////////////////////////////////////
            // try{
            // securityDAO.persist(security);
            // fail("Exception not trapped");
            // } catch(Exception exc) {
            // if(LOGGER.isDebugEnabled()){
            // LOGGER.debug("OK: exception trapped", exc);
            // }
            // }
        }

        //
        // PERSIST
        //
        {
            Resource loaded = resourceDAO.find(resourceId);
            SecurityRule security = new SecurityRule();
            security.setCanRead(true);
            security.setCanWrite(true);
            security.setResource(loaded);

            securityDAO.persist(security);
            securityId = security.getId();

            assertEquals(1, securityDAO.count(null));
            assertEquals(1, securityDAO.findAll().size());

            loaded = resourceDAO.find(resourceId);
            assertNull(loaded.getCreator());
            assertNull(loaded.getEditor());
        }

        //
        // UPDATE
        //
        {
            SecurityRule loaded = securityDAO.find(securityId);
            assertNotNull("Can't retrieve Security", loaded);

            assertTrue(loaded.isCanWrite());

            loaded.setCanWrite(false);
            securityDAO.merge(loaded);

            loaded = securityDAO.find(securityId);
            assertNotNull("Can't retrieve Security", loaded);
            assertFalse(loaded.isCanWrite());
        }

        //
        // LOAD, REMOVE
        //
        {
            securityDAO.removeById(securityId);
            assertNull("Security not deleted", securityDAO.find(categoryId));
        }
    }

    @Test
    public void testPersistSecurityUsingNames() throws Exception {
        final String NAME = "NAME";
        final String USERNAME = "USER";
        final String GROUPNAME = "GROUP";

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Persisting Security");
        }

        long categoryId;
        long resourceId;
        long securityId;
        long userId;
        long groupId;

        //
        // PRE-PERSIST
        //
        {
            Category category = new Category();
            category.setName("MAP");

            categoryDAO.persist(category);
            categoryId = category.getId();

            assertEquals(1, categoryDAO.count(null));
            assertEquals(1, categoryDAO.findAll().size());

            User user = new User();
            user.setName(USERNAME);
            user.setRole(Role.USER);
            userDAO.persist(user);
            userId = user.getId();
            assertEquals(1, userDAO.count(null));
            assertEquals(1, userDAO.findAll().size());

            UserGroup group = new UserGroup();
            group.setGroupName(GROUPNAME);
            userGroupDAO.persist(group);
            groupId = group.getId();
            assertEquals(1, userGroupDAO.count(null));
            assertEquals(1, userGroupDAO.findAll().size());

            Resource resource = new Resource();
            resource.setName(NAME);
            resource.setCreation(new Date());
            resource.setCategory(category);

            resourceDAO.persist(resource);
            resourceId = resource.getId();

            assertEquals(1, resourceDAO.count(null));
            assertEquals(1, resourceDAO.findAll().size());

            Resource loaded = resourceDAO.find(resourceId);
            assertNull(loaded.getCreator());
            assertNull(loaded.getEditor());
        }

        //
        // PERSIST WITH USERNAME
        //
        {
            SecurityRule security = new SecurityRule();
            security.setCanRead(true);
            security.setCanWrite(true);
            security.setResource(resourceDAO.find(resourceId));
            security.setUsername("testuser");
            securityDAO.persist(security);
            securityId = security.getId();

            assertEquals(1, securityDAO.count(null));
            assertEquals(1, securityDAO.findAll().size());
            SecurityRule rule = securityDAO.find(securityId);
            assertNotNull(rule);
            assertNotNull(rule.getUsername());

            Resource loaded = resourceDAO.find(resourceId);
            assertNotNull(loaded.getCreator());
            assertEquals("testuser", loaded.getCreator());
            assertNull(loaded.getEditor());
            securityDAO.removeById(securityId);
        }

        //
        // PERSIST WITH USER
        //
        {
            Resource loaded = resourceDAO.find(resourceId);
            loaded.setEditor(null);
            resourceDAO.merge(loaded);

            SecurityRule security = new SecurityRule();
            security.setCanRead(true);
            security.setCanWrite(true);
            security.setResource(resourceDAO.find(resourceId));
            User testUser = new User();
            testUser.setName("TheTestUser");
            testUser.setId(userId);
            security.setUser(testUser);
            securityDAO.persist(security);
            securityId = security.getId();

            assertEquals(1, securityDAO.count(null));
            assertEquals(1, securityDAO.findAll().size());
            SecurityRule rule = securityDAO.find(securityId);
            assertNotNull(rule);
            assertNotNull(rule.getUser());

            loaded = resourceDAO.find(resourceId);
            assertNotNull(loaded.getCreator());
            assertEquals("testuser", loaded.getCreator());
            assertNull(loaded.getEditor());

            securityDAO.removeById(securityId);
        }

        //
        // PERSIST WITH GROUPNAME
        //
        {
            SecurityRule security = new SecurityRule();
            security.setCanRead(true);
            security.setCanWrite(true);
            security.setResource(resourceDAO.find(resourceId));
            security.setGroupname("testgroup");
            securityDAO.persist(security);
            securityId = security.getId();

            assertEquals(1, securityDAO.count(null));
            assertEquals(1, securityDAO.findAll().size());
            SecurityRule rule = securityDAO.find(securityId);
            assertNotNull(rule);
            assertNotNull(rule.getGroupname());
            securityDAO.removeById(securityId);
        }

        //
        // PERSIST WITH GROUP
        //
        {
            SecurityRule security = new SecurityRule();
            security.setCanRead(true);
            security.setCanWrite(true);
            security.setResource(resourceDAO.find(resourceId));
            UserGroup testGroup = new UserGroup();
            testGroup.setId(groupId);
            security.setGroup(testGroup);
            securityDAO.persist(security);
            securityId = security.getId();

            assertEquals(1, securityDAO.count(null));
            assertEquals(1, securityDAO.findAll().size());
            SecurityRule rule = securityDAO.find(securityId);
            assertNotNull(rule);
            assertNotNull(rule.getGroup());
        }

        //
        // UPDATE
        //
        {
            SecurityRule loaded = securityDAO.find(securityId);
            assertNotNull("Can't retrieve Security", loaded);

            assertTrue(loaded.isCanWrite());

            loaded.setCanWrite(false);
            securityDAO.merge(loaded);

            loaded = securityDAO.find(securityId);
            assertNotNull("Can't retrieve Security", loaded);
            assertFalse(loaded.isCanWrite());
        }

        //
        // LOAD, REMOVE
        //
        {
            securityDAO.removeById(securityId);
            assertNull("Security not deleted", securityDAO.find(categoryId));
        }
    }
}
