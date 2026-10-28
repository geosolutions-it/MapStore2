/* ====================================================================
 *
 * Copyright (C) 2015 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.security;

import org.springframework.security.core.GrantedAuthority;

import java.util.Set;

/**
 * Service to extract groups and/or roles list from an external service.
 *
 * @author mauro.bartolomeoli@geo-solutions.it
 */
public interface GroupsRolesService {
    /**
     * Get all groups from the external service.
     *
     * @return
     */
    Set<GrantedAuthority> getAllGroups();

    /**
     * Get all roles from the external service.
     *
     * <p>(currently not used, it will be useful when roles will not be fixed, finally).
     *
     * @return
     */
    Set<GrantedAuthority> getAllRoles();
}
