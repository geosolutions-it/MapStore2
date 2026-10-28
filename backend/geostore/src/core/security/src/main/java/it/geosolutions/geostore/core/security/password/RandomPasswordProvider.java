/* ====================================================================
 *
 * Copyright (C) 2014 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.core.security.password;

import java.security.SecureRandom;

/**
 * This Class for generating random passwords using {@link SecureRandom}.
 *
 * <p>The password alphabet is {@link #PRINTABLE_ALPHABET}. Since the alphabet is not really big,
 * the length of the password is important. This class is the same available in GeoServer.
 *
 * @author Lorenzo Natali (lorenzo.natali at geo-solutions.it)
 */
public class RandomPasswordProvider {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /** alphabet */
    public static final char[] PRINTABLE_ALPHABET = {
        '!', '\"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/', '0', '1', '2',
        '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '?', '@', 'A', 'B', 'C', 'D', 'E', 'F',
        'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
        'Y', 'Z', '[', '\\', ']', '^', '_', '`', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '{', '|',
        '}', '~',
    };

    /**
     * The default password length assures a key strength of 2 ^ 261 {@link #PRINTABLE_ALPHABET} has
     * 92 characters ln (92 ^ 40 ) / ln (2) = 260.942478242
     */
    public static int DefaultPasswordLength = 40;

    /**
     * Creates a random password of the specified length, if length <=0, return <code>null</code>
     */
    public char[] getRandomPassword(int length) {
        if (length <= 0) return null;
        char[] buff = new char[length];
        getRandomPassword(buff);
        return buff;
    }

    public char[] getRandomPasswordWithDefaultLength() {
        char[] buff = new char[DefaultPasswordLength];
        getRandomPassword(buff);
        return buff;
    }

    /** Creates a random password filling the specified character array. */
    public void getRandomPassword(char[] buff) {
        for (int i = 0; i < buff.length; i++) {
            int index = SECURE_RANDOM.nextInt() % PRINTABLE_ALPHABET.length;
            if (index < 0) index += PRINTABLE_ALPHABET.length;
            buff[i] = PRINTABLE_ALPHABET[index];
        }
    }

    /** Creates a random password filling the specified byte array. */
    public void getRandomPassword(byte[] buff) {
        for (int i = 0; i < buff.length; i++) {
            int index = SECURE_RANDOM.nextInt() % PRINTABLE_ALPHABET.length;
            if (index < 0) index += PRINTABLE_ALPHABET.length;
            buff[i] = (byte) PRINTABLE_ALPHABET[index];
        }
    }
}
