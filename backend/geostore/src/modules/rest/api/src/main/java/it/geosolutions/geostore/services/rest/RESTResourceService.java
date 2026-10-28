/* ====================================================================
 *
 * Copyright (C) 2007 - 2012 GeoSolutions S.A.S.
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

import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.enums.DataType;
import it.geosolutions.geostore.services.dto.search.SearchFilter;
import it.geosolutions.geostore.services.exception.InternalErrorServiceEx;
import it.geosolutions.geostore.services.rest.exception.BadRequestWebEx;
import it.geosolutions.geostore.services.rest.exception.InternalErrorWebEx;
import it.geosolutions.geostore.services.rest.exception.NotFoundWebEx;
import it.geosolutions.geostore.services.rest.model.RESTAttribute;
import it.geosolutions.geostore.services.rest.model.RESTResource;
import it.geosolutions.geostore.services.rest.model.ResourceList;
import it.geosolutions.geostore.services.rest.model.SecurityRuleList;
import it.geosolutions.geostore.services.rest.model.ShortAttributeList;
import it.geosolutions.geostore.services.rest.model.ShortResourceList;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
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
 * Interface RESTResourceService.
 *
 * @author ETj (etj at geo-solutions.it)
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
// @RolesAllowed({ "ADMIN" })
@Secured({"ROLE_ADMIN"})
public interface RESTResourceService {

    /**
     * @param resource
     * @return long
     * @throws InternalErrorServiceEx
     */
    @POST
    @Path("/")
    @Consumes({MediaType.APPLICATION_XML, MediaType.TEXT_XML})
    // @Produces({MediaType.TEXT_PLAIN, MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Produces({MediaType.TEXT_PLAIN})
    // @RolesAllowed({ "ADMIN", "USER" })
    @Secured({"ROLE_USER", "ROLE_ADMIN"})
    long insert(@Context SecurityContext sc, @Multipart("resource") RESTResource resource)
            throws InternalErrorWebEx;

    /**
     * @param id
     * @param resource
     * @return long
     * @throws InternalErrorServiceEx
     * @throws NotFoundWebEx
     */
    @PUT
    @Path("/resource/{id}")
    @Consumes({MediaType.APPLICATION_XML, MediaType.TEXT_XML})
    @Produces({MediaType.TEXT_PLAIN})
    // @RolesAllowed({ "ADMIN", "USER" })
    @Secured({"ROLE_USER", "ROLE_ADMIN"})
    long update(
            @Context SecurityContext sc,
            @PathParam("id") long id,
            @Multipart("resource") RESTResource resource)
            throws NotFoundWebEx, BadRequestWebEx;

    /**
     * @param id
     * @throws NotFoundWebEx
     * @throws InternalErrorServiceEx
     */
    @DELETE
    @Path("/resource/{id}")
    // @RolesAllowed({ "ADMIN", "USER" })
    @Secured({"ROLE_USER", "ROLE_ADMIN"})
    void delete(@Context SecurityContext sc, @PathParam("id") long id) throws NotFoundWebEx;

    /**
     * @param filter
     * @return ShortResourceList
     */
    @DELETE
    @Path("/")
    // @RolesAllowed({ "ADMIN" })
    @Secured({"ROLE_ADMIN"})
    void deleteResources(@Context SecurityContext sc, @Multipart("filter") SearchFilter filter)
            throws BadRequestWebEx, InternalErrorWebEx;

    /**
     * @param id
     * @return Resource
     * @throws NotFoundWebEx
     */
    @GET
    @Path("/resource/{id}")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    // @RolesAllowed({ "ADMIN", "USER", "GUEST" })
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    Resource get(
            @Context SecurityContext sc,
            @PathParam("id") long id,
            @QueryParam("full") @DefaultValue("false") boolean full)
            throws NotFoundWebEx;

    /**
     * @param page
     * @param entries
     * @return ShortResourceList
     * @throws BadRequestWebEx
     */
    @GET
    @Path("/")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    // @RolesAllowed({ "ADMIN", "USER", "GUEST" })
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    ShortResourceList getAll(
            @Context SecurityContext sc,
            @QueryParam("page") Integer page,
            @QueryParam("entries") Integer entries)
            throws BadRequestWebEx;

    /**
     * @param nameLike
     * @param page
     * @param entries
     * @return ShortResourceList
     * @throws BadRequestWebEx
     */
    @GET
    @Path("/search/{nameLike}")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    // @RolesAllowed({ "ADMIN", "USER", "GUEST" })
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    ShortResourceList getList(
            @Context SecurityContext sc,
            @PathParam("nameLike") String nameLike,
            @QueryParam("page") Integer page,
            @QueryParam("entries") Integer entries)
            throws BadRequestWebEx;

    /**
     * @param filter
     * @return ShortResourceList
     */
    @POST
    @GET
    @Path("/search")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Consumes({MediaType.APPLICATION_XML, MediaType.TEXT_XML})
    // @RolesAllowed({ "ADMIN", "USER", "GUEST" })
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    @Deprecated
    ShortResourceList getResources(
            @Context SecurityContext sc, @Multipart("filter") SearchFilter filter)
            throws BadRequestWebEx, InternalErrorWebEx;

    /**
     * @param sc
     * @param filter
     * @param page
     * @param entries
     * @param includeAttributes
     * @param includeData
     * @return ResourceList
     * @throws BadRequestWebEx
     * @throws InternalErrorWebEx
     */
    @POST
    @GET
    @Path("/search/list")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Consumes({MediaType.APPLICATION_XML, MediaType.TEXT_XML})
    // @RolesAllowed({ "ADMIN", "USER", "GUEST" })
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    ResourceList getResourcesList(
            @Context SecurityContext sc,
            @QueryParam("page") Integer page,
            @QueryParam("entries") Integer entries,
            @QueryParam("includeAttributes") @DefaultValue("false") boolean includeAttributes,
            @QueryParam("includeData") @DefaultValue("false") boolean includeData,
            @Multipart("filter") SearchFilter filter)
            throws BadRequestWebEx, InternalErrorWebEx;

    /**
     * @param nameLike
     * @return long
     */
    @GET
    @Path("/count/{nameLike}")
    @Produces({MediaType.TEXT_PLAIN})
    // @RolesAllowed({ "ADMIN", "USER", "GUEST" })
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    long getCount(@Context SecurityContext sc, @PathParam("nameLike") String nameLike);

    /**
     * @param id
     * @return ShortAttributeList
     * @throws NotFoundWebEx
     */
    @GET
    @Path("/resource/{id}/attributes")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    // @RolesAllowed({ "ADMIN", "USER", "GUEST" })
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    ShortAttributeList getAttributes(@Context SecurityContext sc, @PathParam("id") long id)
            throws NotFoundWebEx;

    /**
     * @param id
     * @param name
     * @return String
     * @throws NotFoundWebEx
     */
    @GET
    @Path("/resource/{id}/attributes/{name}")
    @Produces({MediaType.TEXT_PLAIN})
    // @RolesAllowed({ "ADMIN", "USER", "GUEST" })
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    String getAttribute(
            @Context SecurityContext sc, @PathParam("id") long id, @PathParam("name") String name)
            throws NotFoundWebEx;

    /**
     * Updates the attribute using the PUT request body (JSON).
     *
     * @param id id of the resource
     * @param content the attribute object
     * @return long
     * @throws NotFoundWebEx
     * @throws InternalErrorWebEx
     */
    @PUT
    @Path("/resource/{id}/attributes/")
    @Produces({MediaType.TEXT_PLAIN})
    @Consumes(MediaType.APPLICATION_JSON)
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    long updateAttribute(
            @Context SecurityContext sc, @PathParam("id") long id, RESTAttribute content);

    /**
     * @param id
     * @param name
     * @param value
     * @return long
     * @throws NotFoundWebEx
     * @throws InternalErrorWebEx
     */
    @PUT
    @Path("/resource/{id}/attributes/{name}/{value}")
    @Produces({MediaType.TEXT_PLAIN})
    // @RolesAllowed({ "ADMIN", "USER" })
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    long updateAttribute(
            @Context SecurityContext sc,
            @PathParam("id") long id,
            @PathParam("name") String name,
            @PathParam("value") String value);

    /**
     * @param id
     * @param name
     * @param value
     * @param type
     * @return long
     * @throws NotFoundWebEx
     * @throws InternalErrorWebEx
     */
    @PUT
    @Path("/resource/{id}/attributes/{name}/{value}/{type}")
    @Produces({MediaType.TEXT_PLAIN})
    // @RolesAllowed({ "ADMIN", "USER" })
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    long updateAttribute(
            @Context SecurityContext sc,
            @PathParam("id") long id,
            @PathParam("name") String name,
            @PathParam("value") String value,
            @PathParam("type") DataType type);

    /**
     * @param sc
     * @param id
     * @param securityRules
     */
    @POST
    @Path("/resource/{id}/permissions")
    @Consumes({MediaType.APPLICATION_XML, MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Secured({"ROLE_USER", "ROLE_ADMIN"})
    void updateSecurityRules(
            @Context SecurityContext sc,
            @PathParam("id") long id,
            @Multipart("rules") SecurityRuleList securityRules);

    @GET
    @Path("/resource/{id}/permissions")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Secured({"ROLE_USER", "ROLE_ADMIN"})
    SecurityRuleList getSecurityRules(@Context SecurityContext sc, @PathParam("id") long id);
}
