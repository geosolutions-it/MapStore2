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

import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.rest.exception.NotFoundWebEx;
import it.geosolutions.geostore.services.rest.model.RESTQuickBackup;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.SecurityContext;

import org.apache.cxf.jaxrs.ext.multipart.Multipart;
import org.springframework.security.access.annotation.Secured;

/**
 * Backup/restore REST service
 *
 * @author ETj (etj at geo-solutions.it)
 */
// @RolesAllowed({ "ADMIN" })
@Secured({"ROLE_ADMIN"})
public interface RESTBackupService {

    /**
     * @param id
     * @return Resource
     * @throws NotFoundWebEx
     */
    @GET
    @Path("/full")
    @Produces({MediaType.TEXT_PLAIN})
    // @RolesAllowed({ "ADMIN" })
    @Secured({"ROLE_ADMIN"})
    String backup(@Context SecurityContext sc);

    @PUT
    @Path("/full/{token}")
    @Produces({MediaType.TEXT_PLAIN})
    // @RolesAllowed({ "ADMIN" })
    @Secured({"ROLE_ADMIN"})
    String restore(@Context SecurityContext sc, @PathParam("token") String token);

    /**
     * Quick backup is a backup that is built in memory. It can only be issued when the data base in
     * the store is not very big. Furthermore, most internal params are not backup/restored
     * (creation time, ...) Most important, <b>neither users or authentication info are
     * backupped</b>.
     */
    @GET
    @Path("/quick")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    // @RolesAllowed({ "ADMIN" })
    @Secured({"ROLE_ADMIN"})
    RESTQuickBackup quickBackup(@Context SecurityContext sc) throws BadRequestServiceEx;

    /**
     * Quick backup is a backup that is built in memory. It can only be issued when the data base in
     * the store is not very big. Furthermore, most internal params are not backup/restored
     * (creation time, ...) Most important, <b>neither users or authentication info are
     * backupped</b>.
     */
    @PUT
    @Path("/quick")
    @Produces({MediaType.TEXT_PLAIN})
    // @RolesAllowed({ "ADMIN" })
    @Secured({"ROLE_ADMIN"})
    String quickRestore(@Context SecurityContext sc, @Multipart("backup") RESTQuickBackup backup)
            throws BadRequestServiceEx;
}
