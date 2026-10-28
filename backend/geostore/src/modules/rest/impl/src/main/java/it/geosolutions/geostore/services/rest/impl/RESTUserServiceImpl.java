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
package it.geosolutions.geostore.services.rest.impl;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserAttribute;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.GroupReservedNames;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.core.security.password.PwEncoder;
import it.geosolutions.geostore.services.UserService;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;
import it.geosolutions.geostore.services.rest.RESTUserService;
import it.geosolutions.geostore.services.rest.exception.BadRequestWebEx;
import it.geosolutions.geostore.services.rest.exception.ForbiddenErrorWebEx;
import it.geosolutions.geostore.services.rest.exception.NotFoundWebEx;
import it.geosolutions.geostore.services.rest.model.RESTUser;
import it.geosolutions.geostore.services.rest.model.UserList;

import jakarta.ws.rs.core.SecurityContext;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

/**
 * Class RESTUserServiceImpl.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 * @author Emanuele Tajariol (etj at geo-solutions.it)
 */
public class RESTUserServiceImpl extends RESTServiceImpl implements RESTUserService {

    private static final Logger LOGGER = LogManager.getLogger(RESTUserServiceImpl.class);

    private static final String UUID_ATTRIBUTE = "UUID";

    private UserService userService;

    /**
     * @param userService the userService to set
     */
    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    /*
     * (non-Javadoc) @see it.geosolutions.geostore.services.rest.RESTUserInterface#insert(it.geosolutions.geostore.core.model.User)
     */
    @Override
    public long insert(SecurityContext sc, User user) {
        if (user == null) {
            throw new BadRequestWebEx("User is null");
        }
        if (user.getId() != null) {
            throw new BadRequestWebEx("Id should be null");
        }
        rejectFormerDefaultPassword(user.getName(), user.getNewPassword());

        long id = -1;
        try {
            //
            // Parsing UserAttributes list
            //
            List<UserAttribute> usAttribute = user.getAttribute();
            // persist the user first
            if (usAttribute != null) {
                user.setAttribute(null);
            }
            id = userService.insert(user);
            // insert attributes after user creation
            if (usAttribute != null) {
                userService.updateAttributes(id, usAttribute);
            }

        } catch (NotFoundServiceEx e) {
            throw new NotFoundWebEx(e.getMessage());
        } catch (BadRequestServiceEx e) {
            throw new BadRequestWebEx(e.getMessage());
        }

        return id;
    }

    /*
     * (non-Javadoc) @see it.geosolutions.geostore.services.rest.RESTUserInterface#update(long, it.geosolutions.geostore.core.model.User)
     */
    @Override
    public long update(SecurityContext sc, long id, User user) {
        if (user == null) {
            throw new BadRequestWebEx("User is null");
        }

        try {
            User authUser = extractAuthUser(sc);

            User old = userService.get(id);
            if (old == null) {
                throw new NotFoundWebEx("User not found");
            }

            boolean isAdmin = authUser != null && Role.ADMIN.equals(authUser.getRole());
            boolean isSelf = authUser != null && old.getName().equals(authUser.getName());
            if (!isAdmin && !isSelf) {
                throw new ForbiddenErrorWebEx("Only administrators can update another user");
            }

            List<UserAttribute> attributeDto = user.getAttribute();
            if (!isAdmin && attributeDto != null && !attributeDto.isEmpty()) {
                throw new ForbiddenErrorWebEx("Only administrators can update user attributes");
            }
            rejectFormerDefaultPassword(old.getName(), user.getNewPassword());

            boolean userUpdated = false;
            if (isAdmin) {
                String npw = user.getNewPassword();
                if (npw != null && !npw.isEmpty()) {
                    old.setNewPassword(user.getNewPassword());
                    userUpdated = true;
                } else {
                    old.setNewPassword(null);
                }

                Role nr = user.getRole();
                if (nr != null) {
                    old.setRole(nr);
                    userUpdated = true;
                }
                if (old.isEnabled() != user.isEnabled()) {
                    old.setEnabled(user.isEnabled());
                    userUpdated = true;
                }
                Set<UserGroup> groups = user.getGroups();
                if (groups != null) {
                    old.setGroups(groups);
                    userUpdated = true;
                }
            } else if (isSelf) { // Check if the User is the same
                String npw = user.getNewPassword();
                if (npw != null && !npw.isEmpty()) {
                    old.setNewPassword(user.getNewPassword());
                    userUpdated = true;
                } else {
                    old.setNewPassword(null);
                }
            }
            //
            // Creating a new User Attribute list (updated).
            //
            if (isAdmin && attributeDto != null) {
                List<UserAttribute> attributes = attributesToStore(old, attributeDto);
                if (!attributes.isEmpty()) {
                    userService.updateAttributes(id, attributes);
                }
            }
            if (userUpdated) {
                // attributes where updated before
                old.setAttribute(null);
                id = userService.update(old);
                return id;
            } else {
                return -1;
            }

        } catch (NotFoundServiceEx e) {
            throw new NotFoundWebEx(e.getMessage());
        } catch (BadRequestServiceEx e) {
            throw new BadRequestWebEx(e.getMessage());
        }
    }

