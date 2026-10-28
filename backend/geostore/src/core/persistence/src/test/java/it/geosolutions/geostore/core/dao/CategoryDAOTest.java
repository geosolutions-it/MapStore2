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

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Test;

import java.util.Date;

/**
 * Class CategoryDAOTest.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public class CategoryDAOTest extends BaseDAOTest {

    private static final Logger LOGGER = LogManager.getLogger(CategoryDAOTest.class);

    /**
     * @throws Exception
     */
    @Test
    public void testPersistCategory() throws Exception {

        final String NAME = "NAME";

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Persisting Category");
        }

        long categoryId;
        long resourceId;
        // long securityId;

        //
        // PERSIST
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

            // SecurityRule security = new SecurityRule();
            // security.setCanRead(true);
            // security.setCanWrite(true);
            // security.setCategory(category);
            //
            // securityDAO.persist(security);
            // securityId = security.getId();

            // assertEquals(1, securityDAO.count(null));
            // assertEquals(1, securityDAO.findAll().size());
        }

        //
        // LOAD, UPDATE
        //
        {
            Category loaded = categoryDAO.find(categoryId);
            assertNotNull("Can't retrieve Category", loaded);
            assertEquals("MAP", loaded.getName());

            loaded.setName("SLD");
            categoryDAO.merge(loaded);

            loaded = categoryDAO.find(categoryId);
            assertNotNull("Can't retrieve Category", loaded);
            assertEquals("MAP", loaded.getName());
        }

        //
        // REMOVE, CASCADING
        //
        {
            categoryDAO.removeById(categoryId);
            assertNull("Category not deleted", categoryDAO.find(categoryId));
            assertNull("Resource not deleted", resourceDAO.find(resourceId));
            // assertNull("SecurityRule not deleted", securityDAO.find(securityId));
        }
    }
}
