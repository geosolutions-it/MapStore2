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

import it.geosolutions.geostore.core.model.User;

import java.security.Principal;

/**
 * Class GeoStorePrincipal.
 *
 * @author ETj (etj at geo-solutions.it)
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public class GeoStorePrincipal implements Principal {

    private User user = null;

    public GeoStorePrincipal() {}

    /**
     * @param user
     */
    public GeoStorePrincipal(User user) {
        //
        // is using this ctor, caller may want to enforce user existance
        //
        if (user == null) throw new NullPointerException("Null user");

        this.user = user;
    }

    /**
     * @return GeoStorePrincipal
     */
    public static GeoStorePrincipal createGuest() {
        return new GeoStorePrincipal() {
            @Override
            public void setUser(User user) {
                throw new IllegalStateException("Can't set guest user");
            }
        };
    }

    /**
     * @return User
     */
    public User getUser() {
        return user;
    }

    /**
     * @param user
     */
    public void setUser(User user) {
        this.user = user;
    }

    /*
     * (non-Javadoc)
     *
     * @see java.security.Principal#getName()
     */
    @Override
    public String getName() {
        return user != null ? user.getName() : null;
    }

    public boolean isGuest() {
        return user == null;
    }

    /*
     * (non-Javadoc)
     *
     * @see java.lang.Object#equals(java.lang.Object)
     */
    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final GeoStorePrincipal other = (GeoStorePrincipal) obj;
        return this.user == other.user
                || (this.user != null && this.user.getName().equals(other.user.getName()));
    }

    /*
     * (non-Javadoc)
     *
     * @see java.lang.Object#hashCode()
     */
    @Override
    public int hashCode() {
        return user != null ? user.getName().hashCode() : 42;
    }
}
