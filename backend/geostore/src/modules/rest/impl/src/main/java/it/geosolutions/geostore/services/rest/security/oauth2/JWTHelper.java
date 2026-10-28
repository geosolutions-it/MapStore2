/* ====================================================================
 *
 * Copyright (C) 2022 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.security.oauth2;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.Base64;
import java.util.Collection;
import java.util.List;
import java.util.Map;

/** A class holding utilities method for handling JWT tokens. */
public class JWTHelper {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final DecodedJWT decodedJWT;
    private volatile Map<String, Object> payloadMap;

    public JWTHelper(String jwtToken) {
        this.decodedJWT = JWT.decode(jwtToken);
    }

    /**
     * Get a claim by name from the idToken. Supports dot-notation and full JsonPath expressions for
     * nested claims (e.g. "realm_access.roles", "$.resource_access.*.roles").
     *
     * @param claimName the name of the claim to retrieve, may use dot-notation or JsonPath.
     * @param binding the Class to which convert the claim value.
     * @param <T> the type of the claim value.
     * @return the claim value.
     */
    @SuppressWarnings("unchecked")
    public <T> T getClaim(String claimName, Class<T> binding) {
        if (decodedJWT == null || claimName == null) return null;

        // For path expressions (dot-notation or JsonPath), use ClaimPathResolver
        if (claimName.contains(".") || claimName.startsWith("$")) {
            Object resolved = ClaimPathResolver.resolve(getPayloadAsMap(), claimName);
            if (resolved == null) return null;
            if (binding.isInstance(resolved)) return (T) resolved;
            if (binding == String.class) return (T) String.valueOf(resolved);
            return null;
        }

        Claim claim = decodedJWT.getClaim(claimName);
        if (nonNullClaim(claim)) return claim.as(binding);
        return null;
    }

    /**
     * Get a claim values as List by its name. Supports dot-notation and full JsonPath expressions
     * for nested claims (e.g. "realm_access.roles", "$.resource_access.*.roles").
     *
     * @param claimName the name of the claim to retrieve, may use dot-notation or JsonPath.
     * @param binding the Class to which convert the claim value.
     * @param <T> the type of the claim value.
     * @return the claim value.
     */
    @SuppressWarnings("unchecked")
    public <T> List<T> getClaimAsList(String claimName, Class<T> binding) {
        if (decodedJWT == null || claimName == null) return null;

        // For path expressions (dot-notation or JsonPath), use ClaimPathResolver
        if (claimName.contains(".") || claimName.startsWith("$")) {
            List<String> resolved = ClaimPathResolver.resolveAsList(getPayloadAsMap(), claimName);
            if (resolved == null) return null;
            if (binding == String.class) return (List<T>) resolved;
            return extractListFromValue(resolved, binding);
        }

        Claim claim = decodedJWT.getClaim(claimName);
        if (nonNullClaim(claim)) {
            List<T> result = claim.asList(binding);
            if (result == null) {
                result = new ArrayList<>();
                T singleValue = claim.as(binding);
                if (singleValue != null) result.add(singleValue);
            }
            return result;
        }
        return null;
    }

    /**
     * Lazily decodes the JWT payload into a Map. The payload is Base64URL-decoded and parsed via
     * Jackson.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getPayloadAsMap() {
        if (payloadMap == null) {
            synchronized (this) {
                if (payloadMap == null) {
                    try {
                        String payload = decodedJWT.getPayload();
                        byte[] decoded = Base64.getUrlDecoder().decode(payload);
                        payloadMap =
                                OBJECT_MAPPER.readValue(
                                        decoded, new TypeReference<Map<String, Object>>() {});
                    } catch (Exception e) {
                        payloadMap = java.util.Collections.emptyMap();
                    }
                }
            }
        }
        return payloadMap;
    }

    /** Extracts a List from a value that may be a List, a Collection, or a single value. */
    @SuppressWarnings("unchecked")
    private <T> List<T> extractListFromValue(Object value, Class<T> binding) {
        if (value == null) return null;
        if (value instanceof List) {
            List<?> raw = (List<?>) value;
            List<T> result = new ArrayList<>(raw.size());
            for (Object item : raw) {
                if (binding.isInstance(item)) {
                    result.add((T) item);
                } else if (binding == String.class && item != null) {
                    result.add((T) String.valueOf(item));
                }
            }
            return result;
        }
        if (value instanceof Collection) {
            return extractListFromValue(new ArrayList<>((Collection<?>) value), binding);
        }
        // Single value -> wrap in list
        List<T> result = new ArrayList<>(1);
        if (binding.isInstance(value)) {
            result.add((T) value);
        } else if (binding == String.class && value != null) {
            result.add((T) String.valueOf(value));
        }
        return result.isEmpty() ? null : result;
    }

    private boolean nonNullClaim(Claim claim) {
        // java-jwt 4.x removed the public NullClaim sentinel used by 3.x to signal an absent claim.
        // In 4.x getClaim() never returns Java null; an absent claim reports isMissing(), and a
        // claim present with a JSON null value reports isNull(). The 3.x NullClaim covered both
        // cases, so the faithful equivalent excludes both.
        return claim != null && !claim.isMissing() && !claim.isNull();
    }
}
