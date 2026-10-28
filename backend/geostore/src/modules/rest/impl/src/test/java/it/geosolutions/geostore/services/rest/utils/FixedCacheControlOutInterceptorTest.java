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

import static org.junit.Assert.assertEquals;

import org.apache.cxf.jaxrs.impl.MetadataMap;
import org.apache.cxf.message.Message;
import org.apache.cxf.message.MessageImpl;
import org.junit.Test;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;

/**
 * @author Emanuele Tajariol (etj at geo-solutions.it)
 */
public class FixedCacheControlOutInterceptorTest {

    @Test
    public void testCacheControlHeader() {
        Message message = new MessageImpl();
        ByteArrayOutputStream sw = new ByteArrayOutputStream();
        message.setContent(OutputStream.class, sw);
        FixedCacheControlOutInterceptor interceptor = new FixedCacheControlOutInterceptor();
        interceptor.handleMessage(message);
        @SuppressWarnings("unchecked")
        MetadataMap<String, Object> headers =
                (MetadataMap<String, Object>) message.get(Message.PROTOCOL_HEADERS);
        assertEquals(headers.get("Expires").get(0), "-1");
        assertEquals(headers.get("Cache-Control").get(0), "no-cache");
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testCacheControlPreserveExisting() {
        Message message = new MessageImpl();
        ByteArrayOutputStream sw = new ByteArrayOutputStream();
        message.setContent(OutputStream.class, sw);
        MetadataMap<String, Object> headers =
                (MetadataMap<String, Object>) message.get(Message.PROTOCOL_HEADERS);
        if (headers == null) {
            headers = new MetadataMap<String, Object>();
        }
        headers.add("Test", "Test");
        message.put(Message.PROTOCOL_HEADERS, headers);
        FixedCacheControlOutInterceptor interceptor = new FixedCacheControlOutInterceptor();

        interceptor.handleMessage(message);

        headers = (MetadataMap<String, Object>) message.get(Message.PROTOCOL_HEADERS);
        headers.get("Cache-Control").get(0);
        assertEquals(headers.get("Cache-Control").get(0), "no-cache");
        assertEquals(headers.get("Expires").get(0), "-1");
        assertEquals(headers.get("Test").get(0), "Test");
    }
}
