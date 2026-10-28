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

/**
 * Enumeration for password encoding type.
 *
 * <p>
 *
 * <ul>
 *   <li>{@link #EMPTY} - empty, only for null or empty ("") passwords
 *   <li>{@link #PLAIN} - plain text
 *   <li>{@link #ENCRYPT} - symmetric encryption
 *   <li>{@link #DIGEST} - password hashing (recommended)
 *   <li>{@link #GEOSTORE} - old geostore system
 *
 * @author Lorenzo Natali
 */
public enum PasswordEncodingType {
    EMPTY,
    PLAIN,
    ENCRYPT,
    DIGEST,
    GEOSTORE;
}
