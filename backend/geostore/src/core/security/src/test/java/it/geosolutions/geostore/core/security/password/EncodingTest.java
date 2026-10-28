/*
 *  Copyright (C) 2007 - 2014 GeoSolutions S.A.S.
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

import junit.framework.TestCase;

import org.junit.Test;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import java.io.File;
import java.net.URL;

import javax.crypto.SecretKey;

/**
 * This Test unit test the various functionalities of the encoders.
 *
 * @author Lorenzo Natali (lorenzo.natali at geo-solutions.it)
 */
public class EncodingTest extends TestCase {
    private static final String TEST_KEYSTORE_FILE_NAME = "geostore.jceks";
    private ClassPathXmlApplicationContext context;
    private char[] passwd;

    @Override
    protected void setUp() throws Exception {
        super.setUp();
        String[] paths = {"classpath*:encoders-context-test.xml"};
        context = new ClassPathXmlApplicationContext(paths);
        URL url = this.getClass().getResource("/geostore.jceks");
        File f = new File(url.toURI());

        // plain text master password
        URL passFile = this.getClass().getResource("/passwd-test");
        URLMasterPasswordProvider pp = new URLMasterPasswordProvider();
        pp.setEncrypting(false);
        pp.setURL(passFile);
        passwd = pp.doGetMasterPassword();
        if (f.exists()) {
            KeyStoreProviderImpl ksp = (KeyStoreProviderImpl) context.getBean("keyStoreProvider");
            ksp.setKeyStoreFilePath(f.getAbsolutePath());
            ksp.setMasterPassword(passwd);
        }
    }

    @Test
    public void testPbe() throws Exception {
        GeoStorePBEPasswordEncoder pbePasswordEncoder =
                (GeoStorePBEPasswordEncoder) context.getBean("pbePasswordEncoder");
        KeyStoreProviderImpl p = (KeyStoreProviderImpl) context.getBean("keyStoreProvider");
        assertTrue(p.isKeyStorePassword(passwd));
        performPbeTest(pbePasswordEncoder);

        // crypt master password
        URLMasterPasswordProvider pp = new URLMasterPasswordProvider();
        pp.setEncrypting(true);
        URL pwenc = this.getClass().getResource("/passwd-test-enc");
        pp.setURL(pwenc);
        performPbeTest(pbePasswordEncoder);
    }

    private void performPbeTest(GeoStorePBEPasswordEncoder pbePasswordEncoder) {
        String testPassword = "testpassword";
        assertEquals(
                testPassword, pbePasswordEncoder.decode("crypt1:XPTERjaoupiG27xO5w/PdmrlcVDWOPVo"));
        String encoded = pbePasswordEncoder.encodePassword("testpassword", null);
        assertTrue(pbePasswordEncoder.isResponsibleForEncoding(encoded));
        assertEquals(testPassword, pbePasswordEncoder.decode(encoded));
        pbePasswordEncoder.isPasswordValid(encoded, testPassword, null);
    }

    @Test
    public void testDigest() throws Exception {
        GeoStoreDigestPasswordEncoder pe =
                (GeoStoreDigestPasswordEncoder) context.getBean("digestPasswordEncoder");
        String rawPass = "testPassword";
        String encPass = pe.encodePassword(rawPass, null);
        assertTrue(pe.isResponsibleForEncoding(encPass));
        assertTrue(pe.isPasswordValid(encPass, rawPass, null));
    }

    @Test
    public void testCreateKeyStore() throws Exception {
        File f = new File(EncodingTest.TEST_KEYSTORE_FILE_NAME);
        if (f.exists()) {
            System.out.println("delete previous keystore");
            f.delete();
        }
        char[] passwd = {'t', 'e', 's', 't', 'p', 'w'};
        char[] passwd2 = {'g', 'e', 'o', 's', 't', 'o', 'r', 'e'};
        String keyName = "ug:geostore:key";
        String keyName2 = "keyName2";
        KeyStoreProviderImpl ksp = new KeyStoreProviderImpl();
        ksp.setKeyStoreFilePath("testStore");
        ksp.setMasterPassword(passwd);
        ksp.setSecretKey(keyName, "testkey".toCharArray());
        ksp.setSecretKey(keyName2, "testkey2".toCharArray());
        SecretKey k = ksp.getSecretKey(keyName);

        assertTrue(ksp.containsAlias(keyName));
        assertTrue(ksp.containsAlias(keyName));
        ksp.removeKey(keyName2);
        assertFalse(ksp.containsAlias(keyName2));
        ksp = new KeyStoreProviderImpl();
        ksp.setMasterPassword(passwd2);
        ksp.setKeyStoreFilePath(EncodingTest.TEST_KEYSTORE_FILE_NAME);
        ksp.setSecretKey(
                keyName, new RandomPasswordProvider().getRandomPasswordWithDefaultLength());
        System.out.print(ksp.keyStoreFile.getAbsolutePath());
    }

    @Override
    protected void tearDown() throws Exception {
        // delete test key store
        File f = new File(EncodingTest.TEST_KEYSTORE_FILE_NAME);
        if (f.exists()) {
            f.delete();
        }
        super.tearDown();
    }
}
