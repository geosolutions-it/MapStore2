package it.geosolutions.geostore.services.rest.security.oauth2;

import static it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils.*;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import it.geosolutions.geostore.services.rest.IdPLoginRest;
import it.geosolutions.geostore.services.rest.security.IdPConfiguration;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.OpenIdConnectConfiguration;

import jakarta.ws.rs.core.Response;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.stream.Collectors;

public class OAuth2LoginTest {

    private final IdPLoginRest idPLoginRest = new IdPLoginRestImpl();
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private ServletRequestAttributes attributes;

    @Before
    public void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        attributes = new ServletRequestAttributes(request, response);
        RequestContextHolder.setRequestAttributes(attributes);
    }

    @Test
    public void testLogin() {
        OAuth2Configuration configuration = new OAuth2Configuration();
        configuration.setScopes("openid");
        configuration.setClientId("mockClientId");
        configuration.setAuthorizationUri("http://localhost:8080/authorization");
        SetConfOAuthLoginService setConfiguration = new SetConfOAuthLoginService(idPLoginRest);
        setConfiguration.setConfiguration(configuration);
        idPLoginRest.login("mock");
        assertEquals(302, response.getStatus());
        assertEquals(
                "http://localhost:8080/authorization?response_type=code&client_id=mockClientId&scope=openid&redirect_uri=null",
                response.getRedirectedUrl());
    }

    @Test
    public void testLoginWithPKCE() {
        OpenIdConnectConfiguration configuration = new OpenIdConnectConfiguration();
        configuration.setScopes("openid");
        configuration.setClientId("mockClientId");
        configuration.setAuthorizationUri("http://localhost:8080/authorization");
        configuration.setUsePKCE(true);
        SetConfOAuthLoginService setConfiguration = new SetConfOAuthLoginService(idPLoginRest);
        setConfiguration.setConfiguration(configuration);
        idPLoginRest.login("mock");
        assertEquals(302, response.getStatus());
        String redirectUrl = response.getRedirectedUrl();
        assertNotNull(redirectUrl);
        assertTrue(redirectUrl.contains("code_challenge_method=S256"));
        assertTrue(redirectUrl.contains("code_challenge="));
    }

    @Test
    public void testCallback() {
        attributes.setAttribute(REFRESH_TOKEN_PARAM, "mockRefreshToken", 0);
        attributes.setAttribute(ACCESS_TOKEN_PARAM, "mockAccessToken", 0);
        OAuth2Configuration configuration = new OAuth2Configuration();
        configuration.setInternalRedirectUri("http://localhost:8080/geostore/redirect");
        SetConfOAuthLoginService setConfiguration = new SetConfOAuthLoginService(idPLoginRest);
        setConfiguration.setConfiguration(configuration);
        setConfiguration.setTokenStorage(new InMemoryTokenStorage());
        Response result = idPLoginRest.callback("mock");
        assertEquals(302, result.getStatus());
        List<Object> cookies = result.getMetadata().get("Set-Cookie");
        List<Object> tokenCookies =
                cookies.stream()
                        .filter(
                                c ->
                                        ((String) c).contains(AUTH_PROVIDER)
                                                || ((String) c).contains(TOKENS_KEY))
                        .collect(Collectors.toList());
        assertEquals(2, tokenCookies.size());
        assertEquals("http://localhost:8080/geostore/redirect", result.getHeaderString("Location"));
    }

    @After
    public void afterTest() {
        RequestContextHolder.resetRequestAttributes();
    }

    private class SetConfOAuthLoginService extends Oauth2LoginService {

        private OAuth2Configuration configuration;

        private TokenStorage tokenStorage;

        public SetConfOAuthLoginService(IdPLoginRest loginRest) {
            loginRest.registerService("mock", this);
        }

        public void setConfiguration(OAuth2Configuration configuration) {
            this.configuration = configuration;
        }

        @Override
        protected OAuth2Configuration oauth2Configuration(String provider) {
            return configuration;
        }

        @Override
        protected IdPConfiguration configuration(String provider) {
            return configuration;
        }

        @Override
        protected TokenStorage tokenStorage() {
            return tokenStorage;
        }

        public void setTokenStorage(TokenStorage tokenStorage) {
            this.tokenStorage = tokenStorage;
        }
    }
}
