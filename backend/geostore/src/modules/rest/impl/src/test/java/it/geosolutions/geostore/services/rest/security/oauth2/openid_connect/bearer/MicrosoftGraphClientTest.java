/* ====================================================================
 *
 * Copyright (C) 2024 GeoSolutions S.A.S.
 * http://www.geo-solutions.it
 *
 * GPLv3 + Classpath exception
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.
 *
 * ====================================================================
 *
 * This software consists of voluntary contributions made by developers
 * of GeoSolutions.  For more information on GeoSolutions, please see
 * <http://www.geo-solutions.it/>.
 *
 */
package it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;

import static org.junit.jupiter.api.Assertions.*;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;

import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Configuration;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Arrays;
import java.util.List;

public class MicrosoftGraphClientTest {

    private static WireMockServer graphService;
    private static MicrosoftGraphClient client;
    private static final String TEST_TOKEN = "test-access-token-12345";

    @BeforeAll
    static void beforeAll() {
        graphService = new WireMockServer(wireMockConfig().dynamicPort());
        graphService.start();

        String graphEndpoint = "http://localhost:" + graphService.port();
        client = new MicrosoftGraphClient(graphEndpoint, new OAuth2Configuration());
    }

    @AfterAll
    static void afterAll() {
        graphService.stop();
    }

    @Test
    public void testFetchMemberOfGroups() {
        // Response with mixed types: groups + service principals
        graphService.stubFor(
                WireMock.get(urlPathEqualTo("/me/memberOf"))
                        .withHeader("Authorization", equalTo("Bearer " + TEST_TOKEN))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody(
                                                "{\"value\":["
                                                        + "{\"@odata.type\":\"#microsoft.graph.group\","
                                                        + "\"displayName\":\"GIS Analysts\","
                                                        + "\"id\":\"g1\"},"
                                                        + "{\"@odata.type\":\"#microsoft.graph.group\","
                                                        + "\"displayName\":\"Map Editors\","
                                                        + "\"id\":\"g2\"},"
                                                        + "{\"@odata.type\":\"#microsoft.graph.servicePrincipal\","
                                                        + "\"displayName\":\"Some SP\","
                                                        + "\"id\":\"sp1\"}"
                                                        + "]}")));

        List<String> groups = client.fetchMemberOfGroups(TEST_TOKEN);

        assertEquals(2, groups.size());
        assertTrue(groups.contains("GIS Analysts"));
        assertTrue(groups.contains("Map Editors"));
        // Service principals should be filtered out
        assertFalse(groups.contains("Some SP"));
    }

    @Test
    public void testFetchMemberOfGroupsPagination() {
        String page2Url =
                "http://localhost:" + graphService.port() + "/me/memberOf?$skiptoken=page2";

        // Page 1 with nextLink
        graphService.stubFor(
                WireMock.get(urlPathEqualTo("/me/memberOf"))
                        .withQueryParam("$select", containing("displayName"))
                        .withHeader("Authorization", equalTo("Bearer " + TEST_TOKEN))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody(
                                                "{\"@odata.nextLink\":\""
                                                        + page2Url
                                                        + "\","
                                                        + "\"value\":["
                                                        + "{\"@odata.type\":\"#microsoft.graph.group\","
                                                        + "\"displayName\":\"Group A\",\"id\":\"g1\"}"
                                                        + "]}")));

        // Page 2 without nextLink
        graphService.stubFor(
                WireMock.get(urlPathEqualTo("/me/memberOf"))
                        .withQueryParam("$skiptoken", equalTo("page2"))
                        .withHeader("Authorization", equalTo("Bearer " + TEST_TOKEN))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody(
                                                "{\"value\":["
                                                        + "{\"@odata.type\":\"#microsoft.graph.group\","
                                                        + "\"displayName\":\"Group B\",\"id\":\"g2\"}"
                                                        + "]}")));

        List<String> groups = client.fetchMemberOfGroups(TEST_TOKEN);

        assertEquals(2, groups.size());
        assertTrue(groups.contains("Group A"));
        assertTrue(groups.contains("Group B"));
    }

    @Test
    public void testFetchMemberOfGroupsHttpError() {
        // Clear stubs from other tests
        graphService.resetMappings();

        // Return 403 Forbidden
        graphService.stubFor(
                WireMock.get(urlPathEqualTo("/me/memberOf"))
                        .willReturn(aResponse().withStatus(403).withBody("Forbidden")));

        List<String> groups = client.fetchMemberOfGroups(TEST_TOKEN);

        assertTrue(groups.isEmpty(), "HTTP error should return empty list");
    }

    @Test
    public void testFetchAppRoleAssignments() {
        graphService.stubFor(
                WireMock.get(urlPathEqualTo("/me/appRoleAssignments"))
                        .withHeader("Authorization", equalTo("Bearer " + TEST_TOKEN))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody(
                                                "{\"value\":["
                                                        + "{\"appRoleId\":\"role-guid-001\","
                                                        + "\"resourceId\":\"sp-guid-001\"},"
                                                        + "{\"appRoleId\":\"role-guid-002\","
                                                        + "\"resourceId\":\"sp-guid-001\"}"
                                                        + "]}")));

        List<MicrosoftGraphClient.AppRoleAssignment> assignments =
                client.fetchAppRoleAssignments(TEST_TOKEN);

        assertEquals(2, assignments.size());
        assertEquals("role-guid-001", assignments.get(0).getAppRoleId());
        assertEquals("sp-guid-001", assignments.get(0).getResourceId());
        assertEquals("role-guid-002", assignments.get(1).getAppRoleId());
    }

    @Test
    public void testResolveAppRoleNames() {
        graphService.stubFor(
                WireMock.get(urlPathEqualTo("/servicePrincipals/sp-guid-001/appRoles"))
                        .withHeader("Authorization", equalTo("Bearer " + TEST_TOKEN))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody(
                                                "{\"value\":["
                                                        + "{\"id\":\"role-guid-001\","
                                                        + "\"value\":\"Admin\","
                                                        + "\"displayName\":\"Administrator\"},"
                                                        + "{\"id\":\"role-guid-002\","
                                                        + "\"value\":\"Viewer\","
                                                        + "\"displayName\":\"Viewer\"}"
                                                        + "]}")));

        List<MicrosoftGraphClient.AppRoleAssignment> assignments =
                Arrays.asList(
                        new MicrosoftGraphClient.AppRoleAssignment("role-guid-001", "sp-guid-001"),
                        new MicrosoftGraphClient.AppRoleAssignment("role-guid-002", "sp-guid-001"));

        List<String> roleNames = client.resolveAppRoleNames(TEST_TOKEN, assignments);

        assertEquals(2, roleNames.size());
        assertTrue(roleNames.contains("Admin"));
        assertTrue(roleNames.contains("Viewer"));
    }

    @Test
    public void testEmptyAndNullToken() {
        // Null token
        List<String> groups1 = client.fetchMemberOfGroups(null);
        assertTrue(groups1.isEmpty(), "Null token should return empty list");

        // Empty token
        List<String> groups2 = client.fetchMemberOfGroups("");
        assertTrue(groups2.isEmpty(), "Empty token should return empty list");

        // Null token for assignments
        List<MicrosoftGraphClient.AppRoleAssignment> assignments =
                client.fetchAppRoleAssignments(null);
        assertTrue(assignments.isEmpty(), "Null token should return empty assignments");

        // Null/empty for resolve
        List<String> roles = client.resolveAppRoleNames(null, java.util.Collections.emptyList());
        assertTrue(roles.isEmpty(), "Null token should return empty role names");
    }
}
