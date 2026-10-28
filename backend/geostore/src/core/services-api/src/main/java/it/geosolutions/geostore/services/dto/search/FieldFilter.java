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

import it.geosolutions.geostore.services.exception.InternalErrorServiceEx;

import jakarta.xml.bind.annotation.XmlRootElement;

import java.io.Serializable;

/**
 * Class FieldFilter.
 *
 * @author ETj (etj at geo-solutions.it)
 */
@XmlRootElement(name = "Field")
public class FieldFilter extends SearchFilter implements Serializable {

    /** The Constant serialVersionUID. */
    private static final long serialVersionUID = 2541950449534850345L;

    private BaseField field;

    private String value;

    private SearchOperator operator;

    /** */
    public FieldFilter() {}

    public FieldFilter(BaseField field, String value, SearchOperator operator) {
        this.field = field;
        this.value = value;
        this.operator = operator;
    }

    public BaseField getField() {
        return field;
    }

    public void setField(BaseField field) {
        this.field = field;
    }

    public SearchOperator getOperator() {
        return operator;
    }

    public void setOperator(SearchOperator operator) {
        this.operator = operator;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    @Override
    public void accept(FilterVisitor visitor) throws InternalErrorServiceEx {
        visitor.visit(this);
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append(getClass().getSimpleName()).append('[');
        builder.append(field != null ? field : "!field!");
        builder.append(' ');
        builder.append(operator != null ? operator : "!op!");
        builder.append(' ');
        builder.append(value != null ? value : "!value!");
        builder.append(']');
        return builder.toString();
    }
}
