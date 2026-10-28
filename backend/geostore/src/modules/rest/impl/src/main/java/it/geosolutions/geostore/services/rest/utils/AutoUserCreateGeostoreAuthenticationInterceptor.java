/*
 *  Copyright (C) 2007 - 2014 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.utils;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.services.UserService;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;

import org.apache.cxf.interceptor.security.AccessDeniedException;
import org.apache.cxf.message.Message;

import java.util.List;
import java.util.Map;

/**
 * Class AutoUserCreateGeostoreAuthenticationInterceptor. Geostore authentication interceptor that
 * allows users auto creation
 *
 * @author ETj (etj at geo-solutions.it)
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 * @author adiaz (alejandro.diaz at geo-solutions.it)
 */
public class AutoUserCreateGeostoreAuthenticationInterceptor
        extends AbstractGeoStoreAuthenticationInterceptor {

    private UserService userService;

    /** Flag to indicate if an user that not exists could be created when it's used */
    private Boolean autoCreateUsers = false;

    /** Role for the new user */
    private Role newUsersRole = Role.USER;

    /** New password strategy @see {@link NewPasswordStrategy} */
    private NewPasswordStrategy newUsersPassword = NewPasswordStrategy.NONE;

    /**
     * Header key for the new password if the selected strategy is {@link
     * NewPasswordStrategy#FROMHEADER}
     */
    private String newUsersPasswordHeader = "";

    /**
     * @param userService the userService to set
     */
    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    public void setAutoCreateUsers(Boolean autoCreateUsers) {
        this.autoCreateUsers = autoCreateUsers;
    }

    public void setNewUsersRole(Role newUsersRole) {
        this.newUsersRole = newUsersRole;
    }

    public void setNewUsersPassword(NewPasswordStrategy newUsersPassword) {
        this.newUsersPassword = newUsersPassword;
    }

    public void setNewUsersPasswordHeader(String newUsersPasswordHeader) {
        this.newUsersPasswordHeader = newUsersPasswordHeader;
    }

    /**
     * Obtain the new password for a new user
     *
     * @param message
     * @param username
     * @return password for the new user
     */
    private String getNewUserPassword(Message message, String username) {
        switch (newUsersPassword) {
            case NONE:
                return "";
            case USERNAME:
                return username;
            case FROMHEADER:
                @SuppressWarnings("unchecked")
                Map<String, List<String>> headers =
                        (Map<String, List<String>>) message.get(Message.PROTOCOL_HEADERS);
                if (headers.containsKey(newUsersPasswordHeader)) {
                    return headers.get(newUsersPasswordHeader).get(0);
                }
                return "";
            default:
                return "";
        }
    }

    /**
     * Obtain an user from his username
     *
     * @param username of the user
     * @param message intercepted
     * @return user identified with the username
     */
    protected User getUser(String username, Message message) {
        User user = null;
        try {
            // Search on db
            user = userService.get(username);
        } catch (NotFoundServiceEx e) {
            if (LOGGER.isInfoEnabled()) LOGGER.info("Requested user not found: " + username);

            // Auto create user
            if (autoCreateUsers) {
                if (LOGGER.isInfoEnabled()) {
                    LOGGER.info("Creating now");
                }
                user = new User();
                user.setName(username);

                user.setNewPassword(getNewUserPassword(message, username));
                user.setRole(newUsersRole);
                try {
                    // insert
                    user.setId(userService.insert(user));
                    // reload user stored
                    user = userService.get(username);
                } catch (Exception e1) {
                    throw new AccessDeniedException("Not able to create new user");
                }
            } else {
                throw new AccessDeniedException("Not authorized");
            }
        }

        return user;
    }
}
