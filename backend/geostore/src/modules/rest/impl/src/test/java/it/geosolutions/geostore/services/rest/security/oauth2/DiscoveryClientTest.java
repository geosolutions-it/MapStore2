package it.geosolutions.geostore.services.rest.security.oauth2;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.common.ConsoleNotifier;

import org.junit.BeforeClass;
import org.junit.Test;
import org.springframework.http.MediaType;

import java.util.Arrays;

public class DiscoveryClientTest {

    private static WireMockServer openIdService;
    private static String authService;

    @BeforeClass
    public static void beforeClass() throws Exception {
        openIdService =
                new WireMockServer(
                        wireMockConfig()
                                .dynamicPort()
                                // uncomment the following to get wiremock logging
                                .notifier(new ConsoleNotifier(true)));
        openIdService.start();

        openIdService.stubFor(
                any((urlEqualTo("/.well-known/openid-configuration")))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBodyFile("discovery_result.json")));
        authService = "http://localhost:" + openIdService.port();
    }

    @Test
    public void testDiscovery() {
        OAuth2Configuration configuration = new OAuth2Configuration();
        configuration.setScopes("openid,groups");
        DiscoveryClient discoveryClient =
                new DiscoveryClient(
                        authService + "/.well-known/openid-configuration", configuration);
        discoveryClient.autofill(configuration);
        assertEquals("https://oauth2.googleapis.com/token", configuration.getAccessTokenUri());
        assertEquals(
                "https://accounts.google.com/o/oauth2/v2/auth",
                configuration.getAuthorizationUri());
        assertEquals("https://oauth2.googleapis.com/revoke", configuration.getRevokeEndpoint());
        assertEquals(
                "https://openidconnect.googleapis.com/v1/userinfo",
                configuration.getCheckTokenEndpointUrl());
        assertEquals("https://www.googleapis.com/oauth2/v3/certs", configuration.getIdTokenUri());
        // Split the strings into arrays
        String[] expectedScopes = "openid,groups".split(",");
        String[] actualScopes = configuration.getScopes().split(",");

        // Sort the arrays
        Arrays.sort(expectedScopes);
        Arrays.sort(actualScopes);

        // Compare the sorted arrays
        assertArrayEquals("The scopes match", expectedScopes, actualScopes);
    }
}
