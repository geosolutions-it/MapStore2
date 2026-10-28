/*
 *  Copyright (C) 2007 - 2011 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 3 of the License, or
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
package it.geosolutions.geostore.core.dao;

import com.googlecode.genericdao.search.Search;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;

import java.util.List;

/**
 * Interface UserGroupDAO.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public interface UserGroupDAO extends RestrictedGenericDAO<UserGroup> {

    UserGroup findByName(String name);

    /** This search limits the results by the user's groups. */
    List<UserGroup> searchByUser(User user, Search search);

    /**
     * Returns the {@link UserGroup} with the given id with its attributes eagerly initialized (e.g.
     * via JOIN FETCH or an equivalent mechanism).
     *
     * <p>This is an optional helper to avoid lazy loading issues when the caller needs to access
     * group attributes outside an active persistence context.
     *
     * @param id the group id
     * @return the group with initialized attributes, or {@code null} if not found
     * @since 2025
     */
    UserGroup findWithAttributes(long id);
}
