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
import it.geosolutions.geostore.core.model.UserAttribute;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.security.core.Authentication;

import java.util.Collection;

/**
 * Token based authentication filter that looks for the token in a user attribute.
 *
 * <p>The attribute name is configurable (defaults to UUID).
 *
 * @author Mauro Bartolomeoli
 */
public class UserAttributeTokenAuthenticationFilter extends TokenAuthenticationFilter {

    private static final Logger LOGGER =
            LogManager.getLogger(UserAttributeTokenAuthenticationFilter.class);

    private String attributeName = "UUID";

    public void setAttributeName(String attributeName) {
        this.attributeName = attributeName;
    }

    @Override
    protected Authentication checkToken(String token) {
        UserAttribute attribute = new UserAttribute();
        attribute.setName(attributeName);
        attribute.setValue(token);
        // looks for user(s) having the specified attribute with the given
        // token value
        Collection<User> users = userService.getByAttribute(attribute);
        // the token is considered valid if only 1 user matches
        if (users.size() == 1) {
            User user = users.iterator().next();
            return createAuthenticationForUser(user);
        } else if (users.size() > 1) {
            LOGGER.error(
                    "Too many users matching the given token. Only one is allowed for a token to be valid!");
        } else {
            LOGGER.error("No users matching the given token.");
        }
        return null;
    }
}
