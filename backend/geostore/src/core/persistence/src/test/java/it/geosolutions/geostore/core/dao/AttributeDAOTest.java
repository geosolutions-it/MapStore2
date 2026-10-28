/*
 *  Copyright (C) 2007 - 2012 GeoSolutions S.A.S.
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

package it.geosolutions.geostore.core.dao;

import com.googlecode.genericdao.search.Filter;
import com.googlecode.genericdao.search.Search;

import it.geosolutions.geostore.core.model.Attribute;
import it.geosolutions.geostore.core.model.Category;
import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.StoredData;
import it.geosolutions.geostore.core.model.enums.DataType;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Test;

import java.util.Date;
import java.util.List;

/**
 * Class AttributeDAOTest
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 * @author ETj (etj at geo-solutions.it)
 */
public class AttributeDAOTest extends BaseDAOTest {

    private static final Logger LOGGER = LogManager.getLogger(AttributeDAOTest.class);

    @Test
    public void testPersistAttribute() {

        final String TEXT1 = "text1";
        final String TEXT2 = "text2";

        long id;
        long resourceId;

        //
        // PRE-PRESIST test
        //
        {
            Category category = new Category();
            category.setName("MAP");

            categoryDAO.persist(category);

            assertEquals(1, categoryDAO.count(null));
            assertEquals(1, categoryDAO.findAll().size());

            Resource resource = new Resource();
            resource.setName("resource1");
            resource.setCreation(new Date());
            resource.setCategory(category);

            resourceDAO.persist(resource);
            resourceId = resource.getId();

            assertEquals(1, resourceDAO.count(null));
            assertEquals(1, resourceDAO.findAll().size());

            StoredData data = new StoredData();
            data.setData("Dummy data");
            data.setResource(resource);
            data.setId(resourceId);

            storedDataDAO.persist(data);

            assertEquals(1, storedDataDAO.count(null));
            assertEquals(1, storedDataDAO.findAll().size());

            Attribute attribute = new Attribute();
            attribute.setName("attr1");
            attribute.setTextValue(TEXT1);
            attribute.setNumberValue(1.0);
            attribute.setDateValue(new Date());
            attribute.setResource(resource);

            try {
                attributeDAO.persist(attribute);
                fail("Exception not trapped");
            } catch (Exception exc) {
                if (LOGGER.isDebugEnabled()) {
                    LOGGER.debug("OK: exception trapped", exc);
                }
            }
        }

        //
        // PERSIST
        //
        {
            Resource resource = resourceDAO.find(resourceId);

            Attribute attribute = new Attribute();
            attribute.setName("attr1");
            attribute.setTextValue(TEXT1);
            attribute.setResource(resource);

            attributeDAO.persist(attribute);
            id = attribute.getId();

            Attribute loaded = attributeDAO.find(id);
            assertNotNull("Can't retrieve Attribute", loaded);

            resource = resourceDAO.find(resourceId);
            List<Attribute> attributes = resource.getAttribute();

            assertNotNull("Can't retrieve Attributes list from Resource", attributes);
            assertEquals(1, attributes.size());
        }

        //
        // PRE-UPDATE
        //
        {
            Attribute loaded = attributeDAO.find(id);
            assertEquals(TEXT1, loaded.getTextValue());
            loaded.setTextValue(TEXT2);
            loaded.setNumberValue(2.0);
            loaded.setDateValue(new Date());

            try {
                attributeDAO.merge(loaded);
                fail("Exception not trapped");
            } catch (Exception exc) {
                if (LOGGER.isDebugEnabled()) {
                    LOGGER.debug("OK: exception trapped", exc);
                }
            }
        }

        //
        // UPDATE
        //
        {
            Attribute loaded = attributeDAO.find(id);
            assertNotNull("Can't retrieve Attribute", loaded);

            assertEquals(TEXT1, loaded.getTextValue());
            loaded.setTextValue(TEXT2);
            attributeDAO.merge(loaded);
        }

        {
            Attribute loaded = attributeDAO.find(id);
            assertNotNull("Can't retrieve Attribute", loaded);
            assertEquals(TEXT2, loaded.getTextValue());
        }

        //
        // COUNT, FIND ALL
        //
        {
            assertEquals(1, attributeDAO.count(null));
            assertEquals(1, attributeDAO.findAll().size());
        }

        //
        // REMOVE
        //
        {
            attributeDAO.removeById(id);
            assertNull("Attribute not deleted", attributeDAO.find(id));
        }
    }

