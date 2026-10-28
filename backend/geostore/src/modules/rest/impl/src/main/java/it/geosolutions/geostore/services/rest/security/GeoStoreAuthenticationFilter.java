/* ====================================================================
 *
 * Copyright (C) 2015 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.security;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.core.security.UserMapper;
import it.geosolutions.geostore.services.UserService;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Base class for GeoStore authentication filters (based on Spring Security filters). Includes basic
 * functionalities for authentication based on external services, like: - automatic user creation /
 * enabling - mapping of attributes on user creation
 *
 * @author Mauro Bartolomeoli
 */
public abstract class GeoStoreAuthenticationFilter extends GenericFilterBean {

    public static final String USER_NOT_FOUND_MSG = "User not found. Please check your credentials";
    private static final Logger LOGGER = LogManager.getLogger(GeoStoreAuthenticationFilter.class);
    @Autowired protected UserService userService;

    private boolean autoCreateUser = false;

    private boolean enableAutoCreatedUsers = true;

    private UserMapper userMapper;

    @Override
    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain)
            throws IOException, ServletException {
        if (req instanceof HttpServletRequest) {
            authenticate((HttpServletRequest) req);
        }
        chain.doFilter(req, resp);
    }

    protected abstract void authenticate(HttpServletRequest req);

    /**
     * Helper method that creates an Authentication object for the given userName and raw (service
     * retrieved) user details object.
     *
     * <p>If autoCreateUser is true, creates unexisting users, before returning the authentication
     * object.
     *
     * @param userName
     * @param rawUser
     * @return
     */
    protected Authentication createAuthenticationForUser(
            String userName, String credentials, Object rawUser) {
        User user = null;
        try {
            user = userService.get(userName);
        } catch (NotFoundServiceEx e) {
            if (autoCreateUser) {
                try {
                    user = createUser(userName, credentials, rawUser);
                } catch (BadRequestServiceEx e1) {
                    LOGGER.error("Error creating user for " + userName, e);
                } catch (NotFoundServiceEx e1) {
                    LOGGER.error("Error creating user for " + userName, e);
                }
            } else {
                LOGGER.error("User not found: " + userName, e);
            }
        }

        return createAuthenticationForUser(user);
    }

    /**
     * Creates a new user with the given userName and raw (service retrieved) user details object.
     *
     * <p>It uses the configured UserMapper to populate user attributes.
     *
     * <p>The user is assigned the USER role and no groups.
     *
     * @param userName
     * @param rawUser
     * @return
     * @throws BadRequestServiceEx
     * @throws NotFoundServiceEx
     */
    protected User createUser(String userName, String credentials, Object rawUser)
            throws BadRequestServiceEx, NotFoundServiceEx {
        User user = new User();

        user.setName(userName);
        user.setNewPassword(credentials);
        user.setEnabled(enableAutoCreatedUsers);

        Role role = Role.USER;
        user.setRole(role);
        user.setGroups(Collections.EMPTY_SET);
        if (userMapper != null) {
            userMapper.mapUser(rawUser, user);
        }
        if (userService != null) {
            userService.insert(user);
        }
        return user;
    }

    /**
     * Helper method that creates an Authentication object for the given user, populating
     * GrantedAuthority instances.
     *
     * @param user
     * @return
     */
    protected Authentication createAuthenticationForUser(User user) {
        if (user != null) {
            String role = user.getRole().toString();

            List<GrantedAuthority> authorities = new ArrayList<GrantedAuthority>();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
            return new UsernamePasswordAuthenticationToken(user, user.getPassword(), authorities);
        } else {
            LOGGER.error(USER_NOT_FOUND_MSG);
            return null;
        }
    }

    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    public void setUserMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public void setAutoCreateUser(boolean autoCreateUser) {
        this.autoCreateUser = autoCreateUser;
    }

    public void setEnableAutoCreatedUsers(boolean enableAutoCreatedUsers) {
        this.enableAutoCreatedUsers = enableAutoCreatedUsers;
    }
}
