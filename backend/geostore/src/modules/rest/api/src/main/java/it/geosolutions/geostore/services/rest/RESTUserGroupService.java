/*
 *  Copyright (C) 2007-2012 GeoSolutions S.A.S.
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

import it.geosolutions.geostore.services.rest.exception.BadRequestWebEx;
import it.geosolutions.geostore.services.rest.exception.NotFoundWebEx;
import it.geosolutions.geostore.services.rest.model.RESTUserGroup;
import it.geosolutions.geostore.services.rest.model.ShortResourceList;
import it.geosolutions.geostore.services.rest.model.UserGroupList;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.SecurityContext;

import org.apache.cxf.jaxrs.ext.multipart.Multipart;
import org.springframework.security.access.annotation.Secured;

import java.util.List;

/**
 * @author DamianoG
 */
public interface RESTUserGroupService {

    @POST
    @Path("/")
    @Consumes({MediaType.APPLICATION_XML, MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Produces({MediaType.TEXT_PLAIN})
    @Secured({"ROLE_ADMIN"})
    long insert(@Context SecurityContext sc, @Multipart("userGroup") RESTUserGroup userGroup)
            throws BadRequestWebEx;

    @DELETE
    @Path("/group/{id}")
    @Secured({"ROLE_ADMIN"})
    void delete(@Context SecurityContext sc, @PathParam("id") long id) throws NotFoundWebEx;

    @GET
    @Path("/group/{id}")
    @Secured({"ROLE_ADMIN"})
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    RESTUserGroup get(
            @Context SecurityContext sc,
            @PathParam("id") long id,
            @QueryParam("includeattributes") @DefaultValue("true") boolean includeAttributes)
            throws NotFoundWebEx;

    @GET
    @Path("/group/name/{name}")
    @Secured({"ROLE_ADMIN"})
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    RESTUserGroup get(
            @Context SecurityContext sc,
            @PathParam("name") String name,
            @QueryParam("includeattributes") @DefaultValue("true") boolean includeAttributes)
            throws NotFoundWebEx;

    @POST
    @Path("/group/{userid}/{groupid}")
    @Secured({"ROLE_ADMIN"})
    void assignUserGroup(
            @Context SecurityContext sc,
            @PathParam("userid") long userId,
            @PathParam("groupid") long groupId)
            throws NotFoundWebEx;

    @DELETE
    @Path("/group/{userid}/{groupid}")
    @Secured({"ROLE_ADMIN"})
    void deassignUserGroup(
            @Context SecurityContext sc,
            @PathParam("userid") long userId,
            @PathParam("groupid") long groupId)
            throws NotFoundWebEx;

    /**
     * Returns groups that match searching criteria with pagination.
     *
     * @param sc the security context
     * @param page the requested page number
     * @param entries max entries for page
     * @param nameLike a sub-string to search in group name with ILIKE operator
     * @param all if <code>true</code> adds to result the 'everyone' group if it matches the
     *     searching criteria
     * @param includeUsers if to include group users in the results
     * @return a list of groups that match searching criteria with pagination.
     * @throws BadRequestWebEx Exception
     */
    @GET
    @Path("/")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN"})
    UserGroupList getAll(
            @Context SecurityContext sc,
            @QueryParam("page") Integer page,
            @QueryParam("entries") Integer entries,
            @QueryParam("all") @DefaultValue("false") boolean all,
            @QueryParam("users") @DefaultValue("true") boolean includeUsers,
            @QueryParam("nameLike") String nameLike)
            throws BadRequestWebEx;

    @PUT
    @Path("/update_security_rules/{groupId}/{canRead}/{canWrite}")
    @Consumes({MediaType.APPLICATION_XML, MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN"})
    ShortResourceList updateSecurityRules(
            @Context SecurityContext sc,
            @Multipart("resourcelist") ShortResourceList resourcesToSet,
            @PathParam("groupId") Long groupId,
            @PathParam("canRead") Boolean canRead,
            @PathParam("canWrite") Boolean canWrite)
            throws BadRequestWebEx, NotFoundWebEx;

    @PUT
    @Path("/group/{id}")
    @Consumes({MediaType.APPLICATION_XML, MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Produces({MediaType.TEXT_PLAIN})
    @Secured({"ROLE_ADMIN"})
    long update(
            @Context SecurityContext sc,
            @PathParam("id") long id,
            @Multipart("userGroup") RESTUserGroup userGroup)
            throws NotFoundWebEx;

    @GET
    @Path("/search/attribute/{name}/{value}")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    UserGroupList getByAttribute(
            @Context SecurityContext sc,
            @PathParam("name") String name,
            @PathParam("value") String value,
            @QueryParam("ignoreCase") @DefaultValue("false") boolean ignoreCase);

    @GET
    @Path("/search/attribute/{name}")
    @Produces({MediaType.TEXT_XML, MediaType.APPLICATION_JSON})
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    UserGroupList getByAttribute(
            @Context SecurityContext sc,
            @PathParam("name") String name,
            @QueryParam("values") List<String> values,
            @QueryParam("ignoreCase") @DefaultValue("false") boolean ignoreCase);
}
