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
package it.geosolutions.geostore.core.model;

import static org.junit.Assert.assertTrue;

import org.junit.Test;

/**
 * @author ETj (etj at geo-solutions.it)
 */
public class CategoryTest {

    private static final Marshaler<Category> MARSHALER = new Marshaler<Category>(Category.class);

    public CategoryTest() {}

    @Test
    public void testMarshallingString() throws Exception {
        Category c0 = new Category();
        c0.setName("testatt");
        c0.setId(1l);

        doTheTest(c0);
    }

    private void doTheTest(Category a0) {
        String s = MARSHALER.marshal(a0);
        Category a1 = MARSHALER.unmarshal(s);

        System.out.println(a0);
        System.out.println(a1);
        System.out.println(s);

        assertTrue(a0.equals(a1));
    }
}
