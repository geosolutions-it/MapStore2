/* ====================================================================
 *
 * Copyright (C) 2007 - 2025 GeoSolutions S.A.S.
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

import it.geosolutions.geostore.core.model.IPRange;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.rest.exception.BadRequestWebEx;
import it.geosolutions.geostore.services.rest.exception.NotFoundWebEx;
import it.geosolutions.geostore.services.rest.model.IPRangeList;
import it.geosolutions.geostore.services.rest.model.RESTIPRange;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.SecurityContext;

import org.apache.cxf.jaxrs.ext.multipart.Multipart;
import org.springframework.security.access.annotation.Secured;

/** REST service for the {@link IPRange} model object. */
public interface RESTIPRangeService {

    /**
     * @param sc the security context
     * @param ipRange the IP range to insert
     * @return the identifier of the inserted IP range
     * @throws BadRequestServiceEx if the insert request is malformed
     */
    @POST
    @Consumes({MediaType.APPLICATION_XML, MediaType.TEXT_XML})
    @Produces({MediaType.TEXT_PLAIN})
    @Secured({"ROLE_ADMIN"})
    long insert(@Context SecurityContext sc, @Multipart("ipRange") RESTIPRange ipRange)
            throws BadRequestServiceEx;

    /**
     * @param sc the security context
     * @return a list of all IP ranges
     * @throws BadRequestWebEx if the getAll request is malformed
     */
    @GET
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    IPRangeList getAll(@Context SecurityContext sc) throws BadRequestWebEx;

    /**
     * @param id the identifier of the IP range to retrieve
     * @return IPRange
     * @throws NotFoundWebEx if the IP range is not found
     */
    @GET
    @Path("{id}")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    RESTIPRange get(@Context SecurityContext sc, @PathParam("id") long id) throws NotFoundWebEx;

    /**
     * @param id the identifier of the IP range to update
     * @param ipRange the IP range to fetch the update from
     * @return long the identifier of the updated IP range
     * @throws NotFoundWebEx if the IP range is not found
     * @throws BadRequestWebEx if the update request is malformed
     */
    @PUT
    @Path("{id}")
    @Consumes({MediaType.APPLICATION_XML, MediaType.TEXT_XML})
    @Produces({MediaType.TEXT_PLAIN})
    @Secured({"ROLE_ADMIN"})
    long update(
            @Context SecurityContext sc,
            @PathParam("id") long id,
            @Multipart("ipRange") RESTIPRange ipRange)
            throws NotFoundWebEx, BadRequestWebEx;

    /**
     * @param id the identifier of the IP range to delete
     * @throws NotFoundWebEx if the IP range is not found
     */
    @DELETE
    @Path("{id}")
    @Secured({"ROLE_ADMIN"})
    void delete(@Context SecurityContext sc, @PathParam("id") long id)
            throws NotFoundWebEx, BadRequestWebEx;
}
