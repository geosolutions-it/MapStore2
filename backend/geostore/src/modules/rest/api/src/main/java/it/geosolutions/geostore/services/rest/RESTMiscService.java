/* ====================================================================
 *
 * Copyright (C) 2012 GeoSolutions S.A.S.
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
import it.geosolutions.geostore.services.rest.exception.BadRequestWebEx;
import it.geosolutions.geostore.services.rest.exception.ConflictWebEx;
import it.geosolutions.geostore.services.rest.exception.InternalErrorWebEx;
import it.geosolutions.geostore.services.rest.exception.NotFoundWebEx;
import it.geosolutions.geostore.services.rest.model.ResourceList;
import it.geosolutions.geostore.services.rest.model.ShortResourceList;

import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.SecurityContext;

import org.springframework.security.access.annotation.Secured;

/**
 * Interface RESTMiscService. Experimental operations go here.
 *
 * @author ETj (etj at geo-solutions.it)
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public interface RESTMiscService {

    @GET
    @Path("/category/name/{cname}/resource/name/{rname}/data")
    @Produces({MediaType.TEXT_PLAIN})
    // @RolesAllowed({ "ADMIN", "USER", "GUEST" })
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    String getData(
            @Context SecurityContext sc,
            @PathParam("cname") String cname,
            @PathParam("rname") String rname)
            throws NotFoundWebEx, ConflictWebEx, BadRequestWebEx, InternalErrorWebEx;

    @GET
    @Path("/category/name/{cname}/resource/name/{rname}")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    // @RolesAllowed({ "ADMIN", "USER", "GUEST" })
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    Resource getResource(
            @Context SecurityContext sc,
            @PathParam("cname") String cname,
            @PathParam("rname") String rname)
            throws NotFoundWebEx, ConflictWebEx, BadRequestWebEx, InternalErrorWebEx;

    @GET
    @Path("/category/name/{cname}/resources/")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    // @RolesAllowed({ "ADMIN", "USER", "GUEST" })
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    ShortResourceList getResourcesByCategory(
            @Context SecurityContext sc, @PathParam("cname") String cname)
            throws NotFoundWebEx, ConflictWebEx, BadRequestWebEx, InternalErrorWebEx;

    @GET
    @Path("/category/name/{cname}/fullresources/")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    // @RolesAllowed({ "ADMIN", "USER", "GUEST" })
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    ResourceList getResourcesByCategory(
            @Context SecurityContext sc,
            @PathParam("cname") String cname,
            @QueryParam("includeAttributes") @DefaultValue("false") boolean includeAttributes,
            @QueryParam("includeAttributes") @DefaultValue("false") boolean includeData)
            throws NotFoundWebEx, ConflictWebEx, BadRequestWebEx, InternalErrorWebEx;

    @GET
    @Path("/reload/{service}")
    @Secured({"ROLE_ADMIN"})
    void reload(@Context SecurityContext sc, @PathParam("service") String service)
            throws BadRequestWebEx;
}
