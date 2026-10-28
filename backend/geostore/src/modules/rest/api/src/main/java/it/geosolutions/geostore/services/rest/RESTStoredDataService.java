/*
 *  Copyright (C) 2007 - 2016 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest;

import it.geosolutions.geostore.core.model.StoredData;
import it.geosolutions.geostore.services.rest.exception.NotFoundWebEx;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import org.apache.cxf.jaxrs.ext.multipart.Multipart;
import org.springframework.security.access.annotation.Secured;

/**
 * Interface RESTStoredDataService.Operations on {@link StoredData StoredData}s.
 *
 * @author Emanuele Tajariol (etj at geo-solutions.it)
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public interface RESTStoredDataService {

    /**
     * @param id
     * @param data
     * @return long
     * @throws NotFoundWebEx
     */
    @PUT
    @Path("/{id}")
    @Consumes({
        MediaType.APPLICATION_XML,
        MediaType.TEXT_XML,
        MediaType.TEXT_PLAIN,
        MediaType.APPLICATION_JSON
    })
    @Produces({MediaType.TEXT_PLAIN})
    // @RolesAllowed({ "ADMIN", "USER" })
    @Secured({"ROLE_USER", "ROLE_ADMIN"})
    long update(
            @Context SecurityContext sc, @PathParam("id") long id, @Multipart("data") String data)
            throws NotFoundWebEx;

    /**
     * @return StoredDataList
     */
    // @GET
    // @Path("/")
    // @Produces({MediaType.TEXT_PLAIN, MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    // @RolesAllowed({"ADMIN", "USER", "GUEST"})
    // StoredDataList getAll(@Context SecurityContext sc);

    /**
     * @param id
     * @throws NotFoundWebEx
     */
    @DELETE
    @Path("/{id}")
    // @RolesAllowed({ "ADMIN", "USER" })
    @Secured({"ROLE_USER", "ROLE_ADMIN"})
    void delete(@Context SecurityContext sc, @PathParam("id") long id) throws NotFoundWebEx;

    /**
     * @param id
     * @return String
     * @throws NotFoundWebEx
     */
    @GET
    @Path("/{id}")
    @Produces({MediaType.TEXT_PLAIN})
    // @RolesAllowed({ "ADMIN", "USER", "GUEST" })
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    String get(@Context SecurityContext sc, @Context HttpHeaders headers, @PathParam("id") long id)
            throws NotFoundWebEx;

    /**
     * Returns the stored data of a resource, unchanged or decoded.
     *
     * <p>The caller needs read permission on the resource, except for the categories configured as
     * public, {@code THUMBNAIL} as shipped ({@code publicRawCategories} in {@code
     * geostore.properties}). With {@code decode=datauri} only image media types are decoded; any
     * other data URI gets a 400. Every response carries {@code Content-Security-Policy: sandbox}
     * and {@code X-Content-Type-Options: nosniff}.
     *
     * @param id the resource id
     * @param decodeFormat {@code base64}, {@code datauri}, or none to return the data as stored
     */
    @GET
    @Path("/{id}/raw")
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    Response getRaw(
            @Context SecurityContext sc,
            @Context HttpHeaders headers,
            @PathParam("id") long id,
            @QueryParam("decode") String decodeFormat)
            throws NotFoundWebEx;
}
