package it.geosolutions.geostore.core.security.password;

import org.springframework.beans.factory.BeanNameAware;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Password encoders have to implement this interface to be used in GeoStore
 *
 * @author Lorenzo Natali (lorenzo.natali at geo-solutions.it)
 */
public interface GeoStorePasswordEncoder extends PasswordEncoder, BeanNameAware {

    public static final String PREFIX_DELIMTER = ":";

    /** The name of the password encoder. */
    String getName();

    /**
     * @param encPass
     * @return true if this encoder has encoded encPass
     */
    boolean isResponsibleForEncoding(String encPass);

    /**
     * Decodes an encoded password. Only supported for {@link PasswordEncodingType#ENCRYPT} and
     * {@link PasswordEncodingType#PLAIN} encoders, ie those that return <code>true</code> from
     * {@link #isReversible()}.
     *
     * @param encPass The encoded password.
     * @throws UnsupportedOperationException
     */
    String decode(String encPass) throws UnsupportedOperationException;

    /**
     * Decodes an encoded password to a char array.
     *
     * @see #decode(String)
     */
    char[] decodeToCharArray(String encPass) throws UnsupportedOperationException;

    /**
     * Encodes a raw password from a char array.
     *
     * @see #encodePassword(String, Object)
     */
    String encodePassword(char[] password, Object salt);

    String encodePassword(String password, Object salt);

    /**
     * Validates a specified "raw" password (as char array) against an encoded
     * password.
     *
     * @see {@link #isPasswordValid(String, String, Object)
     *
     */
    boolean isPasswordValid(String encPass, char[] rawPass, Object salt);

    boolean isPasswordValid(String encPass, String rawPass, Object salt);

    /**
     * @return a prefix which is stored with the password. This prefix must be unique within all
     *     {@link GeoStorePasswordEncoder} implementations.
     *     <p>Reserved:
     *     <p>plain digest1 crypt1
     *     <p>A plain text password is stored as
     *     <p>plain:password
     */
    String getPrefix();

    /**
     * Is this encoder available without installing the unrestricted policy files of the java
     * cryptographic extension
     *
     * @return
     */
    boolean isAvailableWithoutStrongCryptogaphy();

    /**
     * Flag indicating if the encoder can decode an encrypted password back into its original plain
     * text form.
     */
    boolean isReversible();

    PasswordEncodingType getEncodingType();
}
