package it.geosolutions.geostore.core.security.password;

import static it.geosolutions.geostore.core.security.password.SecurityUtils.toBytes;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.security.Key;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.cert.CertificateException;
import java.util.Enumeration;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

/**
 * Class for GeoStore specific key management
 *
 * <p><strong>requires a password</strong> form configuration
 *
 * <p>The type of the keystore is JCEKS and can be used/modified with java tools like "keytool" from
 * the command line. *
 *
 * @author Lorenzo Natali
 */
public class KeyStoreProviderImpl implements KeyStoreProvider {
    private static final Logger LOGGER = LogManager.getLogger(KeyStoreProviderImpl.class);

    public static final String CONFIG_ENCRYPTION_KEY_ALIAS = "ug:geostore:key";

    private static final String DEFAULT_FILE_NAME = "geostore.jceks";
    private static final String PREPARED_FILE_NAME = "geostore.jceks.new";
    private static final String USERGROUP_PREFIX = "ug:";
    private static final String USERGROUP_POSTFIX = ":key";
    private static final String KEYSTORETYPE = "JCEKS";

    protected File keyStoreFile;
    protected KeyStore ks;

    private String keyStoreFilePath = null;
    private char[] masterPassword;
    private MasterPasswordProvider masterPasswordProvider;

    public void setMasterPassword(char[] masterPassword) {
        this.masterPassword = masterPassword;
    }

    public void setMasterPasswordProvider(MasterPasswordProvider masterPasswordProvider) {
        this.masterPasswordProvider = masterPasswordProvider;
    }

    public KeyStoreProviderImpl() {}

    @Override
    public File getFile() {
        // retrieve the file on first access
        if (keyStoreFile == null) {
            // if the keyStoreFilePath is configured create it
            if (getKeyStoreFilePath() != null) {
                keyStoreFile = new File(getKeyStoreFilePath());
                if (!keyStoreFile.exists()) {
                    if (keyStoreFile.isDirectory()) {
                        keyStoreFile = new File(getKeyStoreFilePath() + DEFAULT_FILE_NAME);
                    }
                    LOGGER.warn("the keyStore file doesn't exist. configure a new one");
                }
                // if the file doesn't exist create a new one
                // TODO add a key
                // otherwise get the default one
            } else {
                URL defaultKeyStrore =
                        KeyStoreProviderImpl.class.getClassLoader().getResource(DEFAULT_FILE_NAME);
                try {
                    if (defaultKeyStrore != null) {
                        keyStoreFile = new File(defaultKeyStrore.toURI());
                    }
                } catch (URISyntaxException e) {
                    LOGGER.error("UNABLE TO GET THE DEFAULT KEY STORE");
                }
            }
        }

        return keyStoreFile;
    }

    public String getKeyStoreFilePath() {
        return keyStoreFilePath;
    }

    public void setKeyStoreFilePath(String keyStoreFilePath) {
        this.keyStoreFilePath = keyStoreFilePath;
    }

    @Override
    public void reloadKeyStore() throws IOException {
        ks = null;
        assertActivatedKeyStore();
    }

    @Override
    public Key getKey(String alias) throws IOException {
        assertActivatedKeyStore();
        try {
            char[] passwd = getMasterPassword();
            try {
                return ks.getKey(alias, passwd);
            } finally {
                disposePassword(passwd);
            }
        } catch (Exception e) {
            throw new IOException(e);
        }
    }

    private char[] getMasterPassword() {
        // TODO cifrate this password somehow
        if (masterPassword != null) {
            return masterPassword;
        } else {
            if (masterPasswordProvider != null) {
                try {
                    masterPassword = masterPasswordProvider.doGetMasterPassword();
                } catch (Exception e) {
                    LOGGER.error("Unable to read the master password", e);
                }
            }
        }
        return masterPassword;
    }

    public Enumeration<String> aliases() {
        if (ks != null)
            try {
                return ks.aliases();
            } catch (KeyStoreException e) {
                LOGGER.error("Failed to list keystore aliases", e);
                return null;
            }
        return null;
    }

    @Override
    public byte[] getConfigPasswordKey() throws IOException {
        SecretKey key = getSecretKey(CONFIG_ENCRYPTION_KEY_ALIAS);
        if (key == null) return null;
        return key.getEncoded();
    }

    @Override
    public boolean hasConfigPasswordKey() throws IOException {
        return containsAlias(CONFIG_ENCRYPTION_KEY_ALIAS);
    }

    @Override
    public boolean containsAlias(String alias) throws IOException {
        assertActivatedKeyStore();
        try {
            return ks.containsAlias(alias);
        } catch (KeyStoreException e) {
            throw new IOException(e);
        }
    }

