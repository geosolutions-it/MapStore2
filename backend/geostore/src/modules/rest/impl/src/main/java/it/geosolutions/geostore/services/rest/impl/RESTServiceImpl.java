/* ====================================================================
 *
 * Copyright (C) 2012 - 2025 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.impl;

import inet.ipaddr.AddressStringException;
import inet.ipaddr.IPAddress;
import inet.ipaddr.IPAddressString;

import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.GroupReservedNames;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.core.model.enums.UserReservedNames;
import it.geosolutions.geostore.services.ResourcePermissionService;
import it.geosolutions.geostore.services.ResourceService;
import it.geosolutions.geostore.services.UserService;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;
import it.geosolutions.geostore.services.rest.exception.InternalErrorWebEx;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.core.SecurityContext;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.security.Principal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

/**
 * Class RESTServiceImpl.
 *
 * <p>This is the superclass for each RESTServices implementation
 *
 * @author ETj (etj at geo-solutions.it)
 * @author DamianoG
 */
public abstract class RESTServiceImpl {

    private static final Logger LOGGER = LogManager.getLogger(RESTServiceImpl.class);

    @Autowired UserService userService;
    @Autowired ResourceService resourceService;
    @Autowired ResourcePermissionService resourcePermissionService;

    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    public void setResourceService(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    public void setResourcePermissionService(ResourcePermissionService resourcePermissionService) {
        this.resourcePermissionService = resourcePermissionService;
    }

    /**
     * @return User - The authenticated user that is accessing this service, or null if guest
     *     access.
     */
    protected User extractAuthUser(SecurityContext sc) throws InternalErrorWebEx {
        if (sc == null) throw new InternalErrorWebEx("Missing auth info");
        else {
            Principal principal = sc.getUserPrincipal();
            if (principal == null) {
                // If I'm here, I'm sure that the service is running is allowed for the
                // unauthenticated users
                // due to a service-based authorization step that uses annotations on services
                // declaration (see module geostore-rest-api).
                // So I'm going to create a Principal to be used during resources-based
                // authorization.
                principal = createGuestPrincipal();
            }
            if (!(principal instanceof Authentication)) {
                logMismatchedPrincipal();
                throw new InternalErrorWebEx(
                        "Mismatching auth principal (" + principal.getClass() + ")");
            }

            Authentication usrToken = (Authentication) principal;

            if (usrToken.getPrincipal() instanceof User) {
                User user = (User) usrToken.getPrincipal();
                user.setIpAddress(extractClientIpAddress());

                LOGGER.info(
                        "Accessing service with user '{}', role '{}', and IP '{}'",
                        user.getName(),
                        user.getRole(),
                        user.getIpAddress());

                return user;
            }
            logMismatchedPrincipal();
            throw new InternalErrorWebEx("Mismatching auth principal (not a GeoStore User)");
        }
    }

    private IPAddress extractClientIpAddress() {
        try {
            String ipString =
                    extractClientIpFromRequest(
                            ((ServletRequestAttributes)
                                            RequestContextHolder.currentRequestAttributes())
                                    .getRequest());

            if (ipString.startsWith("[")) {
                /* removing parenthesis in IPv6 addresses */
                ipString = ipString.replaceAll("^\\[|]$", "");
            }

            return new IPAddressString(ipString).toAddress();
        } catch (AddressStringException ex) {
            LOGGER.error("Cannot identify user's IP address", ex);
            throw new InternalErrorWebEx("Cannot identify user's IP address");
        }
    }

    private String extractClientIpFromRequest(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            return ip.split(",")[0];
        }
        ip = request.getHeader("X-Real-IP");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            return ip;
        }
        return request.getRemoteAddr();
    }

    private static void logMismatchedPrincipal() {
        if (LOGGER.isInfoEnabled()) {
            LOGGER.info("Mismatching auth principal");
        }
    }

    /**
     * This operation is responsible for check if a resource is accessible to a user to perform
     * WRITE operations (update/delete). This operation checks both user and user's group
     * permissions on the resource.
     *
     * @param user the user to check access for
     * @param resourceId the resource to check access on
     * @return <code>true</code> if the user has write access on the resource, <code>false</code>
     *     otherwise
     */
    public boolean resourceAccessWrite(User user, long resourceId) {
        Resource resource = resourceService.getResource(resourceId, false, true, false);
        return resourcePermissionService.canResourceBeWrittenByUser(resource, user);
    }

    /**
     * This operation is responsible for check if a resource is accessible to a user to perform READ
     * operations. This operation checks both user and user's group permissions on the resource.
     *
     * @param user the user to check access for
     * @param resourceId the resource to check access on
     * @return <code>true</code> if the user has read access on the resource, <code>false</code>
     *     otherwise
     */
    public boolean resourceAccessRead(User user, long resourceId) {
        Resource resource = resourceService.getResource(resourceId, false, true, false);
        return resourcePermissionService.canResourceBeReadByUser(resource, user);
    }

    /**
     * Creates a Guest principal with Username="guest" password="" and role ROLE_GUEST. The guest
     * principal should be used with unauthenticated users.
     *
     * @return the Principal instance
     */
    public Principal createGuestPrincipal() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_GUEST"));
        try {
            User u = userService.get(UserReservedNames.GUEST.userName());
            return new UsernamePasswordAuthenticationToken(u, "", authorities);
        } catch (NotFoundServiceEx e) {
            if (LOGGER.isDebugEnabled()) {
                LOGGER.debug("User GUEST is not configured, creating on-the-fly a default one");
            }
        }
        User guest = new User();
        guest.setName("guest");
        guest.setRole(Role.GUEST);
        HashSet<UserGroup> groups = new HashSet<>();
        UserGroup everyoneGroup = new UserGroup();
        everyoneGroup.setEnabled(true);
        everyoneGroup.setId(-1L);
        everyoneGroup.setGroupName(GroupReservedNames.EVERYONE.groupName());
        groups.add(everyoneGroup);
        guest.setGroups(groups);
        return new UsernamePasswordAuthenticationToken(guest, "", authorities);
    }

    public static String convertNameLikeToSqlSyntax(String nameLike) {
        if (nameLike == null) {
            return null;
        }
        return nameLike.replaceAll("[*]", "%");
    }
}
