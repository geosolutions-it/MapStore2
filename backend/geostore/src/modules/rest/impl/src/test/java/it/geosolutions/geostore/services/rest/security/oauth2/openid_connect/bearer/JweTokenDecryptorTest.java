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

import static org.junit.jupiter.api.Assertions.*;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.ECDHEncrypter;
import com.nimbusds.jose.crypto.RSAEncrypter;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.EncryptedJWT;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.ECGenParameterSpec;
import java.util.Date;

public class JweTokenDecryptorTest {

    private static RSAPublicKey rsaPublicKey;
    private static RSAPrivateKey rsaPrivateKey;
    private static RSAPublicKey wrongPublicKey;
    private static RSAPrivateKey wrongPrivateKey;
    private static ECPublicKey ecPublicKey;
    private static ECPrivateKey ecPrivateKey;

    @BeforeAll
    static void setUp() throws Exception {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(2048);

        KeyPair keyPair = keyGen.generateKeyPair();
        rsaPublicKey = (RSAPublicKey) keyPair.getPublic();
        rsaPrivateKey = (RSAPrivateKey) keyPair.getPrivate();

        KeyPair wrongKeyPair = keyGen.generateKeyPair();
        wrongPublicKey = (RSAPublicKey) wrongKeyPair.getPublic();
        wrongPrivateKey = (RSAPrivateKey) wrongKeyPair.getPrivate();

        KeyPairGenerator ecKeyGen = KeyPairGenerator.getInstance("EC");
        ecKeyGen.initialize(new ECGenParameterSpec("secp256r1"));
        KeyPair ecKeyPair = ecKeyGen.generateKeyPair();
        ecPublicKey = (ECPublicKey) ecKeyPair.getPublic();
        ecPrivateKey = (ECPrivateKey) ecKeyPair.getPrivate();
    }

    @Test
    public void testIsJweToken() {
        // JWE tokens have 5 dot-separated parts
        assertTrue(JweTokenDecryptor.isJweToken("a.b.c.d.e"));
        assertTrue(JweTokenDecryptor.isJweToken("header.key.iv.ciphertext.tag"));

        // JWS tokens have 3 dot-separated parts
        assertFalse(JweTokenDecryptor.isJweToken("a.b.c"));
        assertFalse(JweTokenDecryptor.isJweToken("header.payload.signature"));

        // Other cases
        assertFalse(JweTokenDecryptor.isJweToken("no-dots-here"));
        assertFalse(JweTokenDecryptor.isJweToken("a.b"));
        assertFalse(JweTokenDecryptor.isJweToken("a.b.c.d"));
        assertFalse(JweTokenDecryptor.isJweToken("a.b.c.d.e.f"));
        assertFalse(JweTokenDecryptor.isJweToken(""));
        assertFalse(JweTokenDecryptor.isJweToken(null));
    }

    @Test
    public void testDecryptRsaOaep() throws Exception {
        // Create a plain JWT, encrypt it with RSA-OAEP + A256GCM
        JWTClaimsSet claims =
                new JWTClaimsSet.Builder()
                        .subject("test-user")
                        .issuer("https://test.issuer/")
                        .audience("test-client")
                        .claim("email", "user@example.com")
                        .expirationTime(new Date(System.currentTimeMillis() + 3600_000))
                        .build();

        JWEHeader header =
                new JWEHeader.Builder(JWEAlgorithm.RSA_OAEP_256, EncryptionMethod.A256GCM).build();
        EncryptedJWT encryptedJWT = new EncryptedJWT(header, claims);
        encryptedJWT.encrypt(new RSAEncrypter(rsaPublicKey));
        String jweToken = encryptedJWT.serialize();

        // Verify it's detected as JWE
        assertTrue(JweTokenDecryptor.isJweToken(jweToken));

        // Decrypt and verify inner claims
        JweTokenDecryptor decryptor = new JweTokenDecryptor(rsaPrivateKey);
        String decrypted = decryptor.decrypt(jweToken);
        assertNotNull(decrypted);
        assertTrue(decrypted.contains("test-user"));
        assertTrue(decrypted.contains("user@example.com"));
    }

