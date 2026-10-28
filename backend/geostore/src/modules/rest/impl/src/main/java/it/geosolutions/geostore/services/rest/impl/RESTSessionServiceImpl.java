/* ====================================================================
 *
 * Copyright (C) 2017 - 2025 GeoSolutions S.A.S.
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

import static it.geosolutions.geostore.services.rest.SessionServiceDelegate.PROVIDER_KEY;
import static it.geosolutions.geostore.services.rest.impl.SessionServiceDelegateImpl.DEFAULT_NAME;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.services.UserSessionService;
import it.geosolutions.geostore.services.dto.UserSession;
import it.geosolutions.geostore.services.dto.UserSessionImpl;
import it.geosolutions.geostore.services.rest.RESTSessionService;
import it.geosolutions.geostore.services.rest.SessionServiceDelegate;
import it.geosolutions.geostore.services.rest.model.SessionToken;
import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.core.SecurityContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;

public class RESTSessionServiceImpl extends RESTServiceImpl implements RESTSessionService {
    static final String BEARER_TYPE = "bearer";
    private static final String expireParser = "yyyy-MM-dd'T'HH:mm:ssZ";
    @Autowired UserSessionService userSessionService;
    private Map<String, SessionServiceDelegate> delegates;
    private boolean autorefresh = false;
    private long sessionTimeout = 86400; // 1 day

    public RESTSessionServiceImpl() {
        registerDelegate(DEFAULT_NAME, new SessionServiceDelegateImpl());
    }

    /** Transform Calendar to ISO 8601 string. */
    public static String fromCalendar(final Calendar calendar) {
        Date date = calendar.getTime();
        String formatted = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ").format(date);
        return formatted.substring(0, 22) + ":" + formatted.substring(22);
    }

    /** Transform ISO 8601 string to Calendar. */
    public static Calendar toCalendar(final String iso8601string) throws ParseException {
        Calendar calendar = GregorianCalendar.getInstance();
        String s = iso8601string.replace("Z", "+00:00");
        try {
            s = s.substring(0, 22) + s.substring(23); // to get rid of the ":"
        } catch (IndexOutOfBoundsException e) {
            throw new ParseException("Invalid length", 0);
        }
        Date date = new SimpleDateFormat(expireParser).parse(s);
        calendar.setTime(date);
        return calendar;
    }

    public boolean isAutorefresh() {
        return autorefresh;
    }

    public void setAutorefresh(boolean autorefresh) {
        this.autorefresh = autorefresh;
    }

    public UserSessionService getUserSessionService() {
        return userSessionService;
    }

    public void setUserSessionService(UserSessionService userSessionService) {
        this.userSessionService = userSessionService;
    }

    /**
     * Gets the User object associated to the given sessionId (if it exists).
     *
     * @param sessionId
     * @return
     */
    public User getUser(String sessionId, boolean refresh) {
        User user = null;
        Collection<SessionServiceDelegate> list = delegates.values();
        for (SessionServiceDelegate del : list) {
            user = del.getUser(sessionId, refresh, autorefresh);
            if (user != null) break;
        }
        return user;
    }

    /**
     * Gets the username associated to the given sessionId (if it exists).
     *
     * @param sessionId
     * @return
     */
    public String getUserName(String sessionId, boolean refresh) {
        String userName = null;
        Collection<SessionServiceDelegate> list = delegates.values();
        for (SessionServiceDelegate del : list) {
            userName = del.getUserName(sessionId, refresh, autorefresh);
            if (userName != null) break;
        }
        return userName;
    }

    private Calendar getExpiration(String expires) throws ParseException {
        if (!"".equals(expires)) {
            return toCalendar(expires);
        }
        return null;
    }

    /**
     * Creates a new session for the User in SecurityContext.
     *
     * @return
     * @throws ParseException
     */
    public UserSession createSession(String expires, SecurityContext sc) throws ParseException {
        User user = extractAuthUser(sc);
        if (user != null) {
            Calendar expiration = getExpiration(expires);
            UserSession session = null;
            session = new UserSessionImpl(null, user, expiration);
            return userSessionService.registerNewSession(session);
        }

        return null;
    }

    @Override
    public SessionToken login(SecurityContext sc) throws ParseException {
        Calendar expires = new GregorianCalendar();
        expires.add(Calendar.SECOND, (int) getSessionTimeout());
        User user = extractAuthUser(sc);
        if (user != null) {
            UserSession session = null;
            if (user instanceof User) {
                session = new UserSessionImpl(null, user, expires);
                session.setExpirationInterval(getSessionTimeout());
            }
            return toSessionToken(userSessionService.registerNewSession(session), session);
        }
        return null;
    }

    private SessionToken toSessionToken(UserSession accessToken, UserSession sessionToken) {
        if (sessionToken == null) {
            return null;
        }
        SessionToken token = new SessionToken();
        token.setAccessToken(accessToken.getId());
        token.setRefreshToken(accessToken.getRefreshToken());
        token.setExpires(
                accessToken.getExpirationInterval() > 0
                        ? accessToken.getExpirationInterval()
                        : sessionToken.getExpirationInterval());
        token.setTokenType(BEARER_TYPE);
        return token;
    }

    @Override
    public SessionToken refresh(SecurityContext sc, String sessionId, String refreshToken) {
        String provider =
                (String)
                        Objects.requireNonNull(RequestContextHolder.getRequestAttributes())
                                .getAttribute(PROVIDER_KEY, 0);
        SessionServiceDelegate delegate = getDelegate(provider);
        return delegate.refresh(refreshToken, sessionId);
    }

    private SessionServiceDelegate getDelegate(String key) {
        SessionServiceDelegate result;
        if (key == null) result = delegates.get(DEFAULT_NAME);
        else result = delegates.get(key);

        if (result == null) result = delegates.get(DEFAULT_NAME);

        return result;
    }

    /**
     * Removes the given session.
     *
     * @return
     */
    public void removeSession(String sessionId) {
        String provider =
                (String) RequestContextHolder.getRequestAttributes().getAttribute(PROVIDER_KEY, 0);
        SessionServiceDelegate delegate = getDelegate(provider);
        delegate.doLogout(sessionId);
    }

    @Override
    public SessionToken refresh(SessionToken sessionToken) throws ParseException {
        return refresh(null, sessionToken.getAccessToken(), sessionToken.getRefreshToken());
    }

    @Override
    public void removeSession() {
        ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) return;
        HttpServletRequest request = attrs.getRequest();
        String token = OAuth2Utils.getBearerToken(request);
        if (token != null && !token.isEmpty()) {
            removeSession(token);
        }
    }

    /**
     * Removes all sessions.
     *
     * @return
     */
    public void clear() {
        userSessionService.removeAllSessions();
    }

    public long getSessionTimeout() {
        return sessionTimeout;
    }

    public void setSessionTimeout(long sessionTimeout) {
        this.sessionTimeout = sessionTimeout;
    }

    @Override
    public void registerDelegate(String key, SessionServiceDelegate delegate) {
        if (delegates == null) this.delegates = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        this.delegates.put(key, delegate);
    }
}
