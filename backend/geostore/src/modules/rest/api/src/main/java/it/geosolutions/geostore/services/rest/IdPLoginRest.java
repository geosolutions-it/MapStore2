/* ====================================================================
 *
 * Copyright (C) 2022 GeoSolutions S.A.S.
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
import it.geosolutions.geostore.services.rest.model.SessionToken;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.springframework.security.access.annotation.Secured;

/** Base interface providing entry points to login using on an external Identity provider. */
public interface IdPLoginRest {

    @GET
    @Path("/{provider}/login")
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    void login(@PathParam("provider") String provider) throws NotFoundWebEx;

    @GET
    @Path("/{provider}/callback")
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    Response callback(@PathParam("provider") String provider) throws NotFoundWebEx;

    @GET
    @Path("/{provider}/tokens")
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    SessionToken getTokensByTokenIdentifier(
            @PathParam("provider") String provider,
            @QueryParam("identifier") String tokenIdentifier)
            throws NotFoundWebEx;

    @GET
    @Path("/providers")
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({"ROLE_USER", "ROLE_ADMIN", "ROLE_ANONYMOUS"})
    Response listProviders();

    /**
     * Registers an IdP loginService with a key equal to the provider name value.
     *
     * @param providerName the provider name to which is associated the {@link IdPLoginService}
     *     instance.
     * @param service the {@link IdPLoginService} instance to resgister and associate to the
     *     provider name value.
     */
    void registerService(String providerName, IdPLoginService service);
}
