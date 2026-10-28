package it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer;

import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.OpenIdConnectConfiguration;

import java.util.List;
import java.util.Map;

/**
 * This is a token validator that runs a list of TokenValidators. This doesn't do any validation on
 * its own...
 */
public class MultiTokenValidator implements OpenIdTokenValidator {

    List<OpenIdTokenValidator> validators;

    public MultiTokenValidator(List<OpenIdTokenValidator> validators) {
        this.validators = validators;
    }

    @Override
    public void verifyToken(
            OpenIdConnectConfiguration config, Map accessTokenClaims, Map userInfoClaims)
            throws Exception {
        if (validators == null) {
            return; // nothing to do
        }
        for (OpenIdTokenValidator validator : validators) {
            validator.verifyToken(config, accessTokenClaims, userInfoClaims);
        }
    }
}