    /**
     * Returns the attributes to store for an administrator's update, or an empty list when the
     * request leaves them unchanged. The {@code UUID} attribute is managed by the server: a value
     * in the request is ignored, and the stored one is carried over because {@link
     * UserService#updateAttributes} replaces the whole list.
     */
    private static List<UserAttribute> attributesToStore(
            User stored, List<UserAttribute> requested) {
        List<UserAttribute> attributes = new ArrayList<>();
        for (UserAttribute requestedAttribute : requested) {
            if (requestedAttribute != null
                    && !UUID_ATTRIBUTE.equals(requestedAttribute.getName())) {
                attributes.add(copyOf(requestedAttribute));
            }
        }
        if (!attributes.isEmpty() && stored.getAttribute() != null) {
            for (UserAttribute storedAttribute : stored.getAttribute()) {
                if (UUID_ATTRIBUTE.equals(storedAttribute.getName())) {
                    attributes.add(copyOf(storedAttribute));
                }
            }
        }
        return attributes;
    }

    private static UserAttribute copyOf(UserAttribute source) {
        UserAttribute copy = new UserAttribute();
        copy.setName(source.getName());
        copy.setValue(source.getValue());
        return copy;
    }

    /**
     * The former sample pairs {@code admin}/{@code admin} and {@code user}/{@code user} are
     * publicly known. Accounts that still use them cannot log in, and a new password must not bring
     * them back, variants included: reject them here with a 400.
     */
    private static void rejectFormerDefaultPassword(String name, String newPassword) {
        String trimmedName = name == null ? null : name.trim();
        if (PwEncoder.isLegacySamplePassword(trimmedName, newPassword)) {
            throw new BadRequestWebEx(
                    "The former default password cannot be used for user '" + trimmedName + "'");
        }
    }

    /*
     * (non-Javadoc) @see it.geosolutions.geostore.services.rest.RESTUserInterface#delete(long)
     */
    @Override
    public void delete(SecurityContext sc, long id, String cascadeResourceDelete)
            throws NotFoundWebEx {
        boolean ret = userService.delete(id, cascadeResourceDelete);
        if (!ret) {
            throw new NotFoundWebEx("User not found");
        }
    }

    /*
     * (non-Javadoc) @see it.geosolutions.geostore.services.rest.RESTUserInterface#get(long)
     */
    @Override
    public User get(SecurityContext sc, long id, boolean includeAttributes) throws NotFoundWebEx {
        if (id == -1) {
            if (LOGGER.isDebugEnabled()) {
                LOGGER.debug("Retriving dummy data !");
            }

            //
            // return test instance
            //
            User user = new User();
            user.setName("dummy name");
            return user;
        }

        User authUser = userService.get(id);
        if (authUser == null) {
            throw new NotFoundWebEx("User not found");
        }

        User ret = new User();
        ret.setId(authUser.getId());
        ret.setName(authUser.getName());
        // ret.setPassword(authUser.getPassword()); // NO! password should not be sent out of the
        // server!
        ret.setRole(authUser.getRole());
        ret.setEnabled(authUser.isEnabled());
        ret.setGroups(removeReservedGroups(authUser.getGroups()));
        if (includeAttributes) {
            ret.setAttribute(authUser.getAttribute());
        }
        return ret;
    }

