/*
 *  Copyright (C) 2007 - 2012 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.util;

import com.googlecode.genericdao.search.Filter;
import com.googlecode.genericdao.search.Search;

import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.services.dto.search.AndFilter;
import it.geosolutions.geostore.services.dto.search.AssociatedEntityFilter;
import it.geosolutions.geostore.services.dto.search.AttributeFilter;
import it.geosolutions.geostore.services.dto.search.CategoryFilter;
import it.geosolutions.geostore.services.dto.search.FieldFilter;
import it.geosolutions.geostore.services.dto.search.FilterVisitor;
import it.geosolutions.geostore.services.dto.search.GroupFilter;
import it.geosolutions.geostore.services.dto.search.NotFilter;
import it.geosolutions.geostore.services.dto.search.OrFilter;
import it.geosolutions.geostore.services.dto.search.SearchFilter;
import it.geosolutions.geostore.services.dto.search.SearchOperator;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.InternalErrorServiceEx;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.Date;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Class SearchConverter.
 *
 * @author ETj (etj at geo-solutions.it)
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public class SearchConverter implements FilterVisitor {

    private static final Map<SearchOperator, Integer> ops_rest_trg;

    private static final Logger LOGGER = LogManager.getLogger(SearchConverter.class);

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss[.SSS]");

    static {
        Map<SearchOperator, Integer> ops = new EnumMap<>(SearchOperator.class);
        ops.put(SearchOperator.EQUAL_TO, Filter.OP_EQUAL);
        ops.put(SearchOperator.GREATER_THAN_OR_EQUAL_TO, Filter.OP_GREATER_OR_EQUAL);
        ops.put(SearchOperator.GREATER_THAN, Filter.OP_GREATER_THAN);
        ops.put(SearchOperator.IS_NOT_NULL, Filter.OP_NOT_NULL);
        ops.put(SearchOperator.IS_NULL, Filter.OP_NULL);
        ops.put(SearchOperator.LESS_THAN, Filter.OP_LESS_THAN);
        ops.put(SearchOperator.LESS_THAN_OR_EQUAL_TO, Filter.OP_LESS_OR_EQUAL);
        ops.put(SearchOperator.LIKE, Filter.OP_LIKE);
        ops.put(SearchOperator.ILIKE, Filter.OP_ILIKE);
        ops.put(SearchOperator.IN, Filter.OP_IN);

        ops_rest_trg = Collections.unmodifiableMap(ops);
    }

    /**
     * @param filter
     * @return Search
     * @throws BadRequestServiceEx
     * @throws InternalErrorServiceEx
     */
    public static Search convert(SearchFilter filter)
            throws BadRequestServiceEx, InternalErrorServiceEx {

        Search trgSearch = new Search(Resource.class);

        if (filter != null) {
            SearchConverter sc = new SearchConverter();
            filter.accept(sc);

            trgSearch.addFilter(sc.trgFilter);
        }

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("TRG Search  --> " + trgSearch);
        }

        return trgSearch;
    }

    private Filter trgFilter;

    private SearchConverter() {}

    @Override
    public void visit(AndFilter filter) throws BadRequestServiceEx, InternalErrorServiceEx {
        trgFilter = Filter.and();

        for (SearchFilter searchFilter : filter.getFilters()) {
            SearchConverter sc = new SearchConverter();
            searchFilter.accept(sc);
            trgFilter.add(sc.trgFilter);
        }
    }

    @Override
    public void visit(OrFilter filter) throws BadRequestServiceEx, InternalErrorServiceEx {
        trgFilter = Filter.or();

        for (SearchFilter searchFilter : filter.getFilters()) {
            SearchConverter sc = new SearchConverter();
            searchFilter.accept(sc);
            trgFilter.add(sc.trgFilter);
        }
    }

    @Override
    public void visit(NotFilter filter) throws BadRequestServiceEx, InternalErrorServiceEx {
        SearchFilter notFilter = filter.getFilter();

        SearchConverter sc = new SearchConverter();
        notFilter.accept(sc);

        trgFilter = Filter.not(sc.trgFilter);
    }

    /**
     * This is a leaf filter.
     *
     * @throws BadRequestServiceEx
     * @throws InternalErrorServiceEx
     */
    @Override
    public void visit(AttributeFilter filter) throws BadRequestServiceEx, InternalErrorServiceEx {

        if ((filter.getType() != null)
                && (filter.getName() != null)
                && (filter.getOperator() != null)
                && (filter.getValue() != null)) {

            Integer op = calculateOperator(filter.getOperator());

            String fieldValueName;
            Object value;

            switch (filter.getType()) {
                case DATE:
                    fieldValueName = "dateValue";

                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");

                    try {
                        value = sdf.parse(filter.getValue());
                    } catch (ParseException e) {
                        throw new InternalErrorServiceEx("Error parsing attribute date value");
                    }

                    break;
                case NUMBER:
                    fieldValueName = "numberValue";

                    try {
                        value = Double.valueOf(filter.getValue());
                    } catch (NumberFormatException ex) {
                        throw new InternalErrorServiceEx("Error parsing attribute number value");
                    }

                    break;
                case STRING:
                    fieldValueName = "textValue";
                    value = filter.getValue();

                    break;
                default:
                    throw new IllegalStateException("Unknown type " + filter.getType());
            }

            trgFilter =
                    Filter.some(
                            "attribute",
                            Filter.and(
                                    Filter.equal("name", filter.getName()),
                                    new Filter(fieldValueName, value, op)));

        } else {
            throw new BadRequestServiceEx("Bad payload. One or more field are missing");
        }
    }

    /**
     * This is a leaf filter.
     *
     * @throws InternalErrorServiceEx
     */
    @Override
    public void visit(FieldFilter filter) throws InternalErrorServiceEx {
        String property = filter.getField().getFieldName();
        String value = filter.getValue();
        Class<?> type = filter.getField().getType();

        Filter f = new Filter();

        Integer operator = calculateOperator(filter.getOperator());

        f.setProperty(property);
        f.setOperator(operator);

        if (type == Date.class) {
            try {
                value = value.replace("T", " ");
                f.setValue(
                        Date.from(
                                LocalDateTime.parse(value, DATE_FORMATTER)
                                        .atZone(ZoneOffset.systemDefault())
                                        .toInstant()));
            } catch (DateTimeParseException e) {
                throw new InternalErrorServiceEx("Error parsing attribute date value");
            }
        } else if (type == Long.class) {
            try {
                f.setValue(Long.parseLong(value));
            } catch (NumberFormatException e) {
                throw new InternalErrorServiceEx("Error parsing attribute long value");
            }
        } else {
            f.setValue(value);
        }

        trgFilter = f;
    }

    /** This is a leaf filter. */
    @Override
    public void visit(CategoryFilter filter) {
        CategoryFilter.checkOperator(filter.getOperator());

        Integer operator = calculateOperator(filter.getOperator());

        Filter f = new Filter();
        f.setOperator(operator);
        f.setProperty("category.name");
        f.setValue(filter.getName());

        trgFilter = f;
    }

    @Override
    public void visit(AssociatedEntityFilter filter) {

        SearchOperator searchOperator = filter.getOperator();
        List<String> values = filter.values();

        Integer operator = calculateOperator(searchOperator);

        Filter f = new Filter();
        f.setOperator(operator);
        f.setProperty(filter.property());
        f.setValue(calculateOperatorValue(searchOperator, values));

        trgFilter = f;
    }

    @Override
    public void visit(GroupFilter filter) {

        SearchOperator searchOperator = filter.getOperator();
        List<String> values = filter.values();

        int operator = calculateOperator(searchOperator);

        Object value = calculateOperatorValue(searchOperator, values);

        Filter propertyFilter = new Filter();
        propertyFilter.setOperator(operator);
        propertyFilter.setProperty(filter.property());
        propertyFilter.setValue(value);

        Filter additionalPropertyFilter = new Filter();
        additionalPropertyFilter.setOperator(operator);
        additionalPropertyFilter.setProperty(filter.additionalProperty());
        additionalPropertyFilter.setValue(value);

        trgFilter = Filter.or(propertyFilter, additionalPropertyFilter);
    }

    private Integer calculateOperator(SearchOperator filter) {
        Integer operator = ops_rest_trg.get(filter);
        if (operator == null) {
            throw new IllegalStateException("Unknown op " + filter);
        }
        return operator;
    }

    private Object calculateOperatorValue(SearchOperator searchOperator, List<String> values) {
        if (SearchOperator.IN == searchOperator) {
            return values;
        } else {
            return values.get(0);
        }
    }
}
