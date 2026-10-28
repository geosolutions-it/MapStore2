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
package it.geosolutions.geostore.services.dto;

import it.geosolutions.geostore.core.model.Attribute;
import it.geosolutions.geostore.core.model.enums.DataType;

import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Class ShortAttribute.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public class ShortAttribute implements Serializable {

    /** The Constant serialVersionUID. */
    private static final long serialVersionUID = -2866828937413755002L;

    private String name;

    private String value;

    private DataType type;

    public ShortAttribute() {
        super();
    }

    /**
     * @param name
     * @param value
     * @param type
     */
    public ShortAttribute(Attribute attribute) {
        super();
        this.name = attribute.getName();
        this.value = attribute.getValue();
        this.type = attribute.getType();
    }

    public ShortAttribute(String name, String value, DataType type) {
        this.name = name;
        this.value = value;
        this.type = type;
    }

    public static ShortAttribute createDateAttribute(String name, Date date) {
        return new ShortAttribute(
                name, new SimpleDateFormat(Attribute.DATE_FORMAT).format(date), DataType.DATE);
    }

    public static ShortAttribute createStringAttribute(String name, String text) {
        return new ShortAttribute(name, text, DataType.STRING);
    }

    /**
     * @return the attribute
     */
    public String getName() {
        return name;
    }

    /**
     * @param name the attribute to set
     */
    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return this.value;
    }

    /**
     * @param value
     */
    public void setValue(String value) {
        this.value = value;
    }

    /**
     * @return the type
     */
    public DataType getType() {
        return type;
    }

    /**
     * @param type the type to set
     */
    public void setType(DataType type) {
        this.type = type;
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

        if (name != null) builder.append("name=").append(name).append(", ");

        if (value != null) builder.append("value=").append(value).append(", ");

        if (type != null) builder.append("type=").append(type);

        builder.append(']');
        return builder.toString();
    }
}