    /*
     * (non-Javadoc) @see it.geosolutions.geostore.services.rest.RESTUserService#get(java.lang.String)
     */
    @Override
    public User get(SecurityContext sc, String name, boolean includeAttributes)
            throws NotFoundWebEx {
        if (name == null) {
            if (LOGGER.isDebugEnabled()) {
                LOGGER.debug("User Name is null !");
            }
            throw new BadRequestWebEx("User name is null");
        }

        User ret;
        try {
            ret = userService.get(name);
            if (includeAttributes) {
                ret.setAttribute(ret.getAttribute());
            } else {
                ret.setAttribute(null);
            }
            ret.setGroups(removeReservedGroups(ret.getGroups()));
        } catch (NotFoundServiceEx e) {
            throw new NotFoundWebEx("User not found");
        }

        return ret;
    }

    /*
     * (non-Javadoc) @see it.geosolutions.geostore.services.rest.RESTUserInterface#getAll(java.lang.Integer, java.lang.Integer)
     */
    @Override
    public UserList getAll(SecurityContext sc, Integer page, Integer entries)
            throws BadRequestWebEx {
        try {
            List<User> userList = userService.getAll(page, entries);
            Iterator<User> iterator = userList.iterator();

            List<RESTUser> restUSERList = new ArrayList<RESTUser>();
            while (iterator.hasNext()) {
                User user = iterator.next();

                RESTUser restUser =
                        new RESTUser(
                                user.getId(),
                                user.getName(),
                                user.getRole(),
                                user.getGroups(),
                                false);
                restUSERList.add(restUser);
            }

            return new UserList(restUSERList);
        } catch (BadRequestServiceEx ex) {
            throw new BadRequestWebEx(ex.getMessage());
        }
    }

    /*
     * (non-Javadoc) @see it.geosolutions.geostore.services.rest.RESTUserInterface#getCount(java.lang.String)
     */
    @Override
    public long getCount(SecurityContext sc, String nameLike) {
        return userService.getCount(convertNameLikeToSqlSyntax(nameLike));
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.rest.RESTUserService#getAuthUserDetails (javax.ws.rs.core.SecurityContext)
     */
    @Override
    public User getAuthUserDetails(SecurityContext sc, boolean includeAttributes) {
        User authUser = extractAuthUser(sc);

        User ret = null;
        try {
            if (!authUser.isTrusted()) {
                authUser = userService.get(authUser.getName());
            }

            if (authUser != null) {
                if (authUser.getRole().equals(Role.GUEST)) {
                    throw new NotFoundWebEx("User not found");
                }
                ret = new User();
                ret.setId(authUser.getId());
                ret.setName(authUser.getName());
                // ret.setPassword(authUser.getPassword()); // NO! password should not be sent out
                // of the server!
                ret.setRole(authUser.getRole());
                ret.setGroups(authUser.getGroups());
                if (includeAttributes) {
                    ret.setAttribute(authUser.getAttribute());
                }
            }

        } catch (NotFoundServiceEx e) {
            throw new NotFoundWebEx("User not found");
        }

        return ret;
    }

    @Override
    public UserList getUserList(
            SecurityContext sc,
            String nameLike,
            Integer page,
            Integer entries,
            boolean includeAttributes)
            throws BadRequestWebEx {
        try {
            List<User> userList =
                    userService.getAll(
                            page, entries, convertNameLikeToSqlSyntax(nameLike), includeAttributes);
            Iterator<User> iterator = userList.iterator();

            List<RESTUser> restUserList = new ArrayList<>();
            while (iterator.hasNext()) {
                User user = iterator.next();

                RESTUser restUser =
                        new RESTUser(
                                user.getId(),
                                user.getName(),
                                user.getRole(),
                                user.getGroups(),
                                false);
                restUserList.add(restUser);
            }

            return new UserList(restUserList);
        } catch (BadRequestServiceEx ex) {
            throw new BadRequestWebEx(ex.getMessage());
        }
    }

    /**
     * Utility method to remove Reserved group (for example EVERYONE) from a group list
     *
     * @param groups
     * @return
     */
    private Set<UserGroup> removeReservedGroups(Set<UserGroup> groups) {
        List<UserGroup> reserved = new ArrayList<UserGroup>();
        for (UserGroup ug : groups) {
            if (!GroupReservedNames.isAllowedName(ug.getGroupName())) {
                reserved.add(ug);
            }
        }
        for (UserGroup ug : reserved) {
            groups.remove(ug);
        }
        return groups;
    }
}
