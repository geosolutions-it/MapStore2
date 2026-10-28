/*
 * ====================================================================
 *
 * Copyright (C) 2007 - 2016 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest;

import it.geosolutions.geostore.services.dto.search.SearchFilter;
import it.geosolutions.geostore.services.model.ExtGroupList;
import it.geosolutions.geostore.services.model.ExtResourceList;
import it.geosolutions.geostore.services.model.ExtShortResource;
import it.geosolutions.geostore.services.model.ExtUserList;
import it.geosolutions.geostore.services.rest.exception.BadRequestWebEx;
import it.geosolutions.geostore.services.rest.exception.ForbiddenErrorWebEx;
import it.geosolutions.geostore.services.rest.exception.InternalErrorWebEx;
import it.geosolutions.geostore.services.rest.exception.NotFoundWebEx;
import it.geosolutions.geostore.services.rest.model.Sort;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.BeanParam;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.SecurityContext;

import org.apache.cxf.jaxrs.ext.multipart.Multipart;
import org.springframework.security.access.annotation.Secured;

/**
 * Interface RESTExtJsService.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public interface RESTExtJsService {

    @GET
    @Path("/search/resource/{nameLike}")
    @Produces({MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN", "ROLE_USER", "ROLE_ANONYMOUS"})
    String getAllResources(
            @Context SecurityContext sc,
            @PathParam("nameLike") String nameLike,
            @QueryParam("start") Integer start,
            @QueryParam("limit") Integer limit)
            throws BadRequestWebEx;

    @GET
    @Path("/search/category/{categoryName}")
    @Produces({MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN", "ROLE_USER", "ROLE_ANONYMOUS"})
    String getResourcesByCategory(
            @Context SecurityContext sc,
            @PathParam("categoryName") String categoryName,
            @QueryParam("start") Integer start,
            @QueryParam("limit") Integer limit,
            @QueryParam("includeAttributes") @DefaultValue("false") boolean includeAttributes,
            @QueryParam("includeData") @DefaultValue("false") boolean includeData)
            throws BadRequestWebEx, InternalErrorWebEx;

    @GET
    @Path("/search/category/{categoryName}/{resourceNameLike}")
    @Produces({MediaType.APPLICATION_JSON, MediaType.TEXT_XML})
    @RolesAllowed({"ADMIN", "USER", "GUEST"})
    String getResourcesByCategory(
            @Context SecurityContext sc,
            @PathParam("categoryName") String categoryName,
            @PathParam("resourceNameLike") String resourceNameLike,
            @QueryParam("start") Integer start,
            @QueryParam("limit") Integer limit,
            @QueryParam("includeAttributes") @DefaultValue("false") boolean includeAttributes,
            @QueryParam("includeData") @DefaultValue("false") boolean includeData)
            throws BadRequestWebEx, InternalErrorWebEx;

    @GET
    @Path("/search/category/{categoryName}/{resourceNameLike}/{extraAttributes}")
    @Produces({MediaType.APPLICATION_JSON})
    @RolesAllowed({"ADMIN", "USER", "GUEST"})
    String getResourcesByCategory(
            @Context SecurityContext sc,
            @PathParam("categoryName") String categoryName,
            @PathParam("resourceNameLike") String resourceNameLike,
            @PathParam("extraAttributes") String extraAttributes,
            @QueryParam("start") Integer start,
            @QueryParam("limit") Integer limit,
            @QueryParam("includeAttributes") @DefaultValue("false") boolean includeAttributes,
            @QueryParam("includeData") @DefaultValue("false") boolean includeData)
            throws BadRequestWebEx, InternalErrorWebEx;

    /**
     * Retrieves a list of resources based on the specified request parameters.
     *
     * <p>The results can be sorted using the <code>sort</code> parameter, which includes the <code>
     * sortBy</code> attribute (name of the resource attribute to sort by) and <code>sortOrder
     * </code> ("asc" for ascending or "desc" for descending order). If not specified, the default
     * sorting is in ascending order by resource name.
     *
     * @param sc security context
     * @param start the n-th group shown as first in results
     * @param limit max entries per page
     * @param sort the sorting parameters for the results (includes <code>sortBy</code> and <code>
     *                          sortOrder</code>)
     * @param includeAttributes whether to include attributes in the returned results
     * @param includeData whether to include data in the returned results
     * @param includeTags whether to include tags in the returned results
     * @param favoritesOnly whether to return only user favorite resources
     * @param filter the multipart filter object to apply for resource filtering
     * @return
     * @throws BadRequestWebEx
     * @throws InternalErrorWebEx
     */
    @POST
    @GET
    @Path("/search/list")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Consumes({MediaType.APPLICATION_XML, MediaType.TEXT_XML})
    @Secured({"ROLE_ADMIN", "ROLE_USER", "ROLE_ANONYMOUS"})
    ExtResourceList getExtResourcesList(
            @Context SecurityContext sc,
            @QueryParam("start") Integer start,
            @QueryParam("limit") Integer limit,
            @BeanParam Sort sort,
            @QueryParam("includeAttributes") @DefaultValue("false") boolean includeAttributes,
            @QueryParam("includeData") @DefaultValue("false") boolean includeData,
            @QueryParam("includeTags") @DefaultValue("false") boolean includeTags,
            @QueryParam("favoritesOnly") @DefaultValue("false") boolean favoritesOnly,
            @Multipart("filter") SearchFilter filter)
            throws BadRequestWebEx, InternalErrorWebEx;

    @GET
    @Path("/search/users/{nameLike}")
    @Produces({MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN"})
    ExtUserList getUsersList(
            @Context SecurityContext sc,
            @PathParam("nameLike") String nameLike,
            @QueryParam("start") Integer start,
            @QueryParam("limit") Integer limit,
            @QueryParam("includeAttributes") @DefaultValue("false") boolean includeAttributes)
            throws BadRequestWebEx;

    /**
     * Search for groups by name and return paginated results.
     *
     * @param sc security context
     * @param nameLike pattern to match the name. Supports wildcard ('*').
     * @param start the n-th group shown as first in results.
     * @param limit max entries per page
     * @param all if <code>true</code> return also 'everyone' group
     * @return
     * @throws BadRequestWebEx
     */
    @GET
    @Path("/search/groups/{nameLike}")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    ExtGroupList getGroupsList(
            @Context SecurityContext sc,
            @PathParam("nameLike") String nameLike,
            @QueryParam("start") Integer start,
            @QueryParam("limit") Integer limit,
            @QueryParam("all") @DefaultValue("false") boolean all)
            throws BadRequestWebEx;

    /**
     * Retrieve the resource.
     *
     * @param sc security context
     * @param id the id of the resource to fetch
     * @param includeAttributes whether to include attributes in the returned resource
     * @param includePermissions whether to include permissions in the returned resource
     * @param includeTags whether to include tags in the returned resource
     * @return the resource
     * @throws ForbiddenErrorWebEx if the resource is protected
     * @throws NotFoundWebEx if the resource is not found
     */
    @GET
    @Path("/resource/{id}")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    ExtShortResource getExtResource(
            @Context SecurityContext sc,
            @PathParam("id") long id,
            @QueryParam("includeAttributes") @DefaultValue("false") boolean includeAttributes,
            @QueryParam("includePermissions") @DefaultValue("false") boolean includePermissions,
            @QueryParam("includeTags") @DefaultValue("false") boolean includeTags);
}
