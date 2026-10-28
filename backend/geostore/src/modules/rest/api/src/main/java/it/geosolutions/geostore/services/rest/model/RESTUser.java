/*
 * ====================================================================
 *
 * Copyright (C) 2007 - 2011 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.model;

import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.GroupReservedNames;
import it.geosolutions.geostore.core.model.enums.Role;

import jakarta.xml.bind.annotation.XmlRootElement;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Class RESTUser.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
@XmlRootElement(name = "User")
public class RESTUser implements Serializable {

    /** The Constant serialVersionUID. */
    private static final long serialVersionUID = -3004145977232782933L;

    /** The id. */
    private Long id;

    private String name;

    private Role role;

    private List<String> groupsNames;

    public RESTUser() {}

    /**
     * @param id
     */
    public RESTUser(Long id) {
        this.id = id;
    }

    /**
     * @param name
     */
    public RESTUser(String name) {
        this.name = name;
    }

    /**
     * @param id
     * @param name
     * @param role
     */
    public RESTUser(Long id, String name, Role role, Set<UserGroup> groups, boolean allGroups) {
        super();
        this.id = id;
        this.name = name;
        this.role = role;
        groupsNames = new ArrayList<String>();
        if (groups != null) {
            for (UserGroup ug : groups) {
                if (allGroups || GroupReservedNames.isAllowedName(ug.getGroupName())) {
                    groupsNames.add(ug.getGroupName());
                }
            }
        }
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
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * @param name the name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * @return the role
     */
    public Role getRole() {
        return role;
    }

    /**
     * @param role the role to set
     */
    public void setRole(Role role) {
        this.role = role;
    }

    /**
     * @return the groupsNames
     */
    public List<String> getGroupsNames() {
        return groupsNames;
    }

    /**
     * @param groupsNames the groupsNames to set
     */
    public void setGroupsNames(List<String> groupsNames) {
        this.groupsNames = groupsNames;
    }

    /*
     * (non-Javadoc)
     *
     * @see java.lang.Object#toString()
     */
    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append(getClass().getSimpleName()).append('[');

        if (id != null) {
            builder.append("id=").append(id);
        }

        if (name != null) {
            builder.append(", ");
            builder.append("name=").append(name);
        }

        if (role != null) {
            builder.append(", ");
            builder.append("role=").append(role);
        }

        builder.append(']');
        return builder.toString();
    }
}
