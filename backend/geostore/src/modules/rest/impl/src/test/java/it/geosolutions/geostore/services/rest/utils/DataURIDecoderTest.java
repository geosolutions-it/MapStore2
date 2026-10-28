/*
 * Copyright (C) 2016 GeoSolutions
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package it.geosolutions.geostore.services.rest.utils;

import static org.junit.Assert.*;

import org.junit.Test;

/**
 * @author Emanuele Tajariol (etj at geo-solutions.it)
 */
public class DataURIDecoderTest {

    @Test
    public void testInvalid() {

        DataURIDecoder dud = new DataURIDecoder("this is no data");
        assertFalse(dud.isValid());
    }

    @Test
    public void testBase() {

        DataURIDecoder dud = new DataURIDecoder("data:");
        assertTrue(dud.isValid());
        assertNull(dud.getMediatype());
        assertNull(dud.getCharset());
        assertNull(dud.getEncoding());

        assertFalse(dud.isBase64Encoded());
        assertEquals(DataURIDecoder.DEFAULT_MEDIA_TYPE, dud.getNormalizedMediatype());
    }

    @Test
    public void testMime() {

        DataURIDecoder dud = new DataURIDecoder("data:qwe/asd;");
        assertTrue(dud.isValid());
        assertEquals("qwe/asd", dud.getMediatype());
        assertNull(dud.getCharset());
        assertNull(dud.getEncoding());
        assertFalse(dud.isBase64Encoded());

        assertEquals("qwe/asd", dud.getNormalizedMediatype());
    }

    @Test
    public void testMimeBase64() {

        DataURIDecoder dud = new DataURIDecoder("data:qwe/asd;base64");
        assertTrue(dud.isValid());
        assertEquals("qwe/asd", dud.getMediatype());
        assertNull(dud.getCharset());
        assertEquals("base64", dud.getEncoding());
        assertTrue(dud.isBase64Encoded());

        assertEquals("qwe/asd", dud.getNormalizedMediatype());
    }

    @Test
    public void testMimeCharsetBase64() {

        DataURIDecoder dud = new DataURIDecoder("data:qwe/asd;charset=foo;base64");
        assertTrue(dud.isValid());
        assertEquals("qwe/asd", dud.getMediatype());
        assertEquals("foo", dud.getCharset());
        assertEquals("base64", dud.getEncoding());
        assertTrue(dud.isBase64Encoded());

        assertEquals("qwe/asd", dud.getNormalizedMediatype());
    }
}
