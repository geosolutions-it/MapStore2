package it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer;

import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.OpenIdConnectConfiguration;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * This checks that the token is connected to this application. This will prevent a token for
 * another application being used by us.
 *
 * <p>NOTE: Azure AD's JWT AccessToken has a fixed "aud", no "azp", but an "appid" (should be our
 * client id). example; "aud": "00000003-0000-0000-c000-000000000000", "appid":
 * "b9e8d05a-08b6-48a5-81c8-9590a0f550f3",
 *
 * <p>NOTE: Some OIDC providers set the audience to a generic value (e.g. "account"), with no
 * "appid", but "azp" (authorized party) should be our client id. example; "aud": "account", "azp":
 * "live-key",
 */
public class AudienceAccessTokenValidator implements OpenIdTokenValidator {

    private static final Logger LOGGER = LogManager.getLogger(AudienceAccessTokenValidator.class);

    private final String AUDIENCE_CLAIM_NAME = "aud";
    private final String APPID_CLAIM_NAME = "appid";
    private final String AZP_CLAIM_NAME = "azp";

    /**
     * "aud" must be our client id OR "azp" must be our client id (or, if its a list, contain our
     * client id) OR "appid" must be our client id.
     *
     * <p>Otherwise, it's token not for us...
     *
     * <p>This checks that the audience of the JWT access token is us. The main attack this tries to
     * prevent is someone getting an access token from an OIDC provider that was meant for another
     * application (say a silly calendar app), and then using that token here. The OIDC provider
     * will validate the token as "good", but it wasn't generated for us. This does a check of the
     * token that OUR client ID is mentioned (not another app).
     */
    @Override
    public void verifyToken(OpenIdConnectConfiguration config, Map claimsJWT, Map userInfoClaims)
            throws Exception {
        String clientId = config.getClientId();
        if ((claimsJWT.get(AUDIENCE_CLAIM_NAME) != null)) {
            if (claimsJWT.get(AUDIENCE_CLAIM_NAME).equals(clientId)) {
                return;
            } else if (claimsJWT.get(AUDIENCE_CLAIM_NAME) instanceof Collection
                    && ((Collection) claimsJWT.get(AUDIENCE_CLAIM_NAME)).contains(clientId)) {
                return;
            }
        }

        if ((claimsJWT.get(APPID_CLAIM_NAME) != null)
                && claimsJWT.get(APPID_CLAIM_NAME).equals(clientId)) {
            return; // azure specific
        }

        // azp - authorized party (standard OIDC claim)
        Object azp = claimsJWT.get(AZP_CLAIM_NAME);
        if (azp != null) {
            if (azp instanceof String) {
                if (azp.equals(config.getClientId())) {
                    return;
                }
            } else if (azp instanceof List) {
                List azps = (List) azp;
                for (Object o : azps) {
                    if ((o instanceof String) && (o.equals(clientId))) {
                        return;
                    }
                }
            }
        }
        LOGGER.warn(
                "Bearer token audience validation failed: aud={}, appid={}, azp={}, expected clientId={}",
                claimsJWT.get(AUDIENCE_CLAIM_NAME),
                claimsJWT.get(APPID_CLAIM_NAME),
                claimsJWT.get(AZP_CLAIM_NAME),
                clientId);
        throw new Exception(
                "JWT Bearer token audience mismatch — not meant for this application (clientId="
                        + clientId
                        + ")");
    }
}
