package it.geosolutions.geostore.services.rest.impl;

import static it.geosolutions.geostore.services.rest.impl.RESTSessionServiceImpl.BEARER_TYPE;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.services.UserSessionService;
import it.geosolutions.geostore.services.dto.UserSession;
import it.geosolutions.geostore.services.rest.RESTSessionService;
import it.geosolutions.geostore.services.rest.SessionServiceDelegate;
import it.geosolutions.geostore.services.rest.exception.ForbiddenErrorWebEx;
import it.geosolutions.geostore.services.rest.model.SessionToken;

import org.springframework.beans.factory.annotation.Autowired;

public class SessionServiceDelegateImpl implements SessionServiceDelegate {

    public static final String DEFAULT_NAME = "DEFAULT";
    @Autowired private UserSessionService userSessionService;

    public SessionServiceDelegateImpl(RESTSessionService restSessionService) {
        restSessionService.registerDelegate(DEFAULT_NAME, this);
    }

    public SessionServiceDelegateImpl() {}

    @Override
    public SessionToken refresh(String refreshToken, String accessToken) {
        UserSession sessionToken = userSessionService.refreshSession(accessToken, refreshToken);
        if (sessionToken == null) {
            throw new ForbiddenErrorWebEx(
                    "Refresh token was not provided or session is already expired.");
        }
        SessionToken token = new SessionToken();
        token.setAccessToken(sessionToken.getId());
        token.setRefreshToken(sessionToken.getRefreshToken());
        token.setExpires(sessionToken.getExpirationInterval());
        token.setTokenType(BEARER_TYPE);
        return token;
    }

    @Override
    public void doLogout(String sessionId) {
        userSessionService.removeSession(sessionId);
    }

    /**
     * Set the user session service.
     *
     * @param userSessionService the user session service.
     */
    public void setUserSessionService(UserSessionService userSessionService) {
        this.userSessionService = userSessionService;
    }

    public User getUser(String sessionId, boolean refresh, boolean autorefresh) {
        User details = null;
        if (userSessionService != null) {
            details = userSessionService.getUserData(sessionId);
            if (details != null && refresh && autorefresh) {
                userSessionService.refreshSession(
                        sessionId, userSessionService.getRefreshToken(sessionId));
            }
        }
        return details;
    }

    public String getUserName(String sessionId, boolean refresh, boolean autorefresh) {
        User userData = getUser(sessionId, refresh, autorefresh);
        if (userData != null) return userData.getName();
        return null;
    }
}
