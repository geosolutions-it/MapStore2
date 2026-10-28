/* ====================================================================
 *
 * Copyright (C) 2024-2025 GeoSolutions S.A.S.
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

import com.jayway.jsonpath.Configuration;
import com.jayway.jsonpath.JsonPath;
import com.jayway.jsonpath.Option;
import com.jayway.jsonpath.PathNotFoundException;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Utility class for resolving claim values from Maps using Jayway JsonPath. Supports both legacy
 * dot-notation paths (e.g. {@code realm_access.roles}) and full JsonPath expressions (e.g. {@code
 * $.realm_access.roles}, {@code $.resource_access.*.roles}).
 *
 * <p>Legacy dot-notation paths are automatically converted to JsonPath by prepending {@code $.}.
 * Paths that already start with {@code $} are passed through as-is.
 */
public final class ClaimPathResolver {

    private static final Configuration JSON_PATH_CONFIG =
            Configuration.defaultConfiguration()
                    .addOptions(Option.SUPPRESS_EXCEPTIONS, Option.DEFAULT_PATH_LEAF_TO_NULL);

    private ClaimPathResolver() {}

    /**
     * Converts a claim path to a JsonPath expression. Paths starting with {@code $} are returned
     * as-is; otherwise {@code $.} is prepended to treat them as dot-notation.
     */
    public static String toJsonPath(String path) {
        if (path == null) return null;
        if (path.startsWith("$")) return path;
        return "$." + path;
    }

    /**
     * Resolves a claim path against a Map document.
     *
     * @param document the claims map (e.g. JWT payload or userinfo response)
     * @param path the claim path (dot-notation or JsonPath)
     * @return the resolved value, or {@code null} if not found
     */
    public static Object resolve(Map<String, Object> document, String path) {
        if (document == null || path == null || path.isEmpty()) return null;
        String jsonPath = toJsonPath(path);
        try {
            return JsonPath.using(JSON_PATH_CONFIG).parse(document).read(jsonPath);
        } catch (PathNotFoundException e) {
            return null;
        }
    }

    /**
     * Resolves a claim path and coerces the result to a list of strings.
     *
     * @param document the claims map
     * @param path the claim path (dot-notation or JsonPath)
     * @return the resolved value as a list of strings, or {@code null} if not found
     */
    public static List<String> resolveAsList(Map<String, Object> document, String path) {
        Object value = resolve(document, path);
        return toStringList(value);
    }

    /**
     * Case-insensitive variant of {@link #resolve}. Recursively lowercases all map keys before
     * resolving, and lowercases the path for matching.
     *
     * @param document the claims map
     * @param path the claim path (dot-notation or JsonPath)
     * @return the resolved value, or {@code null} if not found
     */
    public static Object resolveIgnoreCase(Map<String, Object> document, String path) {
        if (document == null || path == null || path.isEmpty()) return null;
        Map<String, Object> lowered = lowercaseKeys(document);
        String loweredPath = lowercasePath(path);
        return resolve(lowered, loweredPath);
    }

    /**
     * Case-insensitive variant of {@link #resolveAsList}.
     *
     * @param document the claims map
     * @param path the claim path (dot-notation or JsonPath)
     * @return the resolved value as a list of strings, or {@code null} if not found
     */
    public static List<String> resolveAsListIgnoreCase(Map<String, Object> document, String path) {
        Object value = resolveIgnoreCase(document, path);
        return toStringList(value);
    }

    /** Converts a value (single, List, Collection) to a List of Strings. */
    @SuppressWarnings("unchecked")
    static List<String> toStringList(Object value) {
        if (value == null) return null;
        if (value instanceof List) {
            List<?> raw = (List<?>) value;
            if (raw.isEmpty()) return new ArrayList<>();
            List<String> result = new ArrayList<>(raw.size());
            for (Object item : raw) {
                if (item instanceof List) {
                    // Flatten nested lists (e.g. from wildcard queries)
                    for (Object nested : (List<?>) item) {
                        if (nested != null) result.add(String.valueOf(nested));
                    }
                } else if (item != null) {
                    result.add(String.valueOf(item));
                }
            }
            return result.isEmpty() ? null : result;
        }
        if (value instanceof Collection) {
            return toStringList(new ArrayList<>((Collection<?>) value));
        }
        // Single value -> wrap in list
        List<String> result = new ArrayList<>(1);
        result.add(String.valueOf(value));
        return result;
    }

    /** Recursively lowercases all map keys. */
    @SuppressWarnings("unchecked")
    private static Map<String, Object> lowercaseKeys(Map<String, Object> map) {
        Map<String, Object> result = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            String key = entry.getKey().toLowerCase(Locale.ROOT);
            Object val = entry.getValue();
            if (val instanceof Map) {
                val = lowercaseKeys((Map<String, Object>) val);
            }
            result.put(key, val);
        }
        return result;
    }

    /** Lowercases the path segments (not JsonPath operators). */
    private static String lowercasePath(String path) {
        if (path == null) return null;
        // For JsonPath expressions, lowercase the field names but preserve operators
        // Simple approach: lowercase the entire path, which works for dot-notation and
        // simple JsonPath. JsonPath operators ($, ., *, [, ]) are unaffected by lowercase.
        return path.toLowerCase(Locale.ROOT);
    }
}
