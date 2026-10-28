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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

import java.util.Arrays;

/**
 * @author ETj (etj at geo-solutions.it)
 */
public class UserGroupTest {

    private static final Marshaler<UserGroup> MARSHALER = new Marshaler<UserGroup>(UserGroup.class);

    public UserGroupTest() {}

    @Test
    public void testMarshallingString() throws Exception {
        UserGroup g0 = new UserGroup();
        g0.setGroupName("group name");
        g0.setDescription("desciption");
        g0.setEnabled(true);

        User u0 = new User();
        u0.setName("user name");
        u0.setEnabled(true);
        g0.setUsers(Arrays.asList(u0));

        doTheTest(g0);
    }

    private void doTheTest(UserGroup g0) {
        String s = MARSHALER.marshal(g0);
        UserGroup ug = MARSHALER.unmarshal(s);
        assertEquals(0, ug.getUsers().size());
        assertTrue(g0.equals(ug));
    }
}
