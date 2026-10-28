package it.geosolutions.geostore.core.security.password;

/*
 *  Copyright (C) 2007 - 2011 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import static it.geosolutions.geostore.core.security.password.SecurityUtils.scramble;
import static it.geosolutions.geostore.core.security.password.SecurityUtils.toBytes;
import static it.geosolutions.geostore.core.security.password.SecurityUtils.toChars;

import org.jasypt.encryption.pbe.StandardPBEByteEncryptor;
import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;

import java.io.IOException;
import java.util.Arrays;
import java.util.Base64;

/**
 * Password Encoder using symmetric encryption
 *
 * <p>The salt parameter is not used, this implementation computes a random salt as default.
 *
 * <p>{@link #isPasswordValid(String, String, Object)} {@link #encodePassword(String, Object)}
 *
 * @author Lorenzo Natali
 */
public class GeoStorePBEPasswordEncoder extends AbstractGeoStorePasswordEncoder {

    StandardPBEStringEncryptor stringEncrypter;
    StandardPBEByteEncryptor byteEncrypter;

    private String providerName, algorithm;
    private String keyAliasInKeyStore = KeyStoreProviderImpl.CONFIG_ENCRYPTION_KEY_ALIAS;

    private KeyStoreProvider keystoreProvider;

    public KeyStoreProvider getKeystoreProvider() {
        return keystoreProvider;
    }

    public void setKeystoreProvider(KeyStoreProvider keystoreProvider) {
        this.keystoreProvider = keystoreProvider;
    }

    public void setKeyAliasInKeyStore(String keyAliasInKeyStore) {
        this.keyAliasInKeyStore = keyAliasInKeyStore;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }

    public String getKeyAliasInKeyStore() {
        return keyAliasInKeyStore;
    }

    @Override
    protected InternalPasswordEncoder createStringEncoder() {
        byte[] password = lookupPasswordFromKeyStore();

        char[] chars = toChars(password);
        try {
            stringEncrypter = new StandardPBEStringEncryptor();
            stringEncrypter.setPasswordCharArray(chars);

            if (getProviderName() != null && !getProviderName().isEmpty()) {
                stringEncrypter.setProviderName(getProviderName());
            }
            stringEncrypter.setAlgorithm(getAlgorithm());

            // Wrap the Jasypt PBE encryptor directly — same wire format as the legacy
            // org.jasypt.acegisecurity.PBEPasswordEncoder adapter we replaced.
            final StandardPBEStringEncryptor enc = stringEncrypter;
            return new InternalPasswordEncoder() {
                @Override
                public String encodePassword(String rawPass, Object salt) {
                    return enc.encrypt(rawPass);
                }

                @Override
                public boolean isPasswordValid(String encPass, String rawPass, Object salt) {
                    try {
                        return enc.decrypt(encPass).equals(rawPass);
                    } catch (RuntimeException e) {
                        return false;
                    }
                }
            };
        } finally {
            scramble(password);
            scramble(chars);
        }
    }

    @Override
    protected CharArrayPasswordEncoder createCharEncoder() {
        byte[] password = lookupPasswordFromKeyStore();
        char[] chars = toChars(password);

        byteEncrypter = new StandardPBEByteEncryptor();
        byteEncrypter.setPasswordCharArray(chars);

        if (getProviderName() != null && !getProviderName().isEmpty()) {
            byteEncrypter.setProviderName(getProviderName());
        }
        byteEncrypter.setAlgorithm(getAlgorithm());

        return new CharArrayPasswordEncoder() {
            @Override
            public boolean isPasswordValid(String encPass, char[] rawPass, Object salt) {
                byte[] decoded = Base64.getDecoder().decode(encPass.getBytes());
                byte[] decrypted = byteEncrypter.decrypt(decoded);

                char[] chars = toChars(decrypted);
                try {
                    return Arrays.equals(chars, rawPass);
                } finally {
                    scramble(decrypted);
                    scramble(chars);
                }
            }

            @Override
            public String encodePassword(char[] rawPass, Object salt) {
                byte[] bytes = toBytes(rawPass);
                try {
                    return new String(Base64.getEncoder().encode(byteEncrypter.encrypt(bytes)));
                } finally {
                    scramble(bytes);
                }
            }
        };
    }

    byte[] lookupPasswordFromKeyStore() {
        try {
            if (!keystoreProvider.containsAlias(getKeyAliasInKeyStore())) {
                throw new RuntimeException(
                        "Keystore: "
                                + keystoreProvider.getFile()
                                + " does not"
                                + " contain alias: "
                                + getKeyAliasInKeyStore());
            }
            return keystoreProvider.getSecretKey(getKeyAliasInKeyStore()).getEncoded();
        } catch (IOException e) {
            throw new RuntimeException(
                    "Cannot find alias: "
                            + getKeyAliasInKeyStore()
                            + " in "
                            + keystoreProvider.getFile().getAbsolutePath());
        }
    }

    @Override
    public PasswordEncodingType getEncodingType() {
        return PasswordEncodingType.ENCRYPT;
    }

    public String decode(String encPass) throws UnsupportedOperationException {
        if (stringEncrypter == null) {
            // not initialized
            getStringEncoder();
        }

        return stringEncrypter.decrypt(removePrefix(encPass));
    }

    @Override
    public char[] decodeToCharArray(String encPass) throws UnsupportedOperationException {
        if (byteEncrypter == null) {
            // not initialized
            getCharEncoder();
        }

        byte[] decoded = Base64.getDecoder().decode(removePrefix(encPass).getBytes());
        byte[] bytes = byteEncrypter.decrypt(decoded);
        try {
            return toChars(bytes);
        } finally {
            scramble(bytes);
        }
    }
}
