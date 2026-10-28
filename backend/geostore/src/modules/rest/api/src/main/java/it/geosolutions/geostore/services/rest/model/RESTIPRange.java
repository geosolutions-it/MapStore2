/*
 * ====================================================================
 *
 * Copyright (C) 2025 GeoSolutions S.A.S.
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

import it.geosolutions.geostore.core.model.IPRange;

import jakarta.xml.bind.annotation.XmlRootElement;

import java.io.Serializable;

/**
 * REST representation for the {@link it.geosolutions.geostore.core.model.IPRange} model resource.
 */
@XmlRootElement(name = "IPRange")
public class RESTIPRange implements Serializable {

    private static final long serialVersionUID = 6974052046677936814L;

    private Long id;
    private String cidr;
    private String description;

    public RESTIPRange() {}

    public RESTIPRange(IPRange ipRange) {
        this.id = ipRange.getId();
        this.cidr = ipRange.getCidr();
        this.description = ipRange.getDescription();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCidr() {
        return cidr;
    }

    public void setCidr(String cidr) {
        this.cidr = cidr;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append(getClass().getSimpleName()).append('[');

        if (id != null) {
            builder.append("id=").append(id);
        }

        if (cidr != null) {
            builder.append(", ");
            builder.append("cidr=").append(cidr);
        }

        if (description != null) {
            builder.append(", ");
            builder.append("description=").append(description);
        }

        builder.append(']');
        return builder.toString();
    }

    public IPRange toIPRange() {
        IPRange ipRange = new IPRange();
        ipRange.setId(this.id);
        ipRange.setCidr(this.cidr);
        ipRange.setDescription(this.description);
        return ipRange;
    }
}
