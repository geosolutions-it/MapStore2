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

import it.geosolutions.geostore.core.model.Attribute;
import it.geosolutions.geostore.core.model.Category;
import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.StoredData;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserAttribute;
import it.geosolutions.geostore.core.model.UserGroup;

import junit.framework.TestCase;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Test;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import java.util.List;

/**
 * Class BaseDAOTest
 *
 * @author ETj (etj at geo-solutions.it)
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public abstract class BaseDAOTest extends TestCase {

    protected final Logger LOGGER;

    protected static StoredDataDAO storedDataDAO;

    protected static ResourceDAO resourceDAO;

    protected static AttributeDAO attributeDAO;

    protected static CategoryDAO categoryDAO;

    protected static SecurityDAO securityDAO;

    protected static SecurityDAO externalSecurityDAO;

    protected static IpRangeDAO ipRangeDAO;

    protected static UserAttributeDAO userAttributeDAO;

    protected static UserDAO userDAO;

    protected static UserGroupDAO userGroupDAO;

    protected static ClassPathXmlApplicationContext ctx = null;

    public BaseDAOTest() {
        LOGGER = LogManager.getLogger(getClass());

        synchronized (BaseDAOTest.class) {
            if (ctx == null) {
                String[] paths = {"applicationContext.xml"
                    // ,"applicationContext-test.xml"
                };
                ctx = new ClassPathXmlApplicationContext(paths);

                storedDataDAO = (StoredDataDAO) ctx.getBean("storedDataDAO");
                resourceDAO = (ResourceDAO) ctx.getBean("resourceDAO");
                attributeDAO = (AttributeDAO) ctx.getBean("attributeDAO");
                categoryDAO = (CategoryDAO) ctx.getBean("categoryDAO");
                securityDAO = (SecurityDAO) ctx.getBean("securityDAO");
                externalSecurityDAO = (SecurityDAO) ctx.getBean("externalSecurityDAO");
                ipRangeDAO = (IpRangeDAO) ctx.getBean("ipRangeDAO");
                userAttributeDAO = (UserAttributeDAO) ctx.getBean("userAttributeDAO");
                userDAO = (UserDAO) ctx.getBean("userDAO");
                userGroupDAO = (UserGroupDAO) ctx.getBean("userGroupDAO");
            }
        }
    }

    @Override
    protected void setUp() throws Exception {
        LOGGER.info("################ Running " + getClass().getSimpleName() + "::" + getName());
        super.setUp();
        removeAll();
        LOGGER.info("##### Ending setup for " + getName() + " ###----------------------");
    }

    @Test
    public void testCheckDAOs() {
        assertNotNull(storedDataDAO);
        assertNotNull(resourceDAO);
        assertNotNull(attributeDAO);
        assertNotNull(categoryDAO);
        assertNotNull(securityDAO);
        assertNotNull(externalSecurityDAO);
        assertNotNull(ipRangeDAO);
        assertNotNull(userAttributeDAO);
        assertNotNull(userDAO);
        assertNotNull(userGroupDAO);
    }

    protected void removeAll() {
        removeAllResource();
        removeAllStoredData();
        removeAllAttribute();
        removeAllUserAttribute();
        removeAllCategory();
        removeAllUser();
        removeAllUserGroup();
    }

    private void removeAllUser() {
        List<User> list = userDAO.findAll();
        for (User item : list) {
            LOGGER.info("Removing " + item.getId());
            boolean ret = userDAO.remove(item);
            assertTrue("User not removed", ret);
        }

        assertEquals("Users have not been properly deleted", 0, userDAO.count(null));
    }

    private void removeAllUserGroup() {
        List<UserGroup> list = userGroupDAO.findAll();
        for (UserGroup item : list) {
            LOGGER.info("Removing " + item.getId());
            boolean ret = userGroupDAO.remove(item);
            assertTrue("UserGroup not removed", ret);
        }

        assertEquals("UserGroup have not been properly deleted", 0, userGroupDAO.count(null));
    }

    private void removeAllCategory() {
        List<Category> list = categoryDAO.findAll();
        for (Category item : list) {
            LOGGER.info("Removing " + item.getId());
            boolean ret = categoryDAO.remove(item);
            assertTrue("Category not removed", ret);
        }

        assertEquals("Category have not been properly deleted", 0, categoryDAO.count(null));
    }

    private void removeAllUserAttribute() {
        List<UserAttribute> list = userAttributeDAO.findAll();
        for (UserAttribute item : list) {
            LOGGER.info("Removing " + item.getId());
            boolean ret = userAttributeDAO.remove(item);
            assertTrue("UserAttribute not removed", ret);
        }

        assertEquals(
                "UserAttribute have not been properly deleted", 0, userAttributeDAO.count(null));
    }

    protected void removeAllStoredData() {
        List<StoredData> list = storedDataDAO.findAll();
        for (StoredData item : list) {
            LOGGER.info("Removing " + item.getId());
            boolean ret = storedDataDAO.remove(item);
            assertTrue("StoredData not removed", ret);
        }

        assertEquals("StoredData have not been properly deleted", 0, storedDataDAO.count(null));
    }

    private void removeAllResource() {
        List<Resource> list = resourceDAO.findAll();
        for (Resource item : list) {
            LOGGER.info("Removing " + item.getId());
            boolean ret = resourceDAO.remove(item);
            assertTrue("Resource not removed", ret);
        }

        assertEquals("Resource have not been properly deleted", 0, resourceDAO.count(null));
    }

    private void removeAllAttribute() {
        List<Attribute> list = attributeDAO.findAll();
        for (Attribute item : list) {
            LOGGER.info("Removing " + item.getId());
            boolean ret = attributeDAO.remove(item);
            assertTrue("DataType not removed", ret);
        }

        assertEquals("DataType have not been properly deleted", 0, attributeDAO.count(null));
    }
}
