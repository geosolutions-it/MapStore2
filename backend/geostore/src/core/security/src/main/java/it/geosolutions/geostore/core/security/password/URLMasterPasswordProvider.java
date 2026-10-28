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
package it.geosolutions.geostore.core.security.password;

import static it.geosolutions.geostore.core.security.password.SecurityUtils.scramble;
import static it.geosolutions.geostore.core.security.password.SecurityUtils.toBytes;
import static it.geosolutions.geostore.core.security.password.SecurityUtils.toChars;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.IOUtils;
import org.jasypt.encryption.pbe.StandardPBEByteEncryptor;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;

/**
 * Master password provider that retrieves and optionally stores the master password from a url.
 *
 * @author Lorenzo Natali (lorenzo.natali at geo-solutions.it)
 */
public final class URLMasterPasswordProvider implements MasterPasswordProvider {

    private URL URL;
    private String configDirPath = ".";

    public void setEncrypting(boolean encrypting) {
        this.encrypting = encrypting;
    }

    private boolean encrypting = true;

    static final char[] BASE =
            new char[] {
                'U', 'n', '6', 'd', 'I', 'l', 'X', 'T', 'Q', 'c', 'L', ')', '$', '#', 'q', 'J', 'U',
                'l', 'X', 'Q', 'U', '!', 'n', 'n', 'p', '%', 'U', 'r', '5', 'U', 'u', '3', '5', 'H',
                '`', 'x', 'P', 'F', 'r', 'X'
            };
    static final int[] PERM =
            new int[] {
                32, 19, 30, 11, 34, 26, 3, 21, 9, 37, 38, 13, 23, 2, 18, 4, 20, 1, 29, 17, 0, 31,
                14, 36, 12, 24, 15, 35, 16, 39, 25, 5, 10, 8, 7, 6, 33, 27, 28, 22
            };

    /**
     * Encode the password
     *
     * @param passwd
     * @return
     */
    byte[] encode(char[] passwd) {

        if (!isEncrypting()) {
            return toBytes(passwd);
        }

        // encrypt the password
        StandardPBEByteEncryptor encryptor = new StandardPBEByteEncryptor();

        char[] key = key();
        try {
            encryptor.setPasswordCharArray(key);
            return Base64.encodeBase64(encryptor.encrypt(toBytes(passwd)));
        } finally {
            scramble(key);
        }
    }

    /**
     * Decode the password
     *
     * @param passwd
     * @return
     */
    byte[] decode(byte[] passwd) {
        if (!isEncrypting()) {
            return passwd;
        }

        // decrypt the password
        StandardPBEByteEncryptor encryptor = new StandardPBEByteEncryptor();
        char[] key = key();
        try {
            encryptor.setPasswordCharArray(key);
            return encryptor.decrypt(Base64.decodeBase64(passwd));
        } finally {
            scramble(key);
        }
    }

    /**
     * Generate the key for permutation
     *
     * @return
     */
    char[] key() {
        // generate the key
        return SecurityUtils.permute(BASE, 32, PERM);
    }

    /** Gets the Master Password */
    @Override
    public char[] doGetMasterPassword() throws Exception {
        try {
            InputStream in = input(getURL(), getConfigDir());
            try {

                return toChars(decode(IOUtils.toByteArray(in)));
            } finally {
                in.close();
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void doSetMasterPassword(char[] passwd) throws Exception {
        OutputStream out = output(getURL(), getConfigDir());
        try {
            out.write(encode(passwd));
        } finally {
            out.close();
        }
    }

    File getConfigDir() throws IOException {
        return new File(configDirPath);
    }

    /**
     * Writes the master password in the file
     *
     * @param url
     * @param configDir
     * @return
     * @throws IOException
     */
    static OutputStream output(URL url, File configDir) throws IOException {
        // check for file URL
        if ("file".equalsIgnoreCase(url.getProtocol())) {
            File f;
            try {
                f = new File(url.toURI());
            } catch (URISyntaxException e) {
                f = new File(url.getPath());
            }
            if (!f.isAbsolute()) {
                // make relative to config dir
                f = new File(configDir, f.getPath());
            }
            return new FileOutputStream(f);
        } else {
            URLConnection cx = url.openConnection();
            cx.setDoOutput(true);
            return cx.getOutputStream();
        }
    }

    static InputStream input(URL url, File configDir) throws IOException {
        // check for a file url
        if (url == null) {
            // default master password
            url = URLMasterPasswordProvider.class.getClassLoader().getResource("passwd");
        }
        if ("file".equalsIgnoreCase(url.getProtocol())) {
            File f;
            try {
                f = new File(url.toURI());
            } catch (URISyntaxException e) {
                f = new File(url.getPath());
            }

            // check if the file is relative
            if (!f.isAbsolute()) {
                // make it relative to the config directory for this password provider
                f = new File(configDir, f.getPath());
            }
            return new FileInputStream(f);
        } else {
            return url.openStream();
        }
    }

    /**
     * @return the config dir path
     */
    public String getConfigDirPath() {
        return configDirPath;
    }

    /**
     * Set the config dir path
     *
     * @param path
     */
    public void setConfigDirPath(String path) {
        this.configDirPath = path;
    }

    /**
     * Set the URL of the master password file
     *
     * @return
     */
    public URL getURL() {
        // TODO Auto-generated method stub
        return URL;
    }

    /**
     * Set the URL of the master password file
     *
     * @param url url of the master password file
     */
    public void setURL(URL url) {
        // TODO Auto-generated method stub
        this.URL = url;
    }

    /**
     * is encrypting
     *
     * @return
     */
    private boolean isEncrypting() {
        return encrypting;
    }
}
