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

import it.geosolutions.geostore.services.rest.exception.NotFoundWebEx;

import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.SecurityContext;

import org.springframework.security.access.annotation.Secured;

/**
 * REST service mapped under the <code>/users</code> path. For example, to assign a favorite to the
 * current logged user, use the endpoint: <code>POST /rest/users/user/favorite/{resourceId}</code>.
 *
 * <p><b>For compatibility reasons, the now deprecated endpoint to add favorites has been kept</b>:
 * <br>
 * <i>To assign a favorite to the user, use the endpoint: <code>
 * POST /rest/users/user/{userId}/favorite/{resourceId}</code></i>.
 */
public interface RESTFavoriteService {

    /**
     * @param id user identifier
     * @param resourceId resource identifier
     * @throws NotFoundWebEx
     * @deprecated use {@link #addFavorite(SecurityContext, long)} instead
     */
    @POST
    @Path("user/{id}/favorite/{resourceId}")
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    @Deprecated(forRemoval = true)
    default void addFavorite(
            @Context SecurityContext sc,
            @PathParam("id") long id,
            @PathParam("resourceId") long resourceId)
            throws NotFoundWebEx {
        addFavorite(sc, resourceId);
    }

    /**
     * @param resourceId resource identifier
     * @throws NotFoundWebEx
     */
    @POST
    @Path("user/favorite/{resourceId}")
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    void addFavorite(@Context SecurityContext sc, @PathParam("resourceId") long resourceId)
            throws NotFoundWebEx;

    /**
     * @param id user identifier
     * @param resourceId resource identifier
     * @throws NotFoundWebEx
     * @deprecated use {@link #removeFavorite(SecurityContext, long)} instead
     */
    @DELETE
    @Path("user/{id}/favorite/{resourceId}")
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    @Deprecated(forRemoval = true)
    default void removeFavorite(
            @Context SecurityContext sc,
            @PathParam("id") long id,
            @PathParam("resourceId") long resourceId)
            throws NotFoundWebEx {
        removeFavorite(sc, resourceId);
    }

    /**
     * @param resourceId resource identifier
     * @throws NotFoundWebEx
     */
    @DELETE
    @Path("user/favorite/{resourceId}")
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    void removeFavorite(@Context SecurityContext sc, @PathParam("resourceId") long resourceId)
            throws NotFoundWebEx;
}
