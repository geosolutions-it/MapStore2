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

import org.springframework.dao.DataAccessException;

/**
 * Abstract base implementation, delegating the encoding to third party encoders implementing {@link
 * InternalPasswordEncoder}.
 *
 * <p>The legacy {@code org.acegisecurity.providers.encoding.PasswordEncoder} interface dependency
 * was dropped — the internal contract is now {@link InternalPasswordEncoder}, a package-local
 * interface with the same two-method shape so concrete subclasses keep wrapping Jasypt directly and
 * the password wire format is preserved.
 *
 * @author Lorenzo Natali
 */
public abstract class AbstractGeoStorePasswordEncoder implements GeoStorePasswordEncoder {

    protected volatile InternalPasswordEncoder stringEncoder;
    protected volatile CharArrayPasswordEncoder charEncoder;

    protected String name;

    private volatile boolean availableWithoutStrongCryptogaphy;
    private volatile boolean reversible = true;
    private String prefix;

    public String getName() {
        return name;
    }

    public void setBeanName(String beanName) {
        this.name = beanName;
    }

    protected InternalPasswordEncoder getStringEncoder() {
        if (stringEncoder == null) {
            synchronized (this) {
                if (stringEncoder == null) {
                    stringEncoder = createStringEncoder();
                }
            }
        }
        return stringEncoder;
    }

    /** Creates the encoder instance used when source is a string. */
    protected abstract InternalPasswordEncoder createStringEncoder();

    protected CharArrayPasswordEncoder getCharEncoder() {
        if (charEncoder == null) {
            synchronized (this) {
                if (charEncoder == null) {
                    charEncoder = createCharEncoder();
                }
            }
        }
        return charEncoder;
    }

    /** Creates the encoder instance used when source is a char array. */
    protected abstract CharArrayPasswordEncoder createCharEncoder();

    /**
     * @return the concrete {@link InternalPasswordEncoder} object
     */
    protected final InternalPasswordEncoder getActualEncoder() {
        return null;
    }

    public String encodePassword(String rawPass, Object salt) throws DataAccessException {
        return doEncodePassword(getStringEncoder().encodePassword(rawPass, salt));
    }

    @Override
    public String encode(CharSequence rawPass) {
        return doEncodePassword(getStringEncoder().encodePassword(rawPass.toString(), "salt"));
    }

    @Override
    public boolean matches(CharSequence encPass, String rawPass) {
        if (encPass == null) return false;
        return getStringEncoder().isPasswordValid(stripPrefix(encPass.toString()), rawPass, "salt");
    }

    @Override
    public String encodePassword(char[] rawPass, Object salt) throws DataAccessException {
        return doEncodePassword(getCharEncoder().encodePassword(rawPass, salt));
    }

    String doEncodePassword(String encPass) {
        if (encPass == null) {
            return encPass;
        }

        StringBuffer buff = initPasswordBuffer();
        buff.append(encPass);
        return buff.toString();
    }

    StringBuffer initPasswordBuffer() {
        StringBuffer buff = new StringBuffer();
        if (getPrefix() != null) {
            buff.append(getPrefix()).append(GeoStorePasswordEncoder.PREFIX_DELIMTER);
        }
        return buff;
    }

    public boolean isPasswordValid(String encPass, String rawPass, Object salt)
            throws DataAccessException {
        if (encPass == null) return false;
        return getStringEncoder().isPasswordValid(stripPrefix(encPass), rawPass, salt);
    }

    @Override
    public boolean isPasswordValid(String encPass, char[] rawPass, Object salt) {
        if (encPass == null) return false;
        return getCharEncoder().isPasswordValid(stripPrefix(encPass), rawPass, salt);
    }

    String stripPrefix(String encPass) {
        return getPrefix() != null ? removePrefix(encPass) : encPass;
    }

    protected String removePrefix(String encPass) {
        return encPass.replaceFirst(getPrefix() + GeoStorePasswordEncoder.PREFIX_DELIMTER, "");
    }

    @Override
    public abstract PasswordEncodingType getEncodingType();

    /**
     * @param encPass
     * @return true if this encoder has encoded encPass
     */
    public boolean isResponsibleForEncoding(String encPass) {
        if (encPass == null) return false;
        return encPass.startsWith(getPrefix() + GeoStorePasswordEncoder.PREFIX_DELIMTER);
    }

    public String decode(String encPass) throws UnsupportedOperationException {
        throw new UnsupportedOperationException("decoding passwords not supported");
    }

    @Override
    public char[] decodeToCharArray(String encPass) throws UnsupportedOperationException {
        throw new UnsupportedOperationException("decoding passwords not supported");
    }

    public String getPrefix() {
        return prefix;
    }

    public void setPrefix(String prefix) {
        this.prefix = prefix;
    }

    public boolean isAvailableWithoutStrongCryptogaphy() {
        return availableWithoutStrongCryptogaphy;
    }

    public void setAvailableWithoutStrongCryptogaphy(boolean availableWithoutStrongCryptogaphy) {
        this.availableWithoutStrongCryptogaphy = availableWithoutStrongCryptogaphy;
    }

    public boolean isReversible() {
        return reversible;
    }

    public void setReversible(boolean reversible) {
        this.reversible = reversible;
    }

    /** Interface for password encoding when source password is specified as char array. */
    protected static interface CharArrayPasswordEncoder {

        String encodePassword(char[] rawPass, Object salt);

        boolean isPasswordValid(String encPass, char[] rawPass, Object salt);
    }
}
