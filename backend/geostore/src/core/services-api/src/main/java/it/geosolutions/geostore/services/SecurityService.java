/*
 *  Copyright (C) 2007-2012 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services;

import it.geosolutions.geostore.core.model.SecurityRule;

import java.util.List;

/**
 * @author DamianoG
 *     <p>This Interface defines operations to retrieve the security rules based on users and groups
 */
public interface SecurityService {

    /**
     * @param userName
     * @param entityId the Id of the entity (f.e. Resource, Category, StoredData...) that the
     *     underlying implementation will be responsible for retrieve security rules
     * @return
     */
    List<SecurityRule> getUserSecurityRule(String userName, long entityId);

    /**
     * @param groupNames
     * @param entityId entityId the Id of the entity (f.e. Resource, Category, StoredData...) that
     *     the underlying implementation will be responsible for retrieve security rules
     * @return
     */
    List<SecurityRule> getGroupSecurityRule(List<String> groupNames, long entityId);
}
