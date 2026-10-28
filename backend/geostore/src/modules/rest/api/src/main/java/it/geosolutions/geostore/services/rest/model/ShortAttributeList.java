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

import it.geosolutions.geostore.services.dto.ShortAttribute;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.util.List;

/**
 * Class ShortAttributeList.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
@XmlRootElement(name = "AttributeList")
public class ShortAttributeList {

    private List<ShortAttribute> list;

    public ShortAttributeList() {}

    /**
     * @param list
     */
    public ShortAttributeList(List<ShortAttribute> list) {
        this.list = list;
    }

    /**
     * @return List<ShortResource>
     */
    @XmlElement(name = "Attribute")
    public List<ShortAttribute> getList() {
        return list;
    }

    /**
     * @param list
     */
    public void setList(List<ShortAttribute> list) {
        this.list = list;
    }
}
