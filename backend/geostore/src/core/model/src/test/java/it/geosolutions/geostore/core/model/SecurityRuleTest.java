/*
 *  Copyright (C) 2019 GeoSolutions S.A.S.
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

public class SecurityRuleTest {
    private static final Marshaler<SecurityRule> MARSHALER =
            new Marshaler<SecurityRule>(SecurityRule.class);

    @Test
    public void testMarshallingUsername() throws Exception {
        SecurityRule sr0 = new SecurityRule();
        sr0.setUsername("testuser");
        doTheTest(sr0);
    }

    @Test
    public void testMarshallingGroupname() throws Exception {
        SecurityRule sr0 = new SecurityRule();
        sr0.setGroupname("testgroup");
        doTheTest(sr0);
    }

    private void doTheTest(SecurityRule a0) {
        String s = MARSHALER.marshal(a0);
        SecurityRule a1 = MARSHALER.unmarshal(s);

        assertTrue(a0.equals(a1));
    }
}
