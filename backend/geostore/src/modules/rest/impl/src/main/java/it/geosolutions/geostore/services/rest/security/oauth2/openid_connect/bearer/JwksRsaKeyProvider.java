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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Configuration;
import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.client.RestTemplate;

import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fetches and caches RSA public keys from a JWKS (JSON Web Key Set) endpoint. Used to verify JWT
 * signatures on bearer tokens in the OIDC flow.
 */
public class JwksRsaKeyProvider {

    private static final Logger LOGGER = LogManager.getLogger(JwksRsaKeyProvider.class);

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final String jwksUri;
    private final RestTemplate restTemplate;
    private final Map<String, RSAPublicKey> keyCache = new ConcurrentHashMap<>();

    public JwksRsaKeyProvider(String jwksUri, OAuth2Configuration configuration) {
        this.jwksUri = jwksUri;
        this.restTemplate = OAuth2Utils.protectedRestTemplate(configuration);
    }

    /**
     * Gets the RSA public key for the given key ID. Looks up the cache first; on a miss, refreshes
     * from the JWKS endpoint once.
     *
     * @param kid the key ID from the JWT header (may be null)
     * @return the matching RSAPublicKey, or null if not found
     */
    public RSAPublicKey getKey(String kid) {
        RSAPublicKey key = keyCache.get(kid != null ? kid : "");
        if (key != null) {
            return key;
        }
        // Cache miss — refresh keys from the endpoint and try again
        synchronized (this) {
            // Double-check after acquiring the lock
            key = keyCache.get(kid != null ? kid : "");
            if (key != null) {
                return key;
            }
            refreshKeys();
        }
        return keyCache.get(kid != null ? kid : "");
    }

    /** Fetches the JWKS JSON from the configured endpoint and parses RSA public keys. */
    synchronized void refreshKeys() {
        try {
            LOGGER.debug("Fetching JWKS from {}", jwksUri);
            String jwksJson = restTemplate.getForObject(jwksUri, String.class);
            if (jwksJson == null || jwksJson.isEmpty()) {
                LOGGER.warn("Empty response from JWKS endpoint: {}", jwksUri);
                return;
            }

            JsonNode jwks = OBJECT_MAPPER.readTree(jwksJson);
            JsonNode keys = jwks.path("keys");
            if (!keys.isArray()) {
                LOGGER.warn("No 'keys' array in JWKS response from {}", jwksUri);
                return;
            }

            Map<String, RSAPublicKey> newKeys = new ConcurrentHashMap<>();
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");

            for (JsonNode jwk : keys) {
                String kty = jwk.path("kty").asText();
                String use = jwk.path("use").asText("sig");
                if (!"RSA".equals(kty) || !"sig".equals(use)) {
                    continue;
                }

                String kid = jwk.path("kid").asText();
                String n = jwk.path("n").asText();
                String e = jwk.path("e").asText();
                if (n.isBlank() || e.isBlank()) {
                    LOGGER.warn("JWKS key missing 'n' or 'e' field, kid={}", kid);
                    continue;
                }

                try {
                    Base64.Decoder decoder = Base64.getUrlDecoder();
                    BigInteger modulus = new BigInteger(1, decoder.decode(n));
                    BigInteger exponent = new BigInteger(1, decoder.decode(e));
                    RSAPublicKeySpec spec = new RSAPublicKeySpec(modulus, exponent);
                    RSAPublicKey publicKey = (RSAPublicKey) keyFactory.generatePublic(spec);
                    newKeys.put(kid, publicKey);
                } catch (Exception ex) {
                    LOGGER.warn("Failed to parse JWKS key with kid={}: {}", kid, ex.getMessage());
                }
            }

            keyCache.clear();
            keyCache.putAll(newKeys);
            LOGGER.debug("Loaded {} RSA keys from JWKS endpoint", newKeys.size());
        } catch (Exception e) {
            LOGGER.error("Failed to fetch or parse JWKS from {}: {}", jwksUri, e.getMessage(), e);
        }
    }
}
