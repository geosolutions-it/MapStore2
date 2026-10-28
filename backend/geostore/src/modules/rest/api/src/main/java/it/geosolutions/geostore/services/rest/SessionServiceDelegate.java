package it.geosolutions.geostore.services.rest;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.services.rest.model.SessionToken;

/**
 * Base interface for a SessionServiceDelegate. Instances of this type are meant to customize
 * refresh token and logout operations.
 */
public interface SessionServiceDelegate {

    String PROVIDER_KEY = "PROVIDER";

    /**
     * Refresh a token,
     *
     * @param refreshToken the refresh token.
     * @param accessToken the current access token.
     * @return a Session Token instance holding the new token and the refresh token.
     */
    SessionToken refresh(String refreshToken, String accessToken);

    /**
     * Get the user by sessionId.
     *
     * @param sessionId the session identifier.
     * @param refresh refresh flag.
     * @param autorefresh autorefresh flag.
     * @return the user if found, null otherwise.
     */
    User getUser(String sessionId, boolean refresh, boolean autorefresh);

    /**
     * Get the username by sessionId.
     *
     * @param sessionId the session identifier.
     * @param refresh refresh flag.
     * @param autorefresh autorefresh flag.
     * @return the username if found, null otherwise.
     */
    String getUserName(String sessionId, boolean refresh, boolean autorefresh);

    /**
     * Do the logout.
     *
     * @param sessionId the current session token.
     */
    void doLogout(String sessionId);
}
