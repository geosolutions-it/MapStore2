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
package it.geosolutions.geostore.services;

import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.StoredData;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

/**
 * Class StoredDataServiceImplTest.
 *
 * @author ETj (etj at geo-solutions.it)
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public class StoredDataServiceImplTest extends ServiceTestBase {

    @BeforeClass
    public static void setUpClass() throws Exception {}

    @AfterClass
    public static void tearDownClass() throws Exception {}

    public StoredDataServiceImplTest() {}

    @Test
    public void testInsertDeleteData() throws Exception {
        long resourceId = createResource("resource1", "description1", "MAP");

        long id = createData("data1", resourceService.get(resourceId));

        assertTrue("Could not delete data", storedDataService.delete(id));
    }

    @Test
    public void testUpdateData() throws Exception {
        final String DATA1 = "data1";
        final String DATA2 = "data2";

        long id;

        // Create resource
        {
            id = createResource("resource1", "description1", "MAP");
        }

        {
            Resource loadedRes = resourceService.get(id);
            assertNotNull("Resource not found", loadedRes);
            assertNull("Last Update == " + loadedRes.getLastUpdate(), loadedRes.getLastUpdate());
        }

        // setup data
        {
            createData(DATA1, resourceService.get(id));
        }

        {
            Resource loadedRes = resourceService.get(id);
            assertNotNull("Resource not found", loadedRes);
            assertNotNull(loadedRes.getLastUpdate());
        }

        {
            StoredData loadedData = storedDataService.get(id);
            assertNotNull(loadedData);

            assertEquals(DATA1, loadedData.getData());

            loadedData.setData(DATA2);
            storedDataService.update(loadedData.getId(), loadedData.getData());
        }

        {
            StoredData loaded = storedDataService.get(id);
            assertNotNull("Data not found", loaded);
            assertEquals(DATA2, loaded.getData());
        }

        assertTrue("Could not delete data", storedDataService.delete(id));
    }

    @Test
    public void testGetAllData() throws Exception {
        assertEquals(0, storedDataService.getAll().size());

        for (int i = 0; i < 10; i++) {
            long resourceId = createResource("resource" + i, "description" + i, "MAP" + i);
            createData("first_data" + i, resourceService.get(resourceId));
        }

        for (int i = 11; i < 21; i++) {
            long resourceId = createResource("resource" + i, "description" + i, "MAP" + i);
            createData("second_data" + i, resourceService.get(resourceId));
        }

        assertEquals(20, storedDataService.getAll().size());
    }
}
