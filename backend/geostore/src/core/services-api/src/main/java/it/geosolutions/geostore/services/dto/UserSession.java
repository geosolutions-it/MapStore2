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
package it.geosolutions.geostore.services.dto;

import it.geosolutions.geostore.core.model.User;

/**
 * Basic interface for a UserSession. The session has a unique identifier, contains user data and
 * allows for expiration check.
 *
 * @author Mauro Bartolomeoli
 * @author Lorenzo Natali
 */
public interface UserSession {

    public void setId(String id);

    public String getId();

    public void setUser(User user);

    public User getUser();

    public void setRefreshToken(String refreshToken);

    public String getRefreshToken();

    void setExpirationInterval(long expirationInterval);

    long getExpirationInterval();

    /**
     * Check if the token has expired
     *
     * @return true if it is expired
     */
    public boolean isExpired();

    /** Update expirationDate adding expiration time (in seconds) */
    public void refresh();
}
