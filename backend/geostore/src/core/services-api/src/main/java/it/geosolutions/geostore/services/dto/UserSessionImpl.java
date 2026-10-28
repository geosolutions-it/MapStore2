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

import java.util.Calendar;

/**
 * Basic implementation of UserSession.
 *
 * @author Mauro Bartolomeoli
 */
public class UserSessionImpl implements UserSession {

    private String id;

    private User user;

    private Calendar expiration;

    private long expirationInterval = 0l;

    private String refreshToken;

    public UserSessionImpl(String id, User user, Calendar expiration) {
        super();
        this.id = id;
        this.user = user;
        this.expiration = expiration;
    }

    public UserSessionImpl(User user, Calendar expiration) {
        super();
        this.user = user;
        this.setExpiration(expiration);
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public User getUser() {
        return user;
    }

    @Override
    public boolean isExpired() {
        if (expiration != null) {
            return expiration.getTime().before(Calendar.getInstance().getTime());
        }
        return false;
    }

    @Override
    public void refresh() {
        if (expiration != null) {
            Calendar newExpiration = Calendar.getInstance();
            newExpiration.setTimeInMillis(
                    newExpiration.getTimeInMillis() + expirationInterval * 1000);
            setExpiration(newExpiration);
        }
    }

    public void setExpiration(Calendar expiration) {
        this.expiration = expiration;
    }

    @Override
    public long getExpirationInterval() {
        return expirationInterval;
    }

    @Override
    public void setExpirationInterval(long expirationInterval) {
        this.expirationInterval = expirationInterval;
    }
}
