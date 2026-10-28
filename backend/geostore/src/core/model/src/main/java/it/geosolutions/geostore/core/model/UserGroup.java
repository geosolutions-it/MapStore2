/*
 * ====================================================================
 *
 * Copyright (C) 2007 - 2025 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.core.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Class Group.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
@Entity(name = "UserGroup")
@Table(
        name = "gs_usergroup",
        uniqueConstraints = {@UniqueConstraint(columnNames = {"groupName"})},
        indexes = {@Index(name = "idx_usergroup_name", columnList = "groupName")})
// @Cache(usage = CacheConcurrencyStrategy.READ_WRITE, region = "gs_usergroup")
@XmlRootElement(name = "UserGroup")
public class UserGroup implements Serializable {

    /** The Constant serialVersionUID. */
    private static final long serialVersionUID = 6065837305601115748L;

    /** The id. */
    @Id @GeneratedValue private Long id;

    @Column(nullable = false, updatable = false, length = 255)
    private String groupName;

    @Column(nullable = true, updatable = true, length = 255)
    private String description;

    /*
     * Only To allow the CASCADING operation
     */
    @OneToMany(mappedBy = "group", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    private List<SecurityRule> security;

    @Convert(converter = org.hibernate.type.YesNoConverter.class)
    @Column(nullable = false, updatable = true)
    private boolean enabled = true;

    private transient List<User> users = new ArrayList<>();

    /* TODO: this should be a map for better handling */
    @OneToMany(mappedBy = "userGroup", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    private List<UserGroupAttribute> attributes;

    @XmlTransient
    public List<User> getUsers() {
        return users;
    }

    /**
     * Users belonging to this UserGroup.
     *
     * @param users
     */
    public void setUsers(List<User> users) {
        this.users = users;
    }

    /**
     * @return the enabled flag
     */
    public boolean isEnabled() {
        return enabled;
    }

    /**
     * set enabled flag
     *
     * @param enabled
     */
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    /**
     * @return the id
     */
    // @XmlTransient
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
     * @return the security
     */
    @XmlTransient
    public List<SecurityRule> getSecurity() {
        return security;
    }

    /**
     * @param security the security to set
     */
    public void setSecurity(List<SecurityRule> security) {
        this.security = security;
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

    /**
     * @return the attribute
     */
    @XmlTransient
    public List<UserGroupAttribute> getAttributes() {
        return attributes;
    }

    /**
     * @param attributes the attribute to set
     */
    public void setAttributes(List<UserGroupAttribute> attributes) {
        this.attributes = attributes;
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

        if (groupName != null) {
            builder.append(", ");
            builder.append("groupName=").append(groupName);
        }

        if (users != null) {
            builder.append(", ");
            builder.append("users=").append(users.stream().map(User::getId).toList());
        }

        builder.append(']');

        return builder.toString();
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        UserGroup other = (UserGroup) obj;
        if (id != null && other.id != null) return id.equals(other.id);
        // fallback if id is null (unsaved entities)
        return groupName != null && groupName.equals(other.groupName);
    }

    @Override
    public int hashCode() {
        if (id != null) return id.hashCode();
        return groupName != null ? groupName.hashCode() : 0;
    }
}
