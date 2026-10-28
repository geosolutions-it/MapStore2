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
import it.geosolutions.geostore.core.model.StoredData;

import org.junit.Test;

import java.util.Date;

/**
 * Class StoredDataDAOTest
 *
 * @author ETj (etj at geo-solutions.it)
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public class StoredDataDAOTest extends BaseDAOTest {

    @Test
    public void testPersistData() {

        final String NAME1 = "FIRST_DATA";
        final String NAME2 = "SECOND_DATA";

        long dataId;

        //
        // PERSIST test
        //
        {
            Category category = new Category();
            category.setName("MAP");

            categoryDAO.persist(category);

            assertEquals(1, categoryDAO.count(null));
            assertEquals(1, categoryDAO.findAll().size());

            Resource resource = new Resource();
            resource.setName(NAME1);
            resource.setCreation(new Date());
            resource.setCategory(category);

            resourceDAO.persist(resource);

            assertEquals(1, resourceDAO.count(null));
            assertEquals(1, resourceDAO.findAll().size());

            StoredData data = new StoredData();
            data.setData(NAME1);
            data.setResource(resource);
            data.setId(resource.getId());
            storedDataDAO.persist(data);
            resource.setData(data);
            resourceDAO.merge(resource);

            assertEquals(1, storedDataDAO.count(null));
            assertEquals(1, storedDataDAO.findAll().size());
            assertEquals(data.getId(), resource.getId());

            dataId = data.getId();
        }

        //
        // LOAD and UPDATE tests
        //
        {
            StoredData loaded = storedDataDAO.find(dataId);
            assertNotNull("Can't retrieve data", loaded);

            assertEquals(NAME1, loaded.getData());
            loaded.setData(NAME2);
            storedDataDAO.merge(loaded);
        }

        {
            StoredData loaded = storedDataDAO.find(dataId);
            assertNotNull("Can't retrieve data", loaded);
            assertEquals(NAME2, loaded.getData());
        }

        //
        // REMOVE test
        //
        // Resource owns the FK to StoredData, so the reference has to be cleared before
        // StoredData can be removed directly, otherwise the FK constraint is violated.
        Resource resource = resourceDAO.find(dataId);
        resource.setData(null);
        resourceDAO.merge(resource);

        storedDataDAO.removeById(dataId);
        assertNull("Data not deleted", storedDataDAO.find(dataId));
    }

    public void testBigData() {
        final int CAPACITY = 500000;

        // create ancillary data
        Category category = new Category();
        category.setName("BIG_TEST");

        categoryDAO.persist(category);
        assertEquals(1, categoryDAO.count(null));
        assertEquals(1, categoryDAO.findAll().size());

        Resource resource = new Resource();
        resource.setName("BIG_RESOURCE");
        resource.setCategory(category);

        resourceDAO.persist(resource);
        assertEquals(1, resourceDAO.count(null));
        assertEquals(1, resourceDAO.findAll().size());

        // build big data
        StringBuilder sb = new StringBuilder(CAPACITY);
        for (int i = 0; i < CAPACITY; i++) {
            sb.append(i % 10);
        }

        System.out.println("SB is " + sb.length() + " chars long");

        StoredData data = new StoredData();
        data.setData(sb.toString());
        data.setResource(resource);
        data.setId(resource.getId());

        storedDataDAO.persist(data);
        long id = data.getId();

        {
            StoredData loaded = storedDataDAO.find(id);
            assertNotNull("Can't retrieve data", loaded);
            assertEquals(CAPACITY, loaded.getData().length());
        }
    }
    // TODO missing tests for stored data security methods

}
