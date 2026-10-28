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

import com.nimbusds.jose.JWEDecrypter;
import com.nimbusds.jose.crypto.ECDHDecrypter;
import com.nimbusds.jose.crypto.RSADecrypter;
import com.nimbusds.jwt.EncryptedJWT;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.IOException;
import java.security.PrivateKey;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.RSAPrivateKey;

/**
 * Detects and decrypts JWE (JSON Web Encryption) tokens. JWE tokens have 5 dot-separated parts
 * (header.encryptedKey.iv.ciphertext.tag) and require the relying party's private key for
 * decryption. After decryption, the inner content (a JWS token or plain claims JSON) is returned
 * for downstream processing by the existing JWS validation pipeline.
 */
public class JweTokenDecryptor {

    private static final Logger LOGGER = LogManager.getLogger(JweTokenDecryptor.class);

    private final PrivateKey privateKey;

    public JweTokenDecryptor(PrivateKey privateKey) {
        if (privateKey == null) {
            throw new IllegalArgumentException("Private key must not be null");
        }
        this.privateKey = privateKey;
    }

    /**
     * Checks whether the given token string is a JWE token (5 dot-separated parts).
     *
     * @param token the token string to check
     * @return true if the token has 5 dot-separated parts (JWE format)
     */
    public static boolean isJweToken(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        int dotCount = 0;
        for (int i = 0; i < token.length(); i++) {
            if (token.charAt(i) == '.') {
                dotCount++;
                if (dotCount > 4) {
                    return false;
                }
            }
        }
        return dotCount == 4;
    }

    /**
     * Decrypts a JWE token and returns the inner content. If the inner payload is itself a JWS (3
     * dot-separated parts), it is returned as-is for downstream signature verification. If the
     * payload is plain claims JSON, it is returned directly.
     *
     * @param jweToken the JWE token string (5 dot-separated parts)
     * @return the decrypted inner content (JWS string or claims JSON)
     * @throws IOException if decryption fails
     */
    public String decrypt(String jweToken) throws IOException {
        try {
            EncryptedJWT encryptedJWT = EncryptedJWT.parse(jweToken);

            JWEDecrypter decrypter = createDecrypter();
            encryptedJWT.decrypt(decrypter);

            // The payload may be a nested JWS (signed JWT inside JWE) or plain claims
            String payload = encryptedJWT.getPayload().toString();

            LOGGER.debug("Successfully decrypted JWE token");
            return payload;
        } catch (IOException e) {
            throw e;
        } catch (Exception e) {
            LOGGER.error("Failed to decrypt JWE token: {}", e.getMessage());
            throw new IOException("JWE token decryption failed", e);
        }
    }

    private JWEDecrypter createDecrypter() throws IOException {
        try {
            if (privateKey instanceof RSAPrivateKey) {
                return new RSADecrypter((RSAPrivateKey) privateKey);
            } else if (privateKey instanceof ECPrivateKey) {
                return new ECDHDecrypter((ECPrivateKey) privateKey);
            } else {
                throw new IOException(
                        "Unsupported private key type for JWE decryption: "
                                + privateKey.getAlgorithm());
            }
        } catch (IOException e) {
            throw e;
        } catch (Exception e) {
            throw new IOException("Failed to create JWE decrypter", e);
        }
    }
}
