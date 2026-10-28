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

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * In memory implementation of a UserSessionService.
 *
 * @author Mauro Bartolomeoli
 * @author Lorenzo Natali
 */
public class InMemoryUserSessionServiceImpl implements UserSessionService {

    private Map<String, UserSession> sessions = new ConcurrentHashMap<String, UserSession>();
    private int cleanUpSeconds = 60;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    private Runnable evictionTask =
            new Runnable() {
                @Override
                public void run() {
                    for (String sessionId : sessions.keySet()) {
                        UserSession session = sessions.get(sessionId);
                        if (session.isExpired()) {
                            removeSession(sessionId);
                        }
                    }
                }
            };

    public InMemoryUserSessionServiceImpl() {
        super();
        // schedule eviction thread
        scheduler.scheduleAtFixedRate(
                evictionTask, cleanUpSeconds, cleanUpSeconds, TimeUnit.SECONDS);
    }

    public void setCleanUpSeconds(int cleanUpSeconds) {
        this.cleanUpSeconds = cleanUpSeconds;
    }

    @Override
    public User getUserData(String sessionId) {
        if (sessions.containsKey(sessionId)) {
            UserSession session = sessions.get(sessionId);
            if (session.isExpired()) {
                removeSession(sessionId);
                return null;
            }
            return session.getUser();
        }
        return null;
    }

    @Override
    public void registerNewSession(String sessionId, UserSession session) {
        sessions.put(sessionId, session);
    }

    @Override
    public UserSession registerNewSession(UserSession session) {
        String sessionId = createSessionId();
        String refreshToken = createSessionId();
        session.setId(sessionId);
        session.setRefreshToken(refreshToken);
        registerNewSession(sessionId, session);
        return session;
    }

    private String createSessionId() {
        return UUID.randomUUID().toString();
    }

    @Override
    public void removeSession(String sessionId) {
        sessions.remove(sessionId);
    }

    @Override
    public void removeAllSessions() {
        sessions.clear();
    }

    /**
     * Checks that owner is the user bound to the given sessionId. Ownership is checked by: -
     * userData equality to the given object - username equality to the string representation of
     * ownwer
     *
     * @param sessionId
     * @param owner
     * @return
     */
    public boolean isOwner(String sessionId, Object owner) {
        UserSession session = sessions.get(sessionId);
        if (session != null) {
            return owner.toString().equals(String.valueOf(session.getUser().getId()))
                    || owner.equals(session.getUser());
        }
        return false;
    }

    @Override
    public UserSession refreshSession(String sessionId, String refreshToken) {
        if (sessions.containsKey(sessionId)) {
            UserSession sess = sessions.get(sessionId);
            if (sess != null && sess.getRefreshToken().equals(refreshToken)) sess.refresh();
            return sess;
        }
        return null;
    }

    @Override
    public String getRefreshToken(String sessionId) {
        if (sessions.containsKey(sessionId)) {
            return sessions.get(sessionId).getRefreshToken();
        }
        return null;
    }
}
