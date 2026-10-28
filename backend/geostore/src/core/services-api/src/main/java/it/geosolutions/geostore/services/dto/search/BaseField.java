/*
 *  Copyright (C) 2007 - 2011 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.dto.search;

import jakarta.xml.bind.annotation.XmlType;

import java.util.Date;

/**
 * Enum BaseField.
 *
 * @author ETj (etj at geo-solutions.it)
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
@XmlType
public enum BaseField {
    CREATION("creation", Date.class),
    ID("id", Long.class),
    LASTUPDATE("lastUpdate", Date.class),
    NAME("name", String.class),
    DESCRIPTION("description", String.class),
    METADATA("metadata", String.class),
    CREATOR("creator", String.class),
    EDITOR("editor", String.class);

    private String fieldName;

    @SuppressWarnings("rawtypes")
    private Class type;

    @SuppressWarnings("rawtypes")
    private BaseField(String name, Class type) {
        this.fieldName = name;
        this.type = type;
    }

    @SuppressWarnings("rawtypes")
    public Class getType() {
        return type;
    }

    public String getFieldName() {
        return fieldName;
    }
}
