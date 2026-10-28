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
package it.geosolutions.geostore.services;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.services.dto.UserSession;

/**
 * Basic interface for a UserSession service. The service should allow registering new sessions,
 * verifying them, removing and automatic expiring.
 *
 * @author Mauro Bartolomeoli
 * @author Lorenzo Natali
 */
public interface UserSessionService {

    /**
     * Gets user data for the given session id (if existing).
     *
     * @param sessionId
     * @return
     */
    public User getUserData(String sessionId);

    /**
     * Gets refresh token for a given session id (if existing).
     *
     * @param sessionId
     * @return
     */
    public String getRefreshToken(String sessionId);

    /**
     * Refresh an expiring session by the given interval.
     *
     * @param sessionId
     */
    public UserSession refreshSession(String sessionId, String refreshToken);

    /**
     * Register a new session. The session id is given.
     *
     * @param sessionId
     * @param session
     */
    public void registerNewSession(String sessionId, UserSession session);

    /**
     * Register a new session. The session id is automatically created and returned.
     *
     * @param session
     * @return the generated session id
     */
    public UserSession registerNewSession(UserSession session);

    /**
     * Remove a session, given its id.
     *
     * @param sessionId
     */
    public void removeSession(String sessionId);

    /** Remove all the sessions. */
    public void removeAllSessions();

    /**
     * Checks that owner is the user bound to the given sessionId.
     *
     * @param sessionId
     * @param owner
     * @return
     */
    public boolean isOwner(String sessionId, Object owner);
}
