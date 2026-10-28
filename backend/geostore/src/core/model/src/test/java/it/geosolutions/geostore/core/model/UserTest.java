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

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class UserTest {
    private static final Marshaler<User> MARSHALER = new Marshaler<User>(User.class);

    public UserTest() {}

    @Test
    public void testMarshallingString() throws Exception {
        User u0 = new User();
        u0.setName("user name");
        u0.setEnabled(true);
        u0.setTrusted(true);

        doTheTest(u0);
    }

    private void doTheTest(User u0) {
        String s = MARSHALER.marshal(u0);
        User u = MARSHALER.unmarshal(s);

        assertTrue(u0.equals(u));
        assertFalse(u.isTrusted());
    }
}
