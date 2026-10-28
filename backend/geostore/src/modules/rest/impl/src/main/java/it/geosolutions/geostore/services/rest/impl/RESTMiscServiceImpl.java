/* ====================================================================
 *
 * Copyright (C) 2012 - 2025 GeoSolutions S.A.S.
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

import it.geosolutions.geostore.core.model.Category;
import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.services.CategoryService;
import it.geosolutions.geostore.services.ResourceService;
import it.geosolutions.geostore.services.StoredDataService;
import it.geosolutions.geostore.services.dto.ResourceSearchParameters;
import it.geosolutions.geostore.services.dto.ShortResource;
import it.geosolutions.geostore.services.dto.search.AndFilter;
import it.geosolutions.geostore.services.dto.search.BaseField;
import it.geosolutions.geostore.services.dto.search.CategoryFilter;
import it.geosolutions.geostore.services.dto.search.FieldFilter;
import it.geosolutions.geostore.services.dto.search.SearchFilter;
import it.geosolutions.geostore.services.dto.search.SearchOperator;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.InternalErrorServiceEx;
import it.geosolutions.geostore.services.rest.RESTMiscService;
import it.geosolutions.geostore.services.rest.exception.BadRequestWebEx;
import it.geosolutions.geostore.services.rest.exception.ConflictWebEx;
import it.geosolutions.geostore.services.rest.exception.InternalErrorWebEx;
import it.geosolutions.geostore.services.rest.exception.NotFoundWebEx;
import it.geosolutions.geostore.services.rest.model.ResourceList;
import it.geosolutions.geostore.services.rest.model.ShortResourceList;

import jakarta.ws.rs.core.SecurityContext;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

import java.util.List;

/**
 * Class RESTMiscServiceImpl.
 *
 * @author ETj (etj at geo-solutions.it)
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
@SuppressWarnings("PMD.UnusedPrivateField")
public class RESTMiscServiceImpl extends RESTServiceImpl
        implements RESTMiscService, ApplicationContextAware {

    private static final Logger LOGGER = LogManager.getLogger(RESTMiscServiceImpl.class);

    private CategoryService categoryService;

    private ResourceService resourceService;

    private StoredDataService storedDataService;

    private ApplicationContext appContext;

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.rest.RESTMiscService#getData(javax.ws.rs.core.SecurityContext, java.lang.String, java.lang.String)
     */
    @Override
    public String getData(SecurityContext sc, String catName, String resName)
            throws NotFoundWebEx, ConflictWebEx, BadRequestWebEx, InternalErrorWebEx {

        if (LOGGER.isDebugEnabled()) LOGGER.debug("getData(" + catName + "," + resName + ")");

        if (catName == null) throw new BadRequestWebEx("Category is null");
        if (resName == null) throw new BadRequestWebEx("Resource is null");

        SearchFilter filter =
                new AndFilter(
                        new CategoryFilter(catName, SearchOperator.EQUAL_TO),
                        new FieldFilter(BaseField.NAME, resName, SearchOperator.EQUAL_TO));

        List<Resource> resources = null;
        try {
            User user = extractAuthUser(sc);
            resources =
                    resourceService.getResourcesFull(
                            ResourceSearchParameters.builder()
                                    .filter(filter)
                                    .authUser(user)
                                    .build());
        } catch (BadRequestServiceEx ex) {
            throw new BadRequestWebEx(ex.getMessage());
        } catch (InternalErrorServiceEx ex) {
            throw new InternalErrorWebEx(ex.getMessage());
        }

        if (resources.isEmpty()) {
            throw new NotFoundWebEx("No resource found");
        } else if (resources.size() > 1) {
            throw new ConflictWebEx("Too many resources match the request");
        }

        return resources.get(0).getData().getData();
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.rest.RESTMiscService#getResource(javax.ws.rs.core.SecurityContext, java.lang.String, java.lang.String)
     */
    @Override
    public Resource getResource(SecurityContext sc, String catName, String resName)
            throws NotFoundWebEx, ConflictWebEx, BadRequestWebEx, InternalErrorWebEx {

        if (LOGGER.isDebugEnabled()) LOGGER.debug("getResource(" + catName + "," + resName + ")");

        if (catName == null) throw new BadRequestWebEx("Category is null");
        if (resName == null) throw new BadRequestWebEx("Resource is null");

        SearchFilter filter =
                new AndFilter(
                        new CategoryFilter(catName, SearchOperator.EQUAL_TO),
                        new FieldFilter(BaseField.NAME, resName, SearchOperator.EQUAL_TO));

        List<Resource> resources = null;
        try {
            User user = extractAuthUser(sc);
            resources =
                    resourceService.getResourcesFull(
                            ResourceSearchParameters.builder()
                                    .filter(filter)
                                    .authUser(user)
                                    .build());
        } catch (BadRequestServiceEx ex) {
            throw new BadRequestWebEx(ex.getMessage());
        } catch (InternalErrorServiceEx ex) {
            throw new InternalErrorWebEx(ex.getMessage());
        }

        if (resources.isEmpty()) {
            throw new NotFoundWebEx("No resource found");
        } else if (resources.size() > 1) {
            throw new ConflictWebEx("Too many resources match the request");
        }

        return resources.get(0);
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.rest.RESTMiscService#getResource(javax.ws.rs.core.SecurityContext, java.lang.String, java.lang.String)
     */
    @Override
    public ShortResourceList getResourcesByCategory(SecurityContext sc, String catName)
            throws NotFoundWebEx, ConflictWebEx, BadRequestWebEx, InternalErrorWebEx {

        if (LOGGER.isDebugEnabled()) LOGGER.debug("getResourcesByCategory(" + catName + ")");

        // some checks on category
        if (catName == null) throw new BadRequestWebEx("Category is null");

        Category category;
        try {
            category = categoryService.get(catName);
        } catch (BadRequestServiceEx ex) {
            throw new BadRequestWebEx(ex.getMessage());
        }
        if (category == null) throw new NotFoundWebEx("Category not found");

        // ok, search for the resource list
        SearchFilter filter = new CategoryFilter(catName, SearchOperator.EQUAL_TO);

        List<ShortResource> resources = null;
        try {
            User user = extractAuthUser(sc);

            resources =
                    resourceService.getShortResources(
                            ResourceSearchParameters.builder()
                                    .filter(filter)
                                    .authUser(user)
                                    .build());
        } catch (BadRequestServiceEx ex) {
            throw new BadRequestWebEx(ex.getMessage());
        } catch (InternalErrorServiceEx ex) {
            throw new InternalErrorWebEx(ex.getMessage());
        }

        return new ShortResourceList(resources);
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.rest.RESTMiscService#getResource(javax.ws.rs.core.SecurityContext, java.lang.String, java.lang.String)
     */
    @Override
    public ResourceList getResourcesByCategory(
            SecurityContext sc, String catName, boolean includeAttributes, boolean includeData)
            throws NotFoundWebEx, ConflictWebEx, BadRequestWebEx, InternalErrorWebEx {

        if (LOGGER.isDebugEnabled()) LOGGER.debug("getResourcesByCategory(" + catName + ")");

        // some checks on category
        if (catName == null) throw new BadRequestWebEx("Category is null");

        Category category;
        try {
            category = categoryService.get(catName);
        } catch (BadRequestServiceEx ex) {
            throw new BadRequestWebEx(ex.getMessage());
        }
        if (category == null) throw new NotFoundWebEx("Category not found");

        // ok, search for the resource list
        SearchFilter filter = new CategoryFilter(catName, SearchOperator.EQUAL_TO);

        List<Resource> resources = null;
        try {
            User user = extractAuthUser(sc);
            resources =
                    resourceService.getResources(
                            ResourceSearchParameters.builder()
                                    .filter(filter)
                                    .includeAttributes(includeAttributes)
                                    .includeData(includeData)
                                    .authUser(user)
                                    .build());
        } catch (BadRequestServiceEx ex) {
            throw new BadRequestWebEx(ex.getMessage());
        } catch (InternalErrorServiceEx ex) {
            throw new InternalErrorWebEx(ex.getMessage());
        }

        return new ResourceList(resources);
    }

    // =========================================================================

    public void setCategoryService(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    public void setResourceService(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    public void setStoredDataService(StoredDataService storedDataService) {
        this.storedDataService = storedDataService;
    }

    @Override
    public void reload(SecurityContext sc, String service) throws BadRequestWebEx {
        String reloadService = service;
        if (appContext != null) {
            if (!appContext.containsBean(reloadService)) {
                reloadService = reloadService + "Initializer";
            }
            if (!appContext.containsBean(reloadService)) {
                throw new BadRequestWebEx("No service named " + service + " to reload");
            }
            InitializingBean bean = appContext.getBean(reloadService, InitializingBean.class);
            if (bean != null) {
                try {
                    bean.afterPropertiesSet();
                } catch (Exception e) {
                    throw new BadRequestWebEx(e.getMessage());
                }
            }
        }
    }

    @Override
    public void setApplicationContext(ApplicationContext appContext) throws BeansException {
        this.appContext = appContext;
    }
}
