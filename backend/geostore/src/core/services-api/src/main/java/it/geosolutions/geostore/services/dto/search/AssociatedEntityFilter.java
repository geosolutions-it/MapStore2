/*
 *  Copyright (C) 2025 GeoSolutions S.A.S.
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

import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.InternalErrorServiceEx;

import jakarta.xml.bind.annotation.XmlElement;

import java.io.Serializable;
import java.util.Collections;
import java.util.List;
import java.util.regex.Pattern;

/**
 * {@link SearchFilter} implementation that represent a filter by name on a {@link
 * Resource}-associated entity.
 */
public abstract class AssociatedEntityFilter extends SearchFilter implements Serializable {

    private static final Pattern NAMES_PATTERN = Pattern.compile("\"([^\"]*)\"|([^,]+)");
    private static final List<SearchOperator> VALID_OPERATORS =
            List.of(
                    SearchOperator.EQUAL_TO,
                    SearchOperator.LIKE,
                    SearchOperator.ILIKE,
                    SearchOperator.IN);

    private SearchOperator operator;
    private List<String> values;

    protected AssociatedEntityFilter() {}

    protected AssociatedEntityFilter(String names, SearchOperator operator) {
        setOperator(operator);
        setNames(names);
    }

    /**
     * Setter to map the deserialized filter names.
     *
     * <p>To search for multiple names, use a comma-separated list. If a name contains a comma, wrap
     * it in double quotes (e.g. "name,with,commas").
     *
     * @param names a comma-separated list of names to filter the resource with
     */
    @XmlElement
    public void setNames(String names) {

        if (names == null) {
            throw new IllegalArgumentException("filter names should not be null");
        }

        if (operator == SearchOperator.IN) {
            this.values =
                    NAMES_PATTERN
                            .matcher(names)
                            .results()
                            .map(r -> r.group(1) != null ? r.group(1) : r.group(2))
                            .toList();
        } else {
            this.values = Collections.singletonList(names);
        }
    }

    public SearchOperator getOperator() {
        return operator;
    }

    public void setOperator(SearchOperator operator) {
        this.operator = operator;
        checkOperator();
    }

    public List<String> values() {
        return values;
    }

    public abstract String property();

    @Override
    public void accept(FilterVisitor visitor) throws BadRequestServiceEx, InternalErrorServiceEx {
        checkOperator();
        visitor.visit(this);
    }

    private void checkOperator() {
        if (!VALID_OPERATORS.contains(operator))
            throw new IllegalArgumentException(
                    "Only EQUAL_TO, LIKE, ILIKE, or IN operators are acceptable");
    }

    @Override
    public String toString() {
        return getClass().getSimpleName()
                + '['
                + (operator != null ? operator : "!op!")
                + ' '
                + (values != null ? values : "[!names!]")
                + ']';
    }
}
