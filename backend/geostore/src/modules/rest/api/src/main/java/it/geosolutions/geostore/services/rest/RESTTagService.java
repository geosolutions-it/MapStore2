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

import it.geosolutions.geostore.core.model.Tag;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.rest.exception.BadRequestWebEx;
import it.geosolutions.geostore.services.rest.exception.NotFoundWebEx;
import it.geosolutions.geostore.services.rest.model.TagList;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
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
 * REST service mapped under the <code>/resources</code> path. For example, to call the "get all"
 * operation, use the endpoint: <code>GET /rest/resources/tag</code>.
 */
@Path("tag")
public interface RESTTagService {

    /**
     * @param tag
     * @return long
     * @throws BadRequestServiceEx
     */
    @POST
    @Consumes({MediaType.APPLICATION_XML, MediaType.TEXT_XML})
    @Produces({MediaType.TEXT_PLAIN})
    @Secured({"ROLE_ADMIN"})
    long insert(@Context SecurityContext sc, @Multipart("tag") Tag tag) throws BadRequestServiceEx;

    /**
     * @param sc the security context
     * @param page the requested page number
     * @param entries max entries for page
     * @param nameLike a sub-string to search in tag name with ILIKE operator
     * @return Tag
     * @throws BadRequestWebEx
     */
    @GET
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN", "ROLE_USER", "ROLE_ANONYMOUS"})
    TagList getAll(
            @Context SecurityContext sc,
            @QueryParam("page") Integer page,
            @QueryParam("entries") Integer entries,
            @QueryParam("nameLike") String nameLike)
            throws BadRequestWebEx;

    /**
     * @param id
     * @return Tag
     * @throws NotFoundWebEx
     */
    @GET
    @Path("{id}")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    Tag get(@Context SecurityContext sc, @PathParam("id") long id) throws NotFoundWebEx;

    /**
     * @param id
     * @param tag
     * @return long
     * @throws NotFoundWebEx
     * @throws BadRequestWebEx
     */
    @PUT
    @Path("{id}")
    @Consumes({MediaType.APPLICATION_XML, MediaType.TEXT_XML})
    @Produces({MediaType.TEXT_PLAIN})
    @Secured({"ROLE_ADMIN"})
    long update(@Context SecurityContext sc, @PathParam("id") long id, @Multipart("tag") Tag tag)
            throws NotFoundWebEx, BadRequestWebEx;

    /**
     * @param id
     * @throws NotFoundWebEx
     */
    @DELETE
    @Path("{id}")
    @Secured({"ROLE_ADMIN"})
    void delete(@Context SecurityContext sc, @PathParam("id") long id) throws NotFoundWebEx;

    /**
     * @param id tag identifier
     * @param resourceId resource identifier
     * @throws NotFoundWebEx
     */
    @POST
    @Path("/{id}/resource/{resourceId}")
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    void addToResource(
            @Context SecurityContext sc,
            @PathParam("id") long id,
            @PathParam("resourceId") long resourceId)
            throws NotFoundWebEx;

    /**
     * @param id tag identifier
     * @param resourceId resource identifier
     * @throws NotFoundWebEx
     */
    @DELETE
    @Path("/{id}/resource/{resourceId}")
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    void removeFromResource(
            @Context SecurityContext sc,
            @PathParam("id") long id,
            @PathParam("resourceId") long resourceId)
            throws NotFoundWebEx;
}
