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

import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.InternalErrorServiceEx;

import jakarta.xml.bind.annotation.XmlRootElement;

import java.io.Serializable;

/**
 * Filter by category name
 *
 * @author ETj (etj at geo-solutions.it)
 */
@XmlRootElement(name = "CategoryFilter")
public class CategoryFilter extends SearchFilter implements Serializable {

    private String name;

    private SearchOperator operator;

    /** */
    public CategoryFilter() {}

    /**
     * @param name
     * @param operator
     */
    public CategoryFilter(String name, SearchOperator operator) {
        this.name = name;
        setOperator(operator);
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
     * @return the operator
     */
    public SearchOperator getOperator() {
        return operator;
    }

    /**
     * @param operator the operator to set
     */
    public final void setOperator(SearchOperator operator) {
        checkOperator(operator);
        this.operator = operator;
    }

    public static void checkOperator(SearchOperator operator) {
        if (operator != SearchOperator.EQUAL_TO && operator != SearchOperator.LIKE)
            throw new IllegalArgumentException("Only EQUAL or LIKE operator are acceptable");
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
        builder.append(operator != null ? operator : "!op!");
        builder.append(' ');
        builder.append(name != null ? name : "!name!");
        builder.append(']');
        return builder.toString();
    }
}
