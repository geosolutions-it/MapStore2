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
package it.geosolutions.geostore.services.rest.utils;

import it.geosolutions.geostore.core.model.enums.DataType;
import it.geosolutions.geostore.services.dto.ShortAttribute;
import it.geosolutions.geostore.services.dto.search.AndFilter;
import it.geosolutions.geostore.services.dto.search.AttributeFilter;
import it.geosolutions.geostore.services.dto.search.BaseField;
import it.geosolutions.geostore.services.dto.search.CategoryFilter;
import it.geosolutions.geostore.services.dto.search.FieldFilter;
import it.geosolutions.geostore.services.dto.search.SearchFilter;
import it.geosolutions.geostore.services.dto.search.SearchOperator;
import it.geosolutions.geostore.services.rest.model.RESTCategory;
import it.geosolutions.geostore.services.rest.model.RESTQuickBackup;
import it.geosolutions.geostore.services.rest.model.RESTQuickBackup.RESTBackupCategory;
import it.geosolutions.geostore.services.rest.model.RESTQuickBackup.RESTBackupResource;
import it.geosolutions.geostore.services.rest.model.RESTResource;

import jakarta.xml.bind.JAXB;
import jakarta.xml.bind.JAXBException;

import junit.framework.TestCase;

import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.JDOMException;
import org.jdom2.input.SAXBuilder;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * @author ETj (etj at geo-solutions.it)
 */
public class FilterUnmarshalTest extends TestCase {

    public FilterUnmarshalTest() {}

    @BeforeClass
    public static void setUpClass() throws Exception {}

    @AfterClass
    public static void tearDownClass() throws Exception {}

    @Test
    public void testGetContext() throws JDOMException, IOException {
        SearchFilter searchFilter =
                new AndFilter(
                        new FieldFilter(BaseField.NAME, "%", SearchOperator.LIKE),
                        new CategoryFilter("theCategoryName", SearchOperator.EQUAL_TO),
                        new AttributeFilter(
                                "theLayerName", "layer", DataType.STRING, SearchOperator.EQUAL_TO));
        StringWriter writer = new StringWriter();
        JAXB.marshal(searchFilter, writer);
        String xml = writer.toString();

        System.out.println("Marshalled Filter is " + xml);

        StringReader reader = new StringReader(xml);
        SAXBuilder builder = new SAXBuilder();
        Document doc = builder.build(reader);
        Element root = doc.detachRootElement();

        assertEquals("AND", root.getName());
        assertNotNull(root.getChild("FIELD"));
        assertNotNull(root.getChild("CATEGORY"));
        assertNotNull(root.getChild("ATTRIBUTE"));
    }

    @Test
    public void testPrintRESTResource() throws JDOMException, IOException {

        RESTResource rr = new RESTResource();
        rr.setId(42L);
        rr.setName("TestResource");
        rr.setDescription("This is a sample RESTResource");
        rr.setAdvertised(true);
        rr.setCreation(new Date());
        rr.setLastUpdate(new Date());
        rr.setCategory(new RESTCategory("TestCategory"));
        rr.setData("Sample data content");
        rr.setMetadata("Sample metadata content");
        rr.setCreator("User1");
        rr.setEditor("User2");

        List<ShortAttribute> attr = new ArrayList<ShortAttribute>();
        attr.add(new ShortAttribute("attname1", "attvalue1", DataType.STRING));
        attr.add(new ShortAttribute("attname2", "42", DataType.NUMBER));

        rr.setAttribute(attr);

        StringWriter writer = new StringWriter();
        JAXB.marshal(rr, writer);
        String xml = writer.toString();

        System.out.println("Marshalled RESTResource is " + xml);
    }

    @Test
    public void testPrintBackup() throws JDOMException, IOException, JAXBException {
        RESTQuickBackup bk = new RESTQuickBackup();
        RESTBackupCategory c1 = new RESTBackupCategory();
        c1.setName("cat1");
        c1.getResources().add(createBKResource("res1", "cat1"));
        c1.getResources().add(createBKResource("res2", "cat1"));
        bk.addCategory(c1);

        RESTBackupCategory c2 = new RESTBackupCategory();
        c2.setName("cat2");
        c2.getResources().add(createBKResource("resX", "cat2"));
        c2.getResources().add(createBKResource("resY", "cat2"));
        bk.addCategory(c2);

        // JAXBContext context = GeoStoreJAXBContext.getContext();
        // context.createMarshaller().marshal(bk, System.out);

        StringWriter writer = new StringWriter();
        JAXB.marshal(bk, writer);
        String xml = writer.toString();

        System.out.println("Marshalled Backup is " + xml);
    }

    protected static RESTBackupResource createBKResource(String name, String catName) {
        RESTBackupResource r1 = new RESTBackupResource();
        r1.setResource(createRESTResource(name, catName));
        return r1;
    }

    protected static RESTResource createRESTResource(String name, String catName) {
        RESTResource rr1 = new RESTResource();
        rr1.setName(name);
        rr1.setCategory(new RESTCategory(catName));
        rr1.setAttribute(new ArrayList<ShortAttribute>());
        rr1.getAttribute().add(new ShortAttribute("att_x_" + name, "test", DataType.STRING));
        return rr1;
    }
}
