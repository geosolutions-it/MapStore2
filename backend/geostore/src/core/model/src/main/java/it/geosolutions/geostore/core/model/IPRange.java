/* ====================================================================
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
package it.geosolutions.geostore.core.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.math.BigInteger;

@Entity(name = "IPRange")
@Table(
        name = "gs_ip_range",
        indexes = {@Index(name = "idx_ip_range_lookup", columnList = "ip_low, ip_high")})
public class IPRange implements Serializable {

    @Id @GeneratedValue private Long id;

    @Column(nullable = false, length = 50, unique = true)
    private String cidr;

    @Column private String description;

    @Column(name = "ip_low", precision = 39, scale = 0)
    private BigInteger ipLow;

    @Column(name = "ip_high", precision = 39, scale = 0)
    private BigInteger ipHigh;

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

    public BigInteger getIpLow() {
        return ipLow;
    }

    public void setIpLow(BigInteger ipLow) {
        this.ipLow = ipLow;
    }

    public BigInteger getIpHigh() {
        return ipHigh;
    }

    public void setIpHigh(BigInteger ipHigh) {
        this.ipHigh = ipHigh;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = (prime * result) + ((id == null) ? 0 : id.hashCode());
        result = (prime * result) + ((cidr == null) ? 0 : cidr.hashCode());
        result = (prime * result) + ((description == null) ? 0 : description.hashCode());
        result = (prime * result) + ((ipLow == null) ? 0 : ipLow.hashCode());
        result = (prime * result) + ((ipHigh == null) ? 0 : ipHigh.hashCode());

        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }

        IPRange other = (IPRange) obj;
        if (id == null) {
            if (other.id != null) {
                return false;
            }
        } else if (!id.equals(other.id)) {
            return false;
        }
        if (cidr == null) {
            if (other.cidr != null) {
                return false;
            }
        } else if (!cidr.equals(other.cidr)) {
            return false;
        }
        if (description == null) {
            if (other.description != null) {
                return false;
            }
        } else if (!description.equals(other.description)) {
            return false;
        }
        if (ipLow == null) {
            if (other.ipLow != null) {
                return false;
            }
        } else if (!ipLow.equals(other.ipLow)) {
            return false;
        }
        if (ipHigh == null) {
            if (other.ipHigh != null) {
                return false;
            }
        } else if (!ipHigh.equals(other.ipHigh)) {
            return false;
        }
        return true;
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

        if (ipLow != null && ipHigh != null) {
            builder.append(", ");
            builder.append("range=")
                    .append("[")
                    .append(ipLow)
                    .append(":")
                    .append(ipHigh)
                    .append("]");
        }

        builder.append(']');

        return builder.toString();
    }
}
