/*
 *  Copyright (C) 2026 GeoSolutions S.A.S.
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
 * Internal interface used by {@link AbstractGeoStorePasswordEncoder} to delegate the actual string
 * password encoding / verification to a concrete strategy (typically a Jasypt encryptor wrapper).
 *
 * <p>Replaces the legacy {@code org.acegisecurity.providers.encoding.PasswordEncoder} interface
 * dependency. Method signatures match the Acegi interface that the previous implementation used so
 * the password wire format is preserved across the migration — existing user-database passwords
 * keep validating without any data migration.
 *
 * <p>The {@code salt} parameter is unused by the concrete implementations (Jasypt manages salt
 * internally for both PBE and StrongPassword encoders); it is kept on the signature for backwards
 * compatibility with the {@link GeoStorePasswordEncoder} public API contract.
 */
interface InternalPasswordEncoder {

    /**
     * Encodes {@code rawPass} into an opaque string that can be stored and later verified.
     *
     * @param rawPass the plaintext password
     * @param salt unused — kept for legacy API compatibility
     */
    String encodePassword(String rawPass, Object salt);

    /**
     * Verifies that {@code rawPass} matches the previously-encoded {@code encPass}.
     *
     * @param encPass the stored encoded password
     * @param rawPass the plaintext candidate password
     * @param salt unused — kept for legacy API compatibility
     */
    boolean isPasswordValid(String encPass, String rawPass, Object salt);
}
