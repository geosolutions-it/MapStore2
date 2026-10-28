package it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer;

import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.OpenIdConnectConfiguration;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.Map;

/**
 * This verifies that the token is about our user (i.e. the access token and userinfo endpoint agree
 * on who).
 *
 * <p>For most OIDC providers, the "sub" of the JWT and userInfo are the same. For Azure AD, the
 * "sub" of the userInfo is in the JWT "xms_st" claim. "xms_st": { "sub":
 * "982kuI1hxIANLB__lrKejDgDnyjPnhbKLdPUF0JmOD1" },
 *
 * <p>The spec suggests verifying the user vs token subjects match, so this does that check.
 */
public class SubjectTokenValidator implements OpenIdTokenValidator {

    private static final Logger LOGGER = LogManager.getLogger(SubjectTokenValidator.class);

    private final String SUBJECT_CLAIM_NAME = "sub";
    private final String AZURE_SUBJECT_CONTAINER_NAME = "xms_st";

    @Override
    public void verifyToken(OpenIdConnectConfiguration config, Map claims, Map userInfoClaims)
            throws Exception {
        // If no userinfo is available (e.g. direct bearer token validation without
        // introspection), skip the subject comparison — there is nothing to compare against.
        if (userInfoClaims == null || userInfoClaims.isEmpty()) {
            return;
        }

        // normal case - subjects are the same
        if ((claims.get(SUBJECT_CLAIM_NAME) != null)
                && (userInfoClaims.get(SUBJECT_CLAIM_NAME) != null)) {
            if (claims.get(SUBJECT_CLAIM_NAME).equals(userInfoClaims.get(SUBJECT_CLAIM_NAME)))
                return;
        }

        // Azure AD case - use accesstoken.xms_st.sub vs userinfo.sub
        if ((claims.get(AZURE_SUBJECT_CONTAINER_NAME) != null)
                && (claims.get(AZURE_SUBJECT_CONTAINER_NAME) instanceof Map)) {
            Map xmls_st = (Map) claims.get(AZURE_SUBJECT_CONTAINER_NAME);
            if (xmls_st.get(SUBJECT_CLAIM_NAME) != null) {
                if (xmls_st.get(SUBJECT_CLAIM_NAME).equals(userInfoClaims.get(SUBJECT_CLAIM_NAME)))
                    return;
            }
        }
        LOGGER.warn(
                "Bearer token subject mismatch: JWT sub={}, userinfo sub={}",
                claims.get(SUBJECT_CLAIM_NAME),
                userInfoClaims != null ? userInfoClaims.get(SUBJECT_CLAIM_NAME) : "null");
        throw new Exception("JWT Bearer token subject does not match userinfo subject");
    }
}
