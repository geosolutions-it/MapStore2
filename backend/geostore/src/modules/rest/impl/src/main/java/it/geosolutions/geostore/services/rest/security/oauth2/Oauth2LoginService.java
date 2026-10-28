package it.geosolutions.geostore.services.rest.security.oauth2;

import static it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Configuration.CONFIG_NAME_SUFFIX;
import static it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils.*;

import it.geosolutions.geostore.services.rest.IdPLoginService;
import it.geosolutions.geostore.services.rest.model.SessionToken;
import it.geosolutions.geostore.services.rest.security.IdPConfiguration;
import it.geosolutions.geostore.services.rest.utils.GeoStoreContext;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.ws.rs.core.Cookie;
import jakarta.ws.rs.core.NewCookie;
import jakarta.ws.rs.core.Response;

import org.apache.commons.lang3.time.DateUtils;
import org.apache.cxf.jaxrs.impl.ResponseBuilderImpl;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Date;

public abstract class Oauth2LoginService implements IdPLoginService {

    private static final Logger LOGGER = LogManager.getLogger(Oauth2LoginService.class);

    @Override
    public void doLogin(HttpServletRequest request, HttpServletResponse response, String provider) {
        LOGGER.info("doLogin called for provider '{}'", provider);
        HttpServletResponse resp = OAuth2Utils.getResponse();
        OAuth2Configuration configuration = oauth2Configuration(provider);
        if (configuration == null) {
            LOGGER.error(
                    "No OAuth2Configuration bean found for provider '{}' (expected bean name: '{}')",
                    provider,
                    provider + CONFIG_NAME_SUFFIX);
            throw new RuntimeException("No OAuth2Configuration found for provider: " + provider);
        }
        LOGGER.debug(
                "Provider '{}' config: enabled={}, clientId={}, authorizationUri={}, "
                        + "accessTokenUri={}, discoveryUrl={}, redirectUri={}, scopes={}",
                provider,
                configuration.isEnabled(),
                configuration.getClientId(),
                configuration.getAuthorizationUri(),
                configuration.getAccessTokenUri(),
                configuration.getDiscoveryUrl(),
                configuration.getRedirectUri(),
                configuration.getScopes());
        if (configuration.isInvalid()) {
            LOGGER.error(
                    "Provider '{}' configuration is INVALID (missing clientId, clientSecret, "
                            + "authorizationUri, or accessTokenUri). Discovery may have failed.",
                    provider);
        }
        try {
            configuration.getAuthenticationEntryPoint().commence(request, resp, null);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public Response doInternalRedirect(
            HttpServletRequest request, HttpServletResponse response, String provider) {
        String token = getAccessToken();
        String refreshToken = getRefreshAccessToken();
        return buildCallbackResponse(response, token, refreshToken, provider);
    }

    protected Response.ResponseBuilder getCallbackResponseBuilder(
            HttpServletResponse response, String token, String refreshToken, String provider) {
        Response.ResponseBuilder result = new ResponseBuilderImpl();
        IdPConfiguration configuration = configuration(provider);
        LOGGER.debug("Callback Provider: {}", provider);
        if (configuration == null) {
            LOGGER.error(
                    "No IdPConfiguration bean found for provider '{}' (expected bean name: '{}'). "
                            + "The bean may not have been registered in GeoStoreContext's "
                            + "ApplicationContext.",
                    provider,
                    provider + CONFIG_NAME_SUFFIX);
            throw new RuntimeException(
                    "No IdPConfiguration found for callback provider: " + provider);
        }
        LOGGER.debug("Token: {}", token);

        String internalRedirectUri = configuration.getInternalRedirectUri();

        if (internalRedirectUri == null || internalRedirectUri.isBlank()) {
            throw new RuntimeException(
                    "Internal redirect uri is missing. Check the configuration property value.");
        }
        LOGGER.debug("Internal redirect uri: {}", internalRedirectUri);

        if (token != null) {
            LOGGER.debug("AccessToken found");
            SessionToken sessionToken = new SessionToken();
            try {
                result = result.status(302).location(new URI(internalRedirectUri));
                LOGGER.debug("AccessToken: {}", token);
                sessionToken.setAccessToken(token);
                sessionToken.setTokenType("Bearer");
                if (refreshToken != null) {
                    LOGGER.debug("RefreshToken: {}", refreshToken);
                    result.header("Set-Cookie", refreshTokenCookie(refreshToken).toString());
                }
                TokenStorage tokenStorage = tokenStorage();
                Object key = tokenStorage.buildTokenKey();
                tokenStorage.saveToken(key, sessionToken);
                Cookie cookie = cookie(TOKENS_KEY, key.toString());
                result.header("Set-Cookie", cookie.toString());
                cookie = cookie(AUTH_PROVIDER, provider);
                result.header("Set-Cookie", cookie.toString());
            } catch (URISyntaxException e) {
                LOGGER.error(e);
                result =
                        result.status(Response.Status.INTERNAL_SERVER_ERROR)
                                .entity(
                                        "Exception while parsing the internal redirect url: "
                                                + e.getMessage());
            }
        } else {
            LOGGER.error("No access token found on callback request: {}", response.getStatus());
            result =
                    Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity("No access token found.");
        }
        return result;
    }

    @Override
    public SessionToken getTokenByIdentifier(String provider, String tokenIdentifier) {
        TokenStorage storage = tokenStorage();
        SessionToken sessionToken = storage.getTokenByIdentifier(tokenIdentifier);
        if (sessionToken != null) storage.removeTokenByIdentifier(tokenIdentifier);
        return sessionToken;
    }

    protected TokenStorage tokenStorage() {
        return GeoStoreContext.bean(TokenStorage.class);
    }

    protected Response buildCallbackResponse(
            HttpServletResponse response, String token, String refreshToken, String provider) {
        Response.ResponseBuilder result =
                getCallbackResponseBuilder(response, token, refreshToken, provider);
        return result.build();
    }

    protected OAuth2Configuration oauth2Configuration(String provider) {
        String beanName = provider + CONFIG_NAME_SUFFIX;
        OAuth2Configuration config = GeoStoreContext.bean(beanName, OAuth2Configuration.class);
        if (config == null) {
            LOGGER.error(
                    "GeoStoreContext.bean('{}', OAuth2Configuration.class) returned null. "
                            + "Trying raw lookup...",
                    beanName);
            Object raw = GeoStoreContext.bean(beanName);
            LOGGER.error(
                    "Raw bean '{}': {} (type: {})",
                    beanName,
                    raw,
                    raw != null ? raw.getClass().getName() : "null");
        }
        return config;
    }

    protected IdPConfiguration configuration(String provider) {
        String beanName = provider + CONFIG_NAME_SUFFIX;
        IdPConfiguration config = GeoStoreContext.bean(beanName, IdPConfiguration.class);
        if (config == null) {
            LOGGER.error(
                    "GeoStoreContext.bean('{}', IdPConfiguration.class) returned null. "
                            + "Trying raw lookup...",
                    beanName);
            Object raw = GeoStoreContext.bean(beanName);
            LOGGER.error(
                    "Raw bean '{}': {} (type: {})",
                    beanName,
                    raw,
                    raw != null ? raw.getClass().getName() : "null");
        }
        return config;
    }

    protected NewCookie refreshTokenCookie(String value) {
        boolean secure = isRequestSecure();
        Cookie cookie = new Cookie(REFRESH_TOKEN_PARAM, value, "/", null);
        return new AccessCookie(cookie, "", 604800, null, secure, true, "lax");
    }

    private boolean isRequestSecure() {
        ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attrs != null && attrs.getRequest().isSecure();
    }

    protected NewCookie cookie(String name, String value) {
        Cookie cookie = new Cookie(name, value, "/", null);
        return new AccessCookie(
                cookie, "", 120, DateUtils.addMinutes(new Date(), 2), false, false, "lax");
    }
}
