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
package it.geosolutions.geostore.services.rest.utils;

import it.geosolutions.geostore.core.model.enums.Role;

import org.apache.cxf.security.SecurityContext;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.security.Principal;

/**
 * Class GeoStoreSecurityContext.
 *
 * @author ETj (etj at geo-solutions.it)
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public class GeoStoreSecurityContext implements SecurityContext {

    private static final Logger LOGGER = LogManager.getLogger(GeoStoreSecurityContext.class);

    private GeoStorePrincipal principal;

    /**
     * @param principal
     */
    public void setPrincipal(GeoStorePrincipal principal) {
        this.principal = principal;
    }

    @Override
    public Principal getUserPrincipal() {
        return principal;
    }

    /*
     * (non-Javadoc)
     *
     * @see org.apache.cxf.security.SecurityContext#isUserInRole(java.lang.String)
     */
    @Override
    public boolean isUserInRole(String role) {
        boolean ret = isUserInRoleAux(role);
        LOGGER.info("User " + principal.getName() + " in " + role + " : " + ret);
        return ret;
    }

    /**
     * @param role
     * @return boolean
     */
    public boolean isUserInRoleAux(String role) {
        if (Role.GUEST.name().equals(role)) {
            return principal.isGuest();
        } else {
            if (principal.isGuest()) return false;
            else return principal.getUser().getRole().name().equals(role);
        }
    }
}
