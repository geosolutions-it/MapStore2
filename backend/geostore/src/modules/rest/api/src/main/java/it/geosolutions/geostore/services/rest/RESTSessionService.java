/* ====================================================================
 *
 * Copyright (C) 2017 GeoSolutions S.A.S.
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

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.services.dto.UserSession;
import it.geosolutions.geostore.services.rest.model.SessionToken;

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

import org.springframework.security.access.annotation.Secured;

import java.text.ParseException;

public interface RESTSessionService {

    /**
     * Gets the User object associated to the given sessionId (if it exists).
     *
     * @param sessionId
     * @param refresh flag to automatically refresh the session (only if enabled)
     * @return
     */
    @GET
    @Path("/user/{sessionId}")
    @Produces({MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN", "ROLE_USER", "ROLE_ANONYMOUS"})
    User getUser(
            @PathParam("sessionId") String sessionId,
            @DefaultValue("true") @QueryParam("refresh") boolean refresh);

    /**
     * Gets the username associated to the given sessionId (if it exists).
     *
     * @param sessionId
     * @param refresh flag to automatically refresh the session (only if enabled)
     * @return
     */
    @GET
    @Path("/username/{sessionId}")
    @Produces({MediaType.TEXT_PLAIN})
    @Secured({"ROLE_ADMIN", "ROLE_USER", "ROLE_ANONYMOUS"})
    public String getUserName(
            @PathParam("sessionId") String sessionId,
            @DefaultValue("true") @QueryParam("refresh") boolean refresh);

    /**
     * Creates a new session for the User in SecurityContext.
     *
     * @return the session key
     * @throws ParseException
     */
    @PUT
    @Path("/")
    @Produces({MediaType.TEXT_PLAIN})
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    public UserSession createSession(
            @DefaultValue("") @QueryParam("expires") String expires, @Context SecurityContext sc)
            throws ParseException;

    /**
     * Creates a new session for the User in SecurityContext.
     *
     * @return The session token with expiring time (in seconds and refresh token.
     * @throws ParseException
     */
    @POST
    @Path("/login")
    @Produces({MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    public SessionToken login(@Context SecurityContext sc) throws ParseException;

    /**
     * Refresh the session token
     *
     * @param sessionId the current session token
     * @param refreshToken the token that allow you to refresh the session
     * @return the new session token with the new informations
     * @throws ParseException
     */
    @POST
    @Path("/refresh/{sessionId}/{refreshToken}")
    @Produces({MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    @Deprecated
    public SessionToken refresh(
            @Context SecurityContext sc,
            @PathParam("sessionId") String sessionId,
            @PathParam("refreshToken") String refreshToken)
            throws ParseException;

    /**
     * Removes the given session.
     *
     * @return
     */
    @DELETE
    @Path("/{sessionId}")
    @Secured({"ROLE_ADMIN", "ROLE_USER", "ROLE_ANONYMOUS"})
    @Deprecated
    public void removeSession(@PathParam("sessionId") String sessionId);

    @POST
    @Path("/refreshToken")
    @Produces({MediaType.APPLICATION_JSON})
    @Consumes({MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN", "ROLE_USER", "ROLE_ANONYMOUS"})
    public SessionToken refresh(SessionToken token) throws ParseException;

    /**
     * Removes the given session.
     *
     * @return
     */
    @DELETE
    @Path("/logout")
    @Secured({"ROLE_ADMIN", "ROLE_USER", "ROLE_ANONYMOUS"})
    public void removeSession();

    /**
     * Removes all sessions.
     *
     * @return
     */
    @DELETE
    @Path("/")
    @Secured({"ROLE_ADMIN"})
    public void clear();

    void registerDelegate(String key, SessionServiceDelegate delegate);
}