    @Test
    public void testDecryptNestedJws() throws Exception {
        // Create a signed JWT (JWS)
        JWTClaimsSet claims =
                new JWTClaimsSet.Builder()
                        .subject("nested-user")
                        .issuer("https://test.issuer/")
                        .audience("test-client")
                        .claim("email", "nested@example.com")
                        .expirationTime(new Date(System.currentTimeMillis() + 3600_000))
                        .build();

        SignedJWT signedJWT =
                new SignedJWT(
                        new JWSHeader.Builder(JWSAlgorithm.RS256).keyID("test-kid").build(),
                        claims);
        signedJWT.sign(new RSASSASigner(rsaPrivateKey));
        String jwsToken = signedJWT.serialize();

        // Wrap the signed JWT inside a JWE (nested JWS inside JWE)
        JWEHeader jweHeader =
                new JWEHeader.Builder(JWEAlgorithm.RSA_OAEP_256, EncryptionMethod.A256GCM)
                        .contentType("JWT")
                        .build();
        JWEObject jweObject = new JWEObject(jweHeader, new Payload(signedJWT));
        jweObject.encrypt(new RSAEncrypter(rsaPublicKey));
        String nestedJweToken = jweObject.serialize();

        // Verify it's detected as JWE
        assertTrue(JweTokenDecryptor.isJweToken(nestedJweToken));

        // Decrypt — should return the inner JWS token string
        JweTokenDecryptor decryptor = new JweTokenDecryptor(rsaPrivateKey);
        String decrypted = decryptor.decrypt(nestedJweToken);
        assertNotNull(decrypted);

        // The decrypted content should be parseable as a signed JWT (3-part)
        assertFalse(JweTokenDecryptor.isJweToken(decrypted));
        String[] parts = decrypted.split("\\.");
        assertEquals(3, parts.length, "Nested JWS should have 3 parts after decryption");
    }

    @Test
    public void testDecryptJweWithEcKey() throws Exception {
        // Create a plain JWT, encrypt with ECDH-ES+A256KW + A256GCM using EC P-256 key
        JWTClaimsSet claims =
                new JWTClaimsSet.Builder()
                        .subject("ec-user")
                        .issuer("https://test.issuer/")
                        .audience("test-client")
                        .claim("email", "ecuser@example.com")
                        .expirationTime(new Date(System.currentTimeMillis() + 3600_000))
                        .build();

        JWEHeader header =
                new JWEHeader.Builder(JWEAlgorithm.ECDH_ES_A256KW, EncryptionMethod.A256GCM)
                        .build();
        EncryptedJWT encryptedJWT = new EncryptedJWT(header, claims);
        encryptedJWT.encrypt(new ECDHEncrypter(ecPublicKey));
        String jweToken = encryptedJWT.serialize();

        assertTrue(JweTokenDecryptor.isJweToken(jweToken));

        // Decrypt with EC private key
        JweTokenDecryptor decryptor = new JweTokenDecryptor(ecPrivateKey);
        String decrypted = decryptor.decrypt(jweToken);
        assertNotNull(decrypted);
        assertTrue(decrypted.contains("ec-user"));
        assertTrue(decrypted.contains("ecuser@example.com"));
    }

    @Test
    public void testDecryptWithWrongKey() throws Exception {
        // Encrypt with one key pair
        JWTClaimsSet claims =
                new JWTClaimsSet.Builder()
                        .subject("wrong-key-user")
                        .expirationTime(new Date(System.currentTimeMillis() + 3600_000))
                        .build();

        JWEHeader header =
                new JWEHeader.Builder(JWEAlgorithm.RSA_OAEP_256, EncryptionMethod.A256GCM).build();
        EncryptedJWT encryptedJWT = new EncryptedJWT(header, claims);
        encryptedJWT.encrypt(new RSAEncrypter(rsaPublicKey));
        String jweToken = encryptedJWT.serialize();

        // Attempt to decrypt with a different private key — should throw
        JweTokenDecryptor decryptor = new JweTokenDecryptor(wrongPrivateKey);
        assertThrows(IOException.class, () -> decryptor.decrypt(jweToken));
    }

    @Test
    public void testNullAndEmpty() {
        assertFalse(JweTokenDecryptor.isJweToken(null));
        assertFalse(JweTokenDecryptor.isJweToken(""));
        assertFalse(JweTokenDecryptor.isJweToken("   "));

        assertThrows(
                IllegalArgumentException.class,
                () -> new JweTokenDecryptor(null),
                "Constructor should reject null private key");
    }

    @Test
    public void testDecryptInvalidToken() {
        JweTokenDecryptor decryptor = new JweTokenDecryptor(rsaPrivateKey);
        assertThrows(
                IOException.class,
                () -> decryptor.decrypt("not.a.valid.jwe.token"),
                "Should throw IOException for invalid JWE token");
    }
}
