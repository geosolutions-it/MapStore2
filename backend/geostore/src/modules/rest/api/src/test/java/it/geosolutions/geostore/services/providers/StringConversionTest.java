/*  Copyright (C) 2007 - 2012 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.providers;

import jakarta.ws.rs.core.MediaType;

import junit.framework.TestCase;

import org.jdom2.JDOMException;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * @author Lorenzo Natali, GeoSolutions S.a.s.
 */
public class StringConversionTest extends TestCase {
    final String TEST_STRING = "àòèòù";

    public StringConversionTest() {}

    @BeforeClass
    public static void setUpClass() throws Exception {}

    @AfterClass
    public static void tearDownClass() throws Exception {}

    @Test
    public void testStringConversion() throws JDOMException, IOException {
        StringTextProvider provider = new StringTextProvider();
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        provider.writeTo(TEST_STRING, null, null, null, MediaType.APPLICATION_JSON_TYPE, null, os);
        assertEquals(TEST_STRING, os.toString());
    }
}
