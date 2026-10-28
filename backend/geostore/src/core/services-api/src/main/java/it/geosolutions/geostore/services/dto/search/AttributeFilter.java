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

import it.geosolutions.geostore.core.model.enums.DataType;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.InternalErrorServiceEx;

import jakarta.xml.bind.annotation.XmlRootElement;

import java.io.Serializable;

/**
 * Class Search.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
@XmlRootElement(name = "Attribute")
public class AttributeFilter extends SearchFilter implements Serializable {

    /** The Constant serialVersionUID. */
    private static final long serialVersionUID = -2067611261095378628L;

    private String name;

    private String value;

    private DataType type;

    private SearchOperator operator;

    /** */
    public AttributeFilter() {}

    /**
     * @param name
     * @param value
     * @param type
     * @param operator
     */
    public AttributeFilter(String name, String value, DataType type, SearchOperator operator) {
        this.name = name;
        this.value = value;
        this.type = type;
        this.operator = operator;
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
     * @return the value
     */
    public String getValue() {
        return value;
    }

    /**
     * @param value the value to set
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

    /**
     * @return the operator
     */
    public SearchOperator getOperator() {
        return operator;
    }

    /**
     * @param operator the operator to set
     */
    public void setOperator(SearchOperator operator) {
        this.operator = operator;
    }

    @Override
    public void accept(FilterVisitor visitor) throws BadRequestServiceEx, InternalErrorServiceEx {
        visitor.visit(this);
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
        builder.append('<').append(type != null ? type : "!type!").append('>');
        builder.append(name != null ? name : "!name!");
        builder.append(' ');
        builder.append(operator != null ? operator : "!op!");
        builder.append(' ');
        builder.append(value != null ? value : "!value!");
        builder.append(']');
        return builder.toString();
    }
}
