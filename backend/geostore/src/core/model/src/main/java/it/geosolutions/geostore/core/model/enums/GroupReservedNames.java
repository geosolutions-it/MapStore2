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
package it.geosolutions.geostore.core.model.enums;

import it.geosolutions.geostore.core.model.UserGroup;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

/**
 * @author DamianoG
 */
public enum GroupReservedNames {
    EVERYONE("everyone");

    private final String groupNameToPersist;

    GroupReservedNames(String groupNameToPersist) {
        this.groupNameToPersist = groupNameToPersist;
    }

    public String groupName() {
        return groupNameToPersist;
    }

    /**
     * Given a candidate groupName this method checks if the name is allowed. This enum holds the
     * list of reserved names. A groupname is not allowed if it matches ignoring the case at least
     * one of the reserved names.
     *
     * @param groupNameToCheck
     * @return
     */
    public static boolean isAllowedName(String groupNameToCheck) {
        if (EVERYONE.groupName().equalsIgnoreCase(groupNameToCheck)) {
            return false;
        }
        return true;
    }

    /**
     * Utility method to remove Reserved group (for example EVERYONE) from a group list
     *
     * @param groups
     * @return
     */
    public static Set<UserGroup> checkReservedGroups(Collection<UserGroup> groups) {
        Set<UserGroup> result = new HashSet<UserGroup>();
        for (UserGroup ug : groups) {
            if (GroupReservedNames.isAllowedName(ug.getGroupName())) {
                result.add(ug);
            }
        }
        return result;
    }
}
