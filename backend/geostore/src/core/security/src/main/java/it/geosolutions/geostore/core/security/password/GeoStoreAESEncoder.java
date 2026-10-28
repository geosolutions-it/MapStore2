package it.geosolutions.geostore.core.security.password;

import org.apache.commons.codec.binary.Base64;
import org.springframework.dao.DataAccessException;

import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.SecretKeySpec;

/**
 * This class wraps the old password encoding and decoding system
 *
 * @author Lorenzo Natali (lorenzo.natali at geo-solutions.it)
 */
public class GeoStoreAESEncoder extends AbstractGeoStorePasswordEncoder {
    private static final byte[] DEFAULT_KEY =
            "installation dependant key needed".substring(0, 16).getBytes();
    private byte[] key = GeoStoreAESEncoder.DEFAULT_KEY;

    public void setKey(String key) {
        this.key = key.substring(0, 16).getBytes();
    }

    @Override
    protected InternalPasswordEncoder createStringEncoder() {
        // AES path overrides encodePassword / isPasswordValid directly; the string-encoder
        // delegate is not used. Return null to match the legacy behaviour.
        return null;
    }

    @Override
    protected CharArrayPasswordEncoder createCharEncoder() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public PasswordEncodingType getEncodingType() {
        return PasswordEncodingType.GEOSTORE;
    }

    @Override
    public boolean isPasswordValid(String encPass, String rawPass, Object salt)
            throws DataAccessException {
        if (encPass == null) return false;
        return rawPass.equals(decode(encPass));
    }

    @Override
    @SuppressWarnings("java:S5542")
    // Legacy ECB mode: backwards-compatibility with passwords already in DB
    public String encodePassword(char[] rawPass, Object salt) throws DataAccessException {
        try {
            SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, keySpec);
            byte[] input = new byte[rawPass.length];
            for (int i = 0; i < input.length; i++) {
                input[i] = (byte) rawPass[i];
            }

            byte[] encrypted = cipher.doFinal(input);
            byte[] output = Base64.encodeBase64(encrypted);
            return new String(output);
        } catch (NoSuchAlgorithmException
                | NoSuchPaddingException
                | IllegalBlockSizeException
                | BadPaddingException
                | InvalidKeyException ex) {
            throw new RuntimeException("Error while encoding", ex);
        }
    }

    @Override
    @SuppressWarnings("java:S5542")
    // Legacy ECB mode: backwards-compatibility with passwords already in DB
    public String decode(String encPass) throws UnsupportedOperationException {
        try {
            SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, keySpec);

            byte[] de64 = Base64.decodeBase64(encPass);
            byte[] decrypted = cipher.doFinal(de64);

            return new String(decrypted);
        } catch (NoSuchAlgorithmException
                | NoSuchPaddingException
                | IllegalBlockSizeException
                | BadPaddingException
                | InvalidKeyException ex) {
            throw new RuntimeException("Error while encoding", ex);
        }
    }

    @Override
    public boolean isResponsibleForEncoding(String encPass) {
        if (encPass == null) return false;

        String[] split = encPass.split(GeoStorePasswordEncoder.PREFIX_DELIMTER);
        if (split.length == 0) return true;
        // TODO get these strings in a better way
        String prefix = split[0];

        return !(prefix.equals("crypt1")
                || prefix.equals("crypt2")
                || prefix.equals("digest1")
                || prefix.equals("empty")
                || prefix.equals("plain"));
    }
}
