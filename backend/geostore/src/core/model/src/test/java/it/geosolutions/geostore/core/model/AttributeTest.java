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

import static org.junit.Assert.*;

import it.geosolutions.geostore.core.model.enums.DataType;

import org.junit.Test;

import java.util.Date;

/**
 * @author ETj (etj at geo-solutions.it)
 */
public class AttributeTest {

    private static final Marshaler<Attribute> MARSHALER = new Marshaler<Attribute>(Attribute.class);

    public AttributeTest() {}

    @Test
    public void testMarshallingString() throws Exception {
        Attribute a0 = new Attribute();
        a0.setName("testatt");
        a0.setType(DataType.STRING);
        a0.setTextValue("test");

        doTheTest(a0);
    }

    private void doTheTest(Attribute a0) {
        String s = MARSHALER.marshal(a0);
        Attribute a1 = MARSHALER.unmarshal(s);

        System.out.println(a0);
        System.out.println(a1);
        System.out.println(s);

        assertTrue(a0.equals(a1));
    }

    @Test
    public void testMarshallingNumber() throws Exception {
        Attribute a0 = new Attribute();
        a0.setName("testatt");
        a0.setType(DataType.NUMBER);
        a0.setNumberValue(42d);

        doTheTest(a0);
    }

    @Test
    public void testMarshallingDate() throws Exception {
        Attribute a0 = new Attribute();
        a0.setName("testatt");
        a0.setType(DataType.DATE);
        a0.setDateValue(new Date());

        doTheTest(a0);
    }
}
