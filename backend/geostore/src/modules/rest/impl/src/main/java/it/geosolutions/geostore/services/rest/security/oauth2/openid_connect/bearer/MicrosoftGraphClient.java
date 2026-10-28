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

import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Configuration;
import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * HTTP client for Microsoft Graph API. Provides methods to resolve group memberships and app role
 * assignments for the authenticated user, handling OData pagination.
 *
 * <p>Used to resolve the Azure AD "groups overage" scenario where the JWT's {@code groups} claim is
 * replaced by {@code _claim_names}/{@code _claim_sources} metadata when a user belongs to more than
 * 200 groups.
 */
public class MicrosoftGraphClient {

    private static final Logger LOGGER = LogManager.getLogger(MicrosoftGraphClient.class);

    private final String graphEndpoint;
    private final RestTemplate restTemplate;

    public MicrosoftGraphClient(String graphEndpoint, OAuth2Configuration configuration) {
        this.graphEndpoint =
                graphEndpoint != null ? graphEndpoint : "https://graph.microsoft.com/v1.0";
        this.restTemplate = OAuth2Utils.protectedRestTemplate(configuration);
    }

    /**
     * Fetches the display names of all groups the authenticated user is a member of via {@code GET
     * /me/memberOf}. Filters to {@code #microsoft.graph.group} entries and extracts {@code
     * displayName}. Handles OData {@code @odata.nextLink} pagination.
     *
     * @param accessToken the OAuth2 access token with {@code GroupMember.Read.All} or {@code
     *     Directory.Read.All} scope.
     * @return list of group display names, or empty list on error.
     */
    @SuppressWarnings("unchecked")
    public List<String> fetchMemberOfGroups(String accessToken) {
        if (accessToken == null || accessToken.isEmpty()) {
            LOGGER.debug("MS Graph: no access token provided for group resolution");
            return Collections.emptyList();
        }

        try {
            String url = graphEndpoint + "/me/memberOf?$select=displayName,@odata.type";
            List<Map<String, Object>> allValues = fetchAllPages(url, accessToken);

            List<String> groups = new ArrayList<>();
            for (Map<String, Object> entry : allValues) {
                Object odataType = entry.get("@odata.type");
                if ("#microsoft.graph.group".equals(odataType)) {
                    Object displayName = entry.get("displayName");
                    if (displayName != null && !displayName.toString().isEmpty()) {
                        groups.add(displayName.toString());
                    }
                }
            }

            LOGGER.info("MS Graph: resolved {} groups from /me/memberOf", groups.size());
            return groups;
        } catch (Exception e) {
            LOGGER.warn(
                    "MS Graph: failed to fetch groups from /me/memberOf: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * Fetches app role assignments for the authenticated user via {@code GET
     * /me/appRoleAssignments}.
     *
     * @param accessToken the OAuth2 access token.
     * @return list of {@link AppRoleAssignment} objects, or empty list on error.
     */
    @SuppressWarnings("unchecked")
    public List<AppRoleAssignment> fetchAppRoleAssignments(String accessToken) {
        if (accessToken == null || accessToken.isEmpty()) {
            LOGGER.debug("MS Graph: no access token provided for app role assignments");
            return Collections.emptyList();
        }

        try {
            String url = graphEndpoint + "/me/appRoleAssignments";
            List<Map<String, Object>> allValues = fetchAllPages(url, accessToken);

            List<AppRoleAssignment> assignments = new ArrayList<>();
            for (Map<String, Object> entry : allValues) {
                Object appRoleId = entry.get("appRoleId");
                Object resourceId = entry.get("resourceId");
                if (appRoleId != null && resourceId != null) {
                    assignments.add(
                            new AppRoleAssignment(appRoleId.toString(), resourceId.toString()));
                }
            }

            LOGGER.info(
                    "MS Graph: resolved {} app role assignments from /me/appRoleAssignments",
                    assignments.size());
            return assignments;
        } catch (Exception e) {
            LOGGER.warn("MS Graph: failed to fetch app role assignments: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * Resolves app role assignment GUIDs to human-readable role names. Groups assignments by {@code
     * resourceId}, then calls {@code GET /servicePrincipals/{id}/appRoles} for each unique resource
     * to map GUIDs to {@code value} strings.
     *
     * @param accessToken the OAuth2 access token.
     * @param assignments the app role assignments to resolve.
     * @return list of resolved role name strings, or empty list on error.
     */
    @SuppressWarnings("unchecked")
    public List<String> resolveAppRoleNames(
            String accessToken, List<AppRoleAssignment> assignments) {
        if (accessToken == null
                || accessToken.isEmpty()
                || assignments == null
                || assignments.isEmpty()) {
            return Collections.emptyList();
        }

        try {
            // Group assignments by resourceId
            Map<String, List<String>> byResource = new LinkedHashMap<>();
            for (AppRoleAssignment a : assignments) {
                byResource
                        .computeIfAbsent(a.getResourceId(), k -> new ArrayList<>())
                        .add(a.getAppRoleId());
            }

            List<String> roleNames = new ArrayList<>();
            for (Map.Entry<String, List<String>> entry : byResource.entrySet()) {
                String resourceId = entry.getKey();
                List<String> roleIds = entry.getValue();

                String url = graphEndpoint + "/servicePrincipals/" + resourceId + "/appRoles";
                List<Map<String, Object>> appRoles = fetchAllPages(url, accessToken);

                // Build GUID -> value map
                Map<String, String> guidToValue = new LinkedHashMap<>();
                for (Map<String, Object> role : appRoles) {
                    Object id = role.get("id");
                    Object value = role.get("value");
                    if (id != null && value != null && !value.toString().isEmpty()) {
                        guidToValue.put(id.toString(), value.toString());
                    }
                }

                // Resolve each assignment's appRoleId
                for (String roleId : roleIds) {
                    String name = guidToValue.get(roleId);
                    if (name != null) {
                        roleNames.add(name);
                    }
                }
            }

            LOGGER.info("MS Graph: resolved {} app role names", roleNames.size());
            return roleNames;
        } catch (Exception e) {
            LOGGER.warn("MS Graph: failed to resolve app role names: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * Fetches all pages of an OData collection, following {@code @odata.nextLink} pagination.
     *
     * @param url the initial request URL.
     * @param accessToken the OAuth2 access token.
     * @return all {@code value} entries collected across pages.
     */
    @SuppressWarnings("unchecked")
    List<Map<String, Object>> fetchAllPages(String url, String accessToken) {
        List<Map<String, Object>> allValues = new ArrayList<>();
        String currentUrl = url;

        while (currentUrl != null) {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response =
                    restTemplate.exchange(currentUrl, HttpMethod.GET, entity, Map.class);

            Map<String, Object> body = response.getBody();
            if (body == null) break;

            Object value = body.get("value");
            if (value instanceof List) {
                allValues.addAll((List<Map<String, Object>>) value);
            }

            Object nextLink = body.get("@odata.nextLink");
            currentUrl = (nextLink instanceof String) ? (String) nextLink : null;
        }

        return allValues;
    }

    /** Represents a Microsoft Graph app role assignment. */
    public static class AppRoleAssignment {
        private final String appRoleId;
        private final String resourceId;

        public AppRoleAssignment(String appRoleId, String resourceId) {
            this.appRoleId = appRoleId;
            this.resourceId = resourceId;
        }

        public String getAppRoleId() {
            return appRoleId;
        }

        public String getResourceId() {
            return resourceId;
        }
    }
}
