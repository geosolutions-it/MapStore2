package it.geosolutions.geostore.services.rest.security.oauth2;

import it.geosolutions.geostore.services.rest.model.SessionToken;

public interface TokenStorage<T> {

    SessionToken getTokenByIdentifier(T identifier);

    void removeTokenByIdentifier(T identifier);

    void saveToken(T identifier, SessionToken token);

    T buildTokenKey();
}
