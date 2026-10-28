/* ====================================================================
 *
 * Copyright (C) 2026 GeoSolutions S.r.l.
 * http://www.geo-solutions.it
 *
 * GPLv3 + Classpath exception
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.
 *
 * ====================================================================
 *
 * This software consists of voluntary contributions made by developers
 * of GeoSolutions.  For more information on GeoSolutions, please see
 * <http://www.geo-solutions.it/>.
 *
 */
package it.geosolutions.geostore.services.rest.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

/**
 * Covers the {@code RESTStoredDataServiceImpl} XML/JSON/plaintext format conversion that was
 * reimplemented on Jackson (it had no test before). The pre-Jackson net.sf.json {@code
 * XMLSerializer} paths required the optional XOM library, which is not on the classpath, so they
 * threw {@code NoClassDefFoundError} at runtime — this guards the working Jackson behavior and the
 * {@code <data>} root element (instead of Jackson's default {@code <ObjectNode>}).
 */
class RESTStoredDataServiceConversionTest {

    private static final ObjectMapper JSON = new ObjectMapper();
    private static final XmlMapper XML = new XmlMapper();

    private String convert(String method, String data) throws Exception {
        RESTStoredDataServiceImpl svc = new RESTStoredDataServiceImpl();
        Method m = RESTStoredDataServiceImpl.class.getDeclaredMethod(method, String.class);
        m.setAccessible(true);
        return (String) m.invoke(svc, data);
    }

    private boolean isJson(String s) {
        try {
            JSON.readTree(s);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isXml(String s) {
        try {
            XML.readTree(s.getBytes());
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Test
    void toJSON_fromXml_producesJson() throws Exception {
        String out = convert("toJSON", "<map><layer>a</layer><layer>b</layer></map>");
        assertTrue(isJson(out), "XML must convert to valid JSON, got: " + out);
        assertTrue(out.contains("layer"), out);
    }

    @Test
    void toJSON_fromJson_isValidJsonPassthrough() throws Exception {
        String in = "{\"a\":1,\"b\":[2,3]}";
        String out = convert("toJSON", in);
        assertEquals(in, out, "already-JSON input must pass through unchanged");
    }

    @Test
    void toJSON_fromPlaintext_wrapsInDataField() throws Exception {
        String out = convert("toJSON", "hello world");
        assertEquals("{\"data\":\"hello world\"}", out);
    }

    @Test
    void toXML_fromJson_usesDataRootNotObjectNode() throws Exception {
        String out = convert("toXML", "{\"a\":1,\"b\":2}");
        assertTrue(isXml(out), "must be valid XML, got: " + out);
        assertTrue(out.contains("<data>"), "JSON->XML must use a <data> root, got: " + out);
        assertFalse(
                out.contains("ObjectNode"),
                "must not leak Jackson's default <ObjectNode> root, got: " + out);
    }

    @Test
    void toXML_fromPlaintext_wrapsInDataElement() throws Exception {
        String out = convert("toXML", "hello world");
        assertTrue(isXml(out), out);
        assertTrue(out.contains("hello world"), out);
        assertTrue(out.contains("data"), out);
    }

    @Test
    void toXML_fromXml_returnsXml() throws Exception {
        String out = convert("toXML", "<root><n>1</n></root>");
        assertTrue(isXml(out), out);
        assertTrue(out.contains("<n>"), out);
    }
}
