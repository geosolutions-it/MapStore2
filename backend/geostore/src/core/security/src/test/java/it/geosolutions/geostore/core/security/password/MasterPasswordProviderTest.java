/*
 *  Copyright (C) 2007 - 2014 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.core.security.password;

import static it.geosolutions.geostore.core.security.password.SecurityUtils.toChars;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

/**
 * Test the Random Permutation
 *
 * @author Lorenzo Natali
 */
public class MasterPasswordProviderTest {

    @Test
    public void testCodec() {
        URLMasterPasswordProvider mp = new URLMasterPasswordProvider();
        String testString = "thisIsMyPassword";
        char[] test = testString.toCharArray();
        byte[] encPass = mp.encode(test);
        // System.out.println(toChars(encPass));
        byte[] dec = mp.decode(encPass);
        mp.setEncrypting(true);
        assertTrue(testString.equals(new String(toChars(dec))));

        String geostore = "kfn8fAS8YMHgLxR8i3VBhzenrp3lnLLT";
        String geoserver1 = "F8fX7L2gs8H5SVD2q7HoC3IKo/0QAbEx";
        String geoserver2 = "5Cjk79u2Ya9RVfhn72xBLpVXjiGGL4+R";

        System.out.println(new String(toChars(mp.decode(geostore.getBytes()))));
        assertEquals("geostore", new String(toChars(mp.decode(geostore.getBytes()))));
        assertEquals("geoserver1", new String(toChars(mp.decode(geoserver1.getBytes()))));
        assertEquals("geoserver2", new String(toChars(mp.decode(geoserver2.getBytes()))));
    }

    @Test
    public void testURL() {}
}
