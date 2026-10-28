/*
 *  Copyright (C) 2007-2016 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.model;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Objects;

/**
 * @author DamianoG
 */
@XmlRootElement(name = "UserGroupList")
public class UserGroupList implements Iterable<RESTUserGroup> {

    private List<RESTUserGroup> list;
    private long count;

    public UserGroupList() {
        this.list = new ArrayList<>();
    }

    public UserGroupList(List<RESTUserGroup> list, long count) {
        super();
        this.count = count;
        this.list = Objects.requireNonNullElseGet(list, ArrayList::new);
    }

    @XmlElement(name = "UserGroup")
    public List<RESTUserGroup> getUserGroupList() {
        return list;
    }

    public void setUserGroupList(List<RESTUserGroup> userGroup) {
        this.list = userGroup;
    }

    @XmlElement(name = "Count")
    public long getCount() {
        return count;
    }

    @Override
    public Iterator<RESTUserGroup> iterator() {
        return list == null ? Collections.emptyIterator() : list.iterator();
    }
}
