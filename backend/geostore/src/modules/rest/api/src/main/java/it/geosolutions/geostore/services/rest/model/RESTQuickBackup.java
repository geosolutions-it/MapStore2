/* ====================================================================
 *
 * Copyright (C) 2007 - 2012 GeoSolutions S.A.S.
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

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.io.Serializable;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;

/**
 * @author ETj (etj at geo-solutions.it)
 */
@XmlRootElement(name = "Backup")
public class RESTQuickBackup implements Serializable {

    private Collection<RESTBackupCategory> categories = new LinkedList<RESTBackupCategory>();

    public RESTQuickBackup() {}

    @XmlElement(name = "category")
    public Collection<RESTBackupCategory> getCategories() {
        return categories;
    }

    public void setCategories(Collection<RESTBackupCategory> categories) {
        this.categories = categories;
    }

    public void addCategory(RESTBackupCategory cat) {
        categories.add(cat);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(getClass().getSimpleName()).append('[');

        if (categories != null) {
            sb.append("categories(").append(categories.size()).append(")");
            for (RESTBackupCategory cat : categories) {
                sb.append('{').append(cat.getName());
                for (RESTBackupResource res : cat.getResources()) {
                    sb.append('[').append(res.getResource().getName()).append(']');
                }
                sb.append('}');
            }
        }
        sb.append(']');
        return sb.toString();
    }

    public static class RESTBackupCategory implements Serializable {
        Long id;

        String name;

        RESTBackupAuth auth;

        List<RESTBackupResource> resources = new LinkedList<RESTBackupResource>();

        public RESTBackupAuth getAuth() {
            return auth;
        }

        public void setAuth(RESTBackupAuth auth) {
            this.auth = auth;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public List<RESTBackupResource> getResources() {
            return resources;
        }

        public void setResources(List<RESTBackupResource> resources) {
            this.resources = resources;
        }

        public void addResource(RESTBackupResource resource) {
            resources.add(resource);
        }
    }

    public static class RESTBackupAuth implements Serializable {
        // TODO
    }

    public static class RESTBackupResource implements Serializable {
        RESTResource resource;

        // TODO: add auth info

        public RESTResource getResource() {
            return resource;
        }

        public void setResource(RESTResource resource) {
            this.resource = resource;
        }
    }
}
