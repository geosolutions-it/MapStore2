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
package it.geosolutions.geostore.services.rest.utils;

import jakarta.xml.bind.JAXBContext;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.net.URL;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.List;

/**
 * A JAXBContext of public GeoStore classes. Useful when unmarhasalling geostore classes.
 *
 * @author ETj (etj at geo-solutions.it)
 */
@SuppressWarnings("PMD.UnusedPrivateMethod")
public class GeoStoreJAXBContext {

    private static final Logger LOGGER = LogManager.getLogger(GeoStoreJAXBContext.class);

    private static final JAXBContext context;

    static {
        context = createNewContext();
    }

    /**
     * Use this method if you need to extend your context, or use the getContext() method if you
     * need the standard context.
     */
    public static JAXBContext createNewContext() {
        JAXBContext tmpContext = null;
        try {
            // This procedure has been commented out since it has problems in dealing with classes
            // inside jar files.
            // An explicit enumeration of the classes has been implemented instead.
            // String coreModelPackage = Resource.class.getPackage().getName();
            // String serviceApiPackage = ShortResource.class.getPackage().getName();
            // String restApiPackage = RESTResource.class.getPackage().getName();
            //
            // List<Class> coreModelClasses = getClasses(coreModelPackage);
            // List<Class> serviceApiClasses = getClasses(serviceApiPackage);
            // List<Class> restApiClasses = getClasses(restApiPackage);

            List<Class> allClasses = getGeoStoreClasses();

            if (LOGGER.isDebugEnabled())
                LOGGER.debug(
                        "Initializing GeoStoreJAXBContext with "
                                + allClasses.size()
                                + " classes "
                                + allClasses);

            tmpContext = JAXBContext.newInstance(allClasses.toArray(new Class[allClasses.size()]));
        } catch (Exception ex) {
            LOGGER.error("Can't create GeoStore context: " + ex.getMessage(), ex);
        }

        return tmpContext;
    }

    public static List<Class> getGeoStoreClasses() {
        // retrieve the explicit set of classes
        List coreModelClasses = getModelClasses();
        List serviceApiClasses = getAPIclasses();
        List restApiClasses = getRESTclasses();

        // merge the classes and create the context
        List<Class> allClasses =
                new ArrayList<Class>(
                        coreModelClasses.size() + serviceApiClasses.size() + restApiClasses.size());
        allClasses.addAll(coreModelClasses);
        allClasses.addAll(serviceApiClasses);
        allClasses.addAll(restApiClasses);

        return allClasses;
    }

    private static List<Class<? extends Serializable>> getModelClasses() {
        return Arrays.asList(
                it.geosolutions.geostore.core.model.Attribute.class,
                it.geosolutions.geostore.core.model.Category.class,
                it.geosolutions.geostore.core.model.UserGroup.class,
                it.geosolutions.geostore.core.model.Resource.class,
                it.geosolutions.geostore.core.model.SecurityRule.class,
                it.geosolutions.geostore.core.model.StoredData.class,
                it.geosolutions.geostore.core.model.User.class,
                it.geosolutions.geostore.core.model.UserAttribute.class,
                it.geosolutions.geostore.core.model.UserGroup.class,
                it.geosolutions.geostore.core.model.enums.AccessType.class,
                it.geosolutions.geostore.core.model.enums.DataType.class,
                it.geosolutions.geostore.core.model.enums.Role.class);
    }

    private static List<Class<? extends Serializable>> getAPIclasses() {
        return Arrays.asList(
                it.geosolutions.geostore.services.dto.ShortAttribute.class,
                it.geosolutions.geostore.services.dto.ShortResource.class,
                it.geosolutions.geostore.services.dto.search.AndFilter.class,
                it.geosolutions.geostore.services.dto.search.AttributeFilter.class,
                it.geosolutions.geostore.services.dto.search.BaseField.class,
                it.geosolutions.geostore.services.dto.search.CategoryFilter.class,
                it.geosolutions.geostore.services.dto.search.FieldFilter.class,
                it.geosolutions.geostore.services.dto.search.GroupFilter.class,
                it.geosolutions.geostore.services.dto.search.TagFilter.class,
                it.geosolutions.geostore.services.dto.search.NotFilter.class,
                it.geosolutions.geostore.services.dto.search.OrFilter.class,
                it.geosolutions.geostore.services.dto.search.SearchFilter.class,
                it.geosolutions.geostore.services.dto.search.SearchOperator.class);
    }

