/* ====================================================================
 *
 * Copyright (C) 2025 GeoSolutions S.A.S.
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

import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import org.springframework.security.access.annotation.Secured;

/** Admin-only diagnostics REST service for runtime observability. */
@Secured({"ROLE_ADMIN"})
public interface RESTDiagnosticsService {

    @GET
    @Path("/")
    @Produces({MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN"})
    Response getFullReport(@Context SecurityContext sc);

    @GET
    @Path("/logging")
    @Produces({MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN"})
    Response getLogging(@Context SecurityContext sc);

    @PUT
    @Path("/logging/{loggerName}/{level}")
    @Produces({MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN"})
    Response setLogLevel(
            @Context SecurityContext sc,
            @PathParam("loggerName") String loggerName,
            @PathParam("level") String level);

    @GET
    @Path("/cache")
    @Produces({MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN"})
    Response getCache(@Context SecurityContext sc);

    @GET
    @Path("/configuration")
    @Produces({MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN"})
    Response getConfiguration(@Context SecurityContext sc);
}