    @Override
    public byte[] getUserGroupKey(String serviceName) throws IOException {
        SecretKey key = getSecretKey(aliasForGroupService(serviceName));
        if (key == null) return null;
        return key.getEncoded();
    }

    @Override
    public boolean hasUserGroupKey(String serviceName) throws IOException {
        return containsAlias(aliasForGroupService(serviceName));
    }

    @Override
    public SecretKey getSecretKey(String name) throws IOException {
        Key key = getKey(name);
        if (key == null) return null;
        if (!(key instanceof SecretKey)) throw new IOException("Invalid key type for: " + name);
        return (SecretKey) key;
    }

    @Override
    public PublicKey getPublicKey(String name) throws IOException {
        Key key = getKey(name);
        if (key == null) return null;
        if (!(key instanceof PublicKey)) throw new IOException("Invalid key type for: " + name);
        return (PublicKey) key;
    }

    @Override
    public PrivateKey getPrivateKey(String name) throws IOException {
        Key key = getKey(name);
        if (key == null) return null;
        if (!(key instanceof PrivateKey)) throw new IOException("Invalid key type for: " + name);
        return (PrivateKey) key;
    }

    @Override
    public String aliasForGroupService(String serviceName) {
        return USERGROUP_PREFIX + serviceName + USERGROUP_POSTFIX;
    }

    /**
     * Opens or creates a {@link KeyStore} using the file {@link #DEFAULT_FILE_NAME}
     *
     * <p>Throws an exception for an invalid master key
     *
     * @throws IOException
     */
    protected void assertActivatedKeyStore() throws IOException {
        if (ks != null) return;

        char[] passwd = getMasterPassword();
        try {
            ks = KeyStore.getInstance(KEYSTORETYPE);
            if (!getFile().exists()) { // create an empty one
                ks.load(null, passwd);
                addInitialKeys();
                try (FileOutputStream fos = new FileOutputStream(getFile())) {
                    ks.store(fos, passwd);
                }
            } else {
                try (FileInputStream fis = new FileInputStream(getFile())) {
                    ks.load(fis, passwd);
                }
            }
        } catch (KeyStoreException | NoSuchAlgorithmException | CertificateException ex) {
            throw new IOException(ex);
        } finally {
            disposePassword(passwd);
        }
    }

    private void disposePassword(char[] passwd) {
        // TODO implement it when security improved.
    }

    @Override
    public boolean isKeyStorePassword(char[] password) throws IOException {
        if (password == null) return false;
        assertActivatedKeyStore();

        KeyStore testStore;
        try {
            testStore = KeyStore.getInstance(KEYSTORETYPE);
        } catch (KeyStoreException e1) {
            // should not happen, see assertActivatedKeyStore
            throw new RuntimeException(e1);
        }
        try (FileInputStream fis = new FileInputStream(getFile())) {
            try {
                testStore.load(fis, password);
            } catch (IOException e2) {
                // indicates invalid password
                return false;
            } catch (Exception e) {
                // should not happen, see assertActivatedKeyStore
                throw new RuntimeException(e);
            }
        }
        return true;
    }

    @Override
    public void setSecretKey(String alias, char[] key) throws IOException {
        assertActivatedKeyStore();
        SecretKey mySecretKey = new SecretKeySpec(toBytes(key), "PBE");
        KeyStore.SecretKeyEntry skEntry = new KeyStore.SecretKeyEntry(mySecretKey);
        char[] passwd = getMasterPassword();
        try {
            ks.setEntry(alias, skEntry, new KeyStore.PasswordProtection(passwd));
        } catch (KeyStoreException e) {
            throw new IOException(e);
        } finally {
            disposePassword(passwd);
        }
    }

    @Override
    public void setUserGroupKey(String serviceName, char[] password) throws IOException {
        String alias = aliasForGroupService(serviceName);
        setSecretKey(alias, password);
    }

    @Override
    public void removeKey(String alias) throws IOException {
        assertActivatedKeyStore();
        try {
            ks.deleteEntry(alias);
        } catch (KeyStoreException e) {
            throw new IOException(e);
        }
    }

    @Override
    public void storeKeyStore() throws IOException {
        // store away the keystore
        assertActivatedKeyStore();
        try (FileOutputStream fos = new FileOutputStream(getFile())) {
            char[] passwd = getMasterPassword();
            try {
                ks.store(fos, passwd);
            } catch (Exception e) {
                throw new IOException(e);
            } finally {
                disposePassword(passwd);
            }
        }
    }

