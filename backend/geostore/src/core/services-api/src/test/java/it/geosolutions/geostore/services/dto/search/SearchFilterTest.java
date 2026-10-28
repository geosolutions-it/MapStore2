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
package it.geosolutions.geostore.services.dto.search;

import it.geosolutions.geostore.core.model.enums.DataType;

import jakarta.xml.bind.JAXB;
import jakarta.xml.bind.JAXBContext;
import jakarta.xml.bind.JAXBException;

import junit.framework.TestCase;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Test;

import java.io.StringReader;
import java.io.StringWriter;
import java.util.Iterator;
import java.util.List;

/**
 * Class SearchFilterTest.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 * @author ETj (etj at geo-solutions.it)
 */
public class SearchFilterTest extends TestCase {

    protected final Logger LOGGER = LogManager.getLogger(this.getClass());

    public SearchFilterTest() {}

    @Override
    protected void setUp() throws Exception {
        super.setUp();
        if (LOGGER.isInfoEnabled()) LOGGER.info("=============================== " + getName());

        if (LOGGER.isDebugEnabled()) LOGGER.debug("=============================== " + getName());
    }

    @Test
    public void testAndMarshallUnmarshall() throws JAXBException {
        SearchFilter base1 = new FieldFilter(BaseField.NAME, "*test*", SearchOperator.LIKE);
        SearchFilter att1 =
                new AttributeFilter("att1", "0.0", DataType.NUMBER, SearchOperator.GREATER_THAN);
        SearchFilter att2 =
                new AttributeFilter("att2", "attval", DataType.STRING, SearchOperator.EQUAL_TO);

        SearchFilter andatt = new AndFilter(att1, att2);
        SearchFilter orfinal = new AndFilter(base1, andatt);

        if (LOGGER.isDebugEnabled()) LOGGER.debug("FILTER: " + orfinal);

        marshallUnmarshallSearch(orfinal);
    }

    @Test
    public void testFieldMarshallUnmarshall() throws JAXBException {
        SearchFilter sf = new FieldFilter(BaseField.NAME, "*test*", SearchOperator.LIKE);

        if (LOGGER.isDebugEnabled()) LOGGER.debug("FILTER: " + sf);

        marshallUnmarshallSearch(sf);
    }

    private void marshallUnmarshallSearch(SearchFilter sf) throws JAXBException {
        if (LOGGER.isDebugEnabled()) LOGGER.debug("Marshalling: " + sf);

        StringWriter sw = new StringWriter();
        JAXB.marshal(sf, sw);

        if (LOGGER.isDebugEnabled()) LOGGER.debug("Marshalled into: " + sw.toString());

        StringReader sr = new StringReader(sw.getBuffer().toString());

        if (LOGGER.isDebugEnabled()) LOGGER.debug("Unmarshalling...");

        //
        // create context by hand
        //
        if (LOGGER.isDebugEnabled()) LOGGER.debug("Creating JAXB context by hand...");

        JAXBContext jc =
                JAXBContext.newInstance(
                        SearchFilter.class,
                        AndFilter.class,
                        AttributeFilter.class,
                        FieldFilter.class,
                        NotFilter.class,
                        OrFilter.class);
        SearchFilter sfOut = (SearchFilter) jc.createUnmarshaller().unmarshal(sr);

        if (LOGGER.isDebugEnabled()) LOGGER.debug("Unmarshalled: " + sfOut);
    }

    @Test
    public void testXMLParsing() {
        String xmlFilter =
                "<AND>"
                        + "<FIELD>"
                        + "<field>NAME</field>"
                        + "<operator>LIKE</operator>"
                        + "<value>*test*</value>"
                        + "</FIELD>"
                        + "<AND>"
                        + "<ATTRIBUTE>"
                        + "<name>attr1</name>"
                        + "<operator>EQUAL_TO</operator>"
                        + "<type>STRING</type>"
                        + "<value>value2</value>"
                        + "</ATTRIBUTE>"
                        + "<ATTRIBUTE>"
                        + "<name>attr2</name>"
                        + "<operator>GREATER_THAN</operator>"
                        + "<type>NUMBER</type>"
                        + "<value>1.0</value>"
                        + "</ATTRIBUTE>"
                        + "</AND>"
                        + "</AND>";

        StringReader reader = new StringReader(xmlFilter);
        AndFilter searchFilter = JAXB.unmarshal(reader, AndFilter.class);
        assertNotNull(searchFilter);

        List<SearchFilter> filters = searchFilter.getFilters();
        Iterator<SearchFilter> iterator = filters.iterator();

        while (iterator.hasNext()) {
            SearchFilter filter = iterator.next();

            if (filter instanceof FieldFilter) {
                FieldFilter fieldFilter = (FieldFilter) filter;

                assertEquals(BaseField.NAME, fieldFilter.getField());
                assertEquals(SearchOperator.LIKE, fieldFilter.getOperator());
                assertEquals("*test*", fieldFilter.getValue());

            } else if (filter instanceof AndFilter) {
                AndFilter andFilter = (AndFilter) filter;

                List<SearchFilter> andFilters = andFilter.getFilters();

                if (andFilters.get(0) instanceof AttributeFilter) {
                    AttributeFilter attrFilter = (AttributeFilter) andFilters.get(0);

                    assertEquals("attr1", attrFilter.getName());
                    assertEquals(SearchOperator.EQUAL_TO, attrFilter.getOperator());
                    assertEquals(DataType.STRING, attrFilter.getType());
                    assertEquals("value2", attrFilter.getValue());

                } else {
                    fail("Wrong type instance!");
                }

                if (andFilters.get(1) instanceof AttributeFilter) {
                    AttributeFilter attrFilter = (AttributeFilter) andFilters.get(1);

                    assertEquals(attrFilter.getName(), "attr2");
                    assertEquals(attrFilter.getOperator(), SearchOperator.GREATER_THAN);
                    assertEquals(attrFilter.getType(), DataType.NUMBER);
                    assertEquals(attrFilter.getValue(), "1.0");

                } else {
                    fail("Wrong type instance!");
                }

            } else {
                fail("Wrong type instance!");
            }
        }
    }
}