    @Test
    public void testSearchAttribute() {

        Category category = new Category();
        category.setName("MAP");

        categoryDAO.persist(category);

        assertEquals(1, categoryDAO.count(null));
        assertEquals(1, categoryDAO.findAll().size());

        Resource resource = new Resource();
        resource.setName("resource1");
        resource.setCreation(new Date());
        resource.setCategory(category);

        resourceDAO.persist(resource);

        assertEquals(1, resourceDAO.count(null));
        assertEquals(1, resourceDAO.findAll().size());

        StoredData data = new StoredData();
        data.setData("Dummy data");
        data.setResource(resource);
        data.setId(resource.getId());

        storedDataDAO.persist(data);
        resource.setData(data);
        resourceDAO.merge(resource);

        assertEquals(1, storedDataDAO.count(null));
        assertEquals(1, storedDataDAO.findAll().size());

        for (int i = 0; i < 10; i++) {
            Attribute attribute = new Attribute();
            attribute.setName("attrnumber" + i);
            attribute.setNumberValue(Integer.valueOf(i).doubleValue());
            attribute.setResource(resource);

            attributeDAO.persist(attribute);
        }

        for (int i = 11; i < 21; i++) {
            Attribute attribute = new Attribute();
            attribute.setName("attrtext" + i);
            attribute.setTextValue("textValue" + i);
            attribute.setResource(resource);

            attributeDAO.persist(attribute);
        }

        for (int i = 21; i < 31; i++) {
            Attribute attribute = new Attribute();
            attribute.setName("attrdate" + i);
            attribute.setDateValue(new Date());
            attribute.setResource(resource);

            attributeDAO.persist(attribute);
        }

        // TODO AND OR NOT EQUAL

        //
        // All attributes that matches a DataType
        //
        {
            Search criteria = new Search(Attribute.class);
            criteria.addFilterEqual("type", DataType.DATE);

            List<Attribute> attrList = attributeDAO.search(criteria);

            assertNotNull("Can't retrieve Attribute list", attrList);
            assertEquals(10, attrList.size());
        }

        //
        // All attributes that not matches a DataType
        //
        {
            Search criteria = new Search(Attribute.class);
            criteria.addFilterNotEqual("type", DataType.DATE);

            List<Attribute> attrList = attributeDAO.search(criteria);

            assertNotNull("Can't retrieve Attribute list", attrList);
            assertEquals(20, attrList.size());
        }

        //
        // All attributes that matches a NUMBER DataType and a range of values
        //
        {
            Search criteria = new Search(Attribute.class);
            criteria.addFilterEqual("type", DataType.NUMBER);
            criteria.addFilterGreaterThan("numberValue", 2.0);
            criteria.addFilterLessThan("numberValue", 8.0);
            criteria.addFilterILike("name", "%number%");

            List<Attribute> attrList = attributeDAO.search(criteria);

            assertNotNull("Can't retrieve Attribute list", attrList);
            assertEquals(5, attrList.size());

            for (Attribute attribute : attrList) {
                if (!attribute.getName().contains("attrnumber"))
                    fail("Attribute name not matched!");

                assertEquals(DataType.NUMBER, attribute.getType());
            }
        }

        //
        // All attributes that matches a DATE DataType and a range of values
        //
        {
            Search criteria = new Search(Attribute.class);
            criteria.addFilterEqual("type", DataType.DATE);
            criteria.addFilterLessThan("dateValue", new Date());
            criteria.addFilterILike("name", "%date%");

            List<Attribute> attrList = attributeDAO.search(criteria);

            assertNotNull("Can't retrieve Attribute list", attrList);
            assertEquals(10, attrList.size());

            for (Attribute attribute : attrList) {
                if (!attribute.getName().contains("attrdate")) fail("Attribute name not matched!");

                assertEquals(DataType.DATE, attribute.getType());
            }
        }

        //
        // All attributes that matches a DATE and STRING DataType
        //
        {
            Search criteria = new Search(Attribute.class);
            criteria.addFilterOr(
                    Filter.notEqual("type", DataType.NUMBER), Filter.equal("type", DataType.DATE));

            List<Attribute> attrList = attributeDAO.search(criteria);

            assertNotNull("Can't retrieve Attribute list", attrList);
            assertEquals(20, attrList.size());

            for (Attribute attribute : attrList)
                if (attribute.getType().equals(DataType.NUMBER))
                    fail("Attribute type not matched!");
        }

        //
        // CASCADING test
        //
        {
            resourceDAO.removeById(resource.getId());
            assertNull("Resource not deleted", resourceDAO.find(resource.getId()));
            assertEquals(0, attributeDAO.count(null));
            assertEquals(0, storedDataDAO.count(null));
        }
    }
}