    private static List<Class<?>> getRESTclasses() {
        return Arrays.asList(
                it.geosolutions.geostore.services.rest.model.CategoryList.class,
                it.geosolutions.geostore.services.rest.model.UserGroupList.class,
                it.geosolutions.geostore.services.rest.model.RESTResource.class,
                it.geosolutions.geostore.services.rest.model.RESTCategory.class,
                it.geosolutions.geostore.services.rest.model.StoredDataList.class,
                it.geosolutions.geostore.services.rest.model.ShortAttributeList.class,
                it.geosolutions.geostore.services.rest.model.UserList.class,
                it.geosolutions.geostore.services.rest.model.ShortResourceList.class,
                it.geosolutions.geostore.services.rest.model.RESTStoredData.class,
                it.geosolutions.geostore.services.rest.model.RESTQuickBackup.class,
                it.geosolutions.geostore.services.rest.model.RESTQuickBackup.RESTBackupCategory
                        .class,
                it.geosolutions.geostore.services.rest.model.RESTQuickBackup.RESTBackupResource
                        .class);
    }

    public static JAXBContext getContext() {
        if (context == null)
            throw new IllegalStateException("Context has not been properly initialized");
        return context;
    }

    /**
     * Scans all classes accessible from the context class loader which belong to the given package
     * and subpackages.
     *
     * @param packageName The base package
     * @return The classes
     * @throws ClassNotFoundException
     * @throws IOException
     */
    @SuppressWarnings("unchecked")
    private static List<Class> getClasses(String packageName)
            throws ClassNotFoundException, IOException {

        if (LOGGER.isDebugEnabled()) LOGGER.debug("Loading classes from " + packageName);
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        assert classLoader != null;
        String path = packageName.replace('.', '/');
        Enumeration<URL> resources = classLoader.getResources(path);
        List<File> dirs = new ArrayList<File>();
        while (resources.hasMoreElements()) {
            URL resource = resources.nextElement();
            String fileName = resource.getFile();

            if (LOGGER.isDebugEnabled()) LOGGER.debug("   adding resource " + fileName);

            String fileNameDecoded = URLDecoder.decode(fileName, "UTF-8");
            dirs.add(new File(fileNameDecoded));
        }
        ArrayList<Class> classes = new ArrayList<Class>();
        for (File directory : dirs) {
            classes.addAll(findClasses(directory, packageName));
        }
        return classes;
    }

    /**
     * Recursive method used to find all classes in a given directory and subdirs.
     *
     * <p>This method is not useful if classes are inside a jar file.
     *
     * @param directory The base directory
     * @param packageName The package name for classes found inside the base directory
     * @return The classes
     * @throws ClassNotFoundException
     */
    @SuppressWarnings("unchecked")
    private static List<Class> findClasses(File directory, String packageName)
            throws ClassNotFoundException {
        List<Class> classes = new ArrayList<Class>();
        if (!directory.exists()) {
            LOGGER.debug("Directory not found :" + directory);
            return classes;
        }

        File[] files = directory.listFiles();
        for (File file : files) {
            String fileName = file.getName();
            if (file.isDirectory()) {
                assert !fileName.contains(".");
                classes.addAll(findClasses(file, packageName + "." + fileName));
            } else if (fileName.endsWith(".class") && !fileName.contains("$")) {
                Class _class;
                try {
                    _class =
                            Class.forName(
                                    packageName
                                            + '.'
                                            + fileName.substring(0, fileName.length() - 6));
                } catch (ExceptionInInitializerError e) {
                    // happen, for example, in classes, which depend on
                    // Spring to inject some beans, and which fail,
                    // if dependency is not fulfilled
                    _class =
                            Class.forName(
                                    packageName
                                            + '.'
                                            + fileName.substring(0, fileName.length() - 6),
                                    false,
                                    Thread.currentThread().getContextClassLoader());
                }
                classes.add(_class);
            }
        }
        return classes;
    }
}
