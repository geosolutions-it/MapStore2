/*
 * Copyright (C) 2021 - 2011 GeoSolutions S.A.S. http://www.geo-solutions.it
 *
 * GPLv3 + Classpath exception
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the
 * GNU General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program. If
 * not, see <http://www.gnu.org/licenses/>.
 */
package it.geosolutions.geostore.core.model;

import static org.junit.Assert.assertEquals;

import it.geosolutions.geostore.core.model.enums.GroupReservedNames;

import org.junit.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class GroupReservedNamesTest {
    @Test
    public void testRemoveReserved() {
        List<UserGroup> groups = new ArrayList<UserGroup>();
        UserGroup everyOne = new UserGroup();
        everyOne.setGroupName(GroupReservedNames.EVERYONE.groupName());
        groups.add(everyOne);
        UserGroup sample = new UserGroup();
        sample.setGroupName("sample");
        groups.add(sample);

        Set<UserGroup> result = GroupReservedNames.checkReservedGroups(groups);

        assertEquals(1, result.size());
        assertEquals("sample", result.iterator().next().getGroupName());
    }
}
