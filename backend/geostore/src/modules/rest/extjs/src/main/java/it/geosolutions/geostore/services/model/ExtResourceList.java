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

package it.geosolutions.geostore.services.model;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;

import java.util.List;

/**
 * Class ExtResourceList.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
@XmlRootElement(name = "ExtResourceList")
public class ExtResourceList {

    private long count;

    private List<ExtResource> list;

    public ExtResourceList() {}

    public ExtResourceList(long count, List<ExtResource> list) {
        this.count = count;
        this.list = list;
    }

    @XmlElement(name = "ResourceCount")
    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }

    @XmlElement(name = "Resource")
    public List<ExtResource> getList() {
        return list;
    }

    public void setList(List<ExtResource> list) {
        this.list = list;
    }

    @XmlTransient
    public boolean isEmpty() {
        return list == null || list.isEmpty();
    }
}
