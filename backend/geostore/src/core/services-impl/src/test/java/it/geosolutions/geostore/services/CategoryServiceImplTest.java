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

import it.geosolutions.geostore.core.model.Category;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

/**
 * Class CategoryServiceImplTest.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public class CategoryServiceImplTest extends ServiceTestBase {

    @BeforeClass
    public static void setUpClass() throws Exception {}

    @AfterClass
    public static void tearDownClass() throws Exception {}

    public CategoryServiceImplTest() {}

    @Test
    public void testInsertDeleteCategory() throws Exception {

        //
        // Creating and deleting category data
        //
        long categoryId = createCategory("SLD");

        assertEquals(1, categoryService.getCount(null));
        assertTrue("Could not delete category", categoryService.delete(categoryId));
        assertEquals(0, categoryService.getCount(null));
    }

    @Test
    public void testUpdateLoadData() throws Exception {
        final String NAME1 = "name1";
        final String NAME2 = "name2";

        long categoryId = createCategory(NAME1);

        assertEquals(1, categoryService.getCount(null));

        //
        // Updating category
        //
        {
            Category loaded = categoryService.get(categoryId);
            assertNotNull(loaded);
            assertEquals(NAME1, loaded.getName());

            loaded.setName(NAME2);

            try {
                categoryService.update(loaded);
                fail("Exception not trapped !");
            } catch (Exception exc) {
                if (LOGGER.isDebugEnabled()) {
                    LOGGER.debug("OK: exception trapped", exc);
                }
            }
        }

        //
        // Loading Category
        //
        {
            Category loaded = categoryService.get(categoryId);
            assertNotNull(loaded);
            assertEquals(NAME1, loaded.getName());
        }

        //
        // Deleting Category
        //
        {
            assertEquals(1, categoryService.getCount(null));
            categoryService.delete(categoryId);
            assertEquals(0, categoryService.getCount(null));
        }
    }
}