    /**
     * Creates initial key entries auto generated keys {@link #CONFIG_ENCRYPTION_KEY_ALIAS}
     *
     * @throws IOException
     */
    protected void addInitialKeys() throws IOException {

        RandomPasswordProvider randPasswdProvider = getRandomPasswordProvider();

        char[] configKey = randPasswdProvider.getRandomPasswordWithDefaultLength();
        setSecretKey(CONFIG_ENCRYPTION_KEY_ALIAS, configKey);
    }

    private RandomPasswordProvider getRandomPasswordProvider() {
        return new RandomPasswordProvider();
    }

    @Override
    public void prepareForMasterPasswordChange(char[] oldPassword, char[] newPassword)
            throws IOException {

        File dir = getFile().getParentFile();
        File newKSFile = new File(dir, PREPARED_FILE_NAME);
        if (newKSFile.exists()) newKSFile.delete();

        try {
            KeyStore oldKS = KeyStore.getInstance(KEYSTORETYPE);
            try (FileInputStream fin = new FileInputStream(getFile())) {
                oldKS.load(fin, oldPassword);
            }

            KeyStore newKS = KeyStore.getInstance(KEYSTORETYPE);
            newKS.load(null, newPassword);
            KeyStore.PasswordProtection protectionparam =
                    new KeyStore.PasswordProtection(newPassword);

            Enumeration<String> enumeration = oldKS.aliases();
            while (enumeration.hasMoreElements()) {
                String alias = enumeration.nextElement();
                Key key = oldKS.getKey(alias, oldPassword);
                KeyStore.Entry entry = null;
                if (key instanceof SecretKey) entry = new KeyStore.SecretKeyEntry((SecretKey) key);
                if (key instanceof PrivateKey)
                    entry =
                            new KeyStore.PrivateKeyEntry(
                                    (PrivateKey) key, oldKS.getCertificateChain(alias));
                if (key instanceof PublicKey)
                    entry = new KeyStore.TrustedCertificateEntry(oldKS.getCertificate(alias));
                if (entry == null)
                    LOGGER.warn(
                            "Unknown key in store, alias: {} class: {}",
                            alias,
                            key.getClass().getName());
                else newKS.setEntry(alias, entry, protectionparam);
            }

            try (FileOutputStream fos = new FileOutputStream(newKSFile)) {
                newKS.store(fos, newPassword);
            }
        } catch (Exception ex) {
            throw new IOException(ex);
        }
    }

    @Override
    public void abortMasterPasswordChange() {
        File dir = getFile().getParentFile();
        File newKSFile = new File(dir, PREPARED_FILE_NAME);
        if (newKSFile.exists()) {
            try {
                newKSFile.delete();
            } catch (Exception e) {
                LOGGER.error("UNABLE TO DELETE THE MASTERPWD FILE");
            }
        }
    }

    @Override
    public void commitMasterPasswordChange() throws IOException {
        File dir = getFile().getParentFile();
        File newKSFile = new File(dir, PREPARED_FILE_NAME);
        File oldKSFile = new File(dir, DEFAULT_FILE_NAME);

        if (!newKSFile.exists()) return; // nothing to do

        if (!oldKSFile.exists()) return; // not initialized

        // Try to open with new password
        try (FileInputStream fin = new FileInputStream(newKSFile)) {
            char[] passwd = getMasterPassword();

            try {
                KeyStore newKS = KeyStore.getInstance(KEYSTORETYPE);
                newKS.load(fin, passwd);

                // to be sure, decrypt all keys
                Enumeration<String> enumeration = newKS.aliases();
                while (enumeration.hasMoreElements()) {
                    newKS.getKey(enumeration.nextElement(), passwd);
                }
                if (!oldKSFile.delete()) {
                    LOGGER.error("cannot delete {}", getFile().getCanonicalPath());
                    return;
                }

                if (!newKSFile.renameTo(oldKSFile)) {
                    String msg = "cannot rename " + newKSFile.getCanonicalPath();
                    msg += "to " + oldKSFile.getCanonicalPath();
                    msg += "Try to rename manually and restart";
                    LOGGER.error(msg);
                    return;
                }
                reloadKeyStore();
                LOGGER.info("Successfully changed master password");
            } catch (IOException e) {
                String msg = "Error creating new keystore: " + newKSFile.getCanonicalPath();
                LOGGER.warn(msg, e);
                throw e;
            } catch (Exception ex) {
                throw new RuntimeException(ex);
            } finally {
                disposePassword(passwd);
                try {
                    fin.close();
                } catch (IOException ex) {
                    // give up
                }
            }
        }
    }
}
