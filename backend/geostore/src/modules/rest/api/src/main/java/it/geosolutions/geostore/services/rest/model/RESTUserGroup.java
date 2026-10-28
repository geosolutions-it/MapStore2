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
package it.geosolutions.geostore.services.rest.model;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.UserGroupAttribute;

import jakarta.xml.bind.annotation.XmlRootElement;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * @author DamianoG
 */
@XmlRootElement(name = "UserGroup")
public class RESTUserGroup implements Serializable {

    private static final long serialVersionUID = 7681963958796864207L;

    private Long id;

    private String groupName;

    private UserList restUsers;

    private String description;

    private List<UserGroupAttribute> attributes;

    public RESTUserGroup() {}

    /**
     * @param id
     * @param groupName
     */
    public RESTUserGroup(Long id, String groupName, Set<User> users, String description) {
        this.id = id;
        this.groupName = groupName;
        List<RESTUser> list = new ArrayList<RESTUser>();
        for (User u : users) {
            list.add(new RESTUser(u.getId(), u.getName(), u.getRole(), u.getGroups(), true));
        }
        this.restUsers = new UserList(list);
        this.description = description;
    }

    public RESTUserGroup(UserGroup group, Set<User> users) {
        this(group.getId(), group.getGroupName(), users, group.getDescription());
    }

    /**
     * @return the id
     */
    public Long getId() {
        return id;
    }

    /**
     * @param id the id to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * @return the groupName
     */
    public String getGroupName() {
        return groupName;
    }

    /**
     * @param groupName the groupName to set
     */
    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    /**
     * @return the restUsers
     */
    public UserList getRestUsers() {
        return restUsers;
    }

    /**
     * @param restUsers the restUsers to set
     */
    public void setRestUsers(UserList restUsers) {
        this.restUsers = restUsers;
    }

    /**
     * @return the description
     */
    public String getDescription() {
        return description;
    }

    /**
     * @param description the description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    public List<UserGroupAttribute> getAttributes() {
        return attributes;
    }

    public void setAttributes(List<UserGroupAttribute> attributes) {
        this.attributes = attributes;
    }

    /**
     * @return the serialversionuid
     */
    public static long getSerialversionuid() {
        return serialVersionUID;
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append(getClass().getSimpleName()).append('[');

        if (id != null) {
            builder.append("id=").append(id);
        }

        if (groupName != null) {
            builder.append(", ");
            builder.append("groupName=").append(groupName);
        }

        builder.append(']');
        return builder.toString();
    }
}
