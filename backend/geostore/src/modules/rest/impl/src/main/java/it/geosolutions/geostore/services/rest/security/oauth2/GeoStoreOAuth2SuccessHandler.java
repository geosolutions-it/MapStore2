package it.geosolutions.geostore.services.rest.security.oauth2;

import static it.geosolutions.geostore.services.rest.security.oauth2.OAuth2GeoStoreAuthenticationFilter.OAUTH2_AUTHENTICATION_TYPE_KEY;
import static it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils.ACCESS_TOKEN_PARAM;
import static it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils.REFRESH_TOKEN_PARAM;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;

public class GeoStoreOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final OAuth2AuthorizedClientService authorizedClientService;
    private final OAuth2GeoStoreAuthenticationService authenticationService;

    public GeoStoreOAuth2SuccessHandler(
            OAuth2AuthorizedClientService authorizedClientService,
            OAuth2GeoStoreAuthenticationService authenticationService) {
        this.authorizedClientService = authorizedClientService;
        this.authenticationService = authenticationService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException {

        if (!(authentication instanceof OAuth2AuthenticationToken)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unsupported authentication");
            return;
        }
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;

        OAuth2AuthorizedClient authorizedClient =
                authorizedClientService.loadAuthorizedClient(
                        oauthToken.getAuthorizedClientRegistrationId(), oauthToken.getName());

        OAuth2AccessToken accessToken =
                authorizedClient != null ? authorizedClient.getAccessToken() : null;

        OAuth2RefreshToken refreshToken =
                authorizedClient != null ? authorizedClient.getRefreshToken() : null;

        request.setAttribute(
                OAUTH2_AUTHENTICATION_TYPE_KEY,
                OAuth2GeoStoreAuthenticationFilter.OAuth2AuthenticationType.USER);

        if (accessToken != null) {
            request.setAttribute(ACCESS_TOKEN_PARAM, accessToken.getTokenValue());
        }
        if (refreshToken != null) {
            request.setAttribute(REFRESH_TOKEN_PARAM, refreshToken.getTokenValue());
        }

        Authentication finalAuthentication =
                authenticationService.completeInteractiveAuthentication(
                        request, response, accessToken, refreshToken);

        SecurityContextHolder.getContext().setAuthentication(finalAuthentication);

        response.sendRedirect("/");
    }
}
