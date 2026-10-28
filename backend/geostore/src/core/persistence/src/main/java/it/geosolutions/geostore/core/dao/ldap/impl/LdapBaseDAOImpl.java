/*
 *  Copyright (C) 2019 GeoSolutions S.A.S.
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

package it.geosolutions.geostore.core.dao.ldap.impl;

import com.googlecode.genericdao.search.Filter;
import com.googlecode.genericdao.search.ISearch;

import org.apache.commons.lang3.StringUtils;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.ldap.control.SortControlDirContextProcessor;
import org.springframework.ldap.core.ContextSource;
import org.springframework.ldap.core.DirContextProcessor;
import org.springframework.ldap.core.LdapTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.naming.directory.DirContext;

/**
 * Class LdapBaseDAOImpl. Base class for LDAP (read-only) based DAOs.
 *
 * @author Mauro Bartolomeoli (mauro.bartolomeoli at geo-solutions.it)
 */
public abstract class LdapBaseDAOImpl {

    public static final class NullDirContextProcessor implements DirContextProcessor {
        public void postProcess(DirContext ctx) {
            // Do nothing
        }

        public void preProcess(DirContext ctx) {
            // Do nothing
        }
    }

    protected String searchBase = "";
    protected String baseFilter = "cn=*";
    protected String nameAttribute = "cn";
    protected String descriptionAttribute = "description";
    protected boolean sortEnabled = false;

    protected ContextSource contextSource;
    protected LdapTemplate template;

    public LdapBaseDAOImpl(ContextSource contextSource) {
        this.contextSource = contextSource;
        template = new LdapTemplate(contextSource);
    }

    public String getSearchBase() {
        return searchBase;
    }

    /**
     * LDAP root for all searches.
     *
     * @param searchBase
     */
    public void setSearchBase(String searchBase) {
        this.searchBase = searchBase;
    }

    public String getBaseFilter() {
        return baseFilter;
    }

    /**
     * Filter applied to all searches (eventually combined with a more specific filter).
     *
     * @param filter
     */
    public void setBaseFilter(String filter) {
        this.baseFilter = filter;
    }

    public String getNameAttribute() {
        return nameAttribute;
    }

    /**
     * Attribute to be mapped to the GeoStore object name.
     *
     * @param nameAttribute
     */
    public void setNameAttribute(String nameAttribute) {
        this.nameAttribute = nameAttribute;
    }

    public String getDescriptionAttribute() {
        return descriptionAttribute;
    }

    /**
     * Attribute to be mapped to the GeoStore object description.
     *
     * @param nameAttribute
     */
    public void setDescriptionAttribute(String descriptionAttribute) {
        this.descriptionAttribute = descriptionAttribute;
    }

    /**
     * Builds a proper processor for the given search. Implements sorting if enabled.
     *
     * @param search
     * @return
     */
    protected DirContextProcessor getProcessorForSearch(ISearch search) {
        if (sortEnabled && search.getSorts() != null && search.getSorts().size() == 1) {
            return new SortControlDirContextProcessor(nameAttribute);
        }
        return new NullDirContextProcessor();
    }

    public boolean isSortEnabled() {
        return sortEnabled;
    }

    /**
     * Enables LDAP-side sorting (to be enabled if supported by the LDAP server).
     *
     * @param sortEnabled
     */
    public void setSortEnabled(boolean sortEnabled) {
        this.sortEnabled = sortEnabled;
    }

    /**
     * Returns a combined filter (AND) from the given two. If any is empty, the other filter is
     * returned.
     *
     * @param baseFilter
     * @param ldapFilter
     * @return
     */
    protected String combineFilters(String baseFilter, String ldapFilter) {
        if ("".equals(baseFilter)) {
            return ldapFilter;
        }
        if ("".equals(ldapFilter)) {
            return baseFilter;
        }
        return "(& (" + baseFilter + ") (" + ldapFilter + "))";
    }

    /**
     * Creates an LDAP filter for a GenericDAO search.
     *
     * @param search
     * @return
     */
    protected String getLdapFilter(ISearch search, Map<String, Object> propertyMapper) {
        String currentFilter = "";
        for (Filter filter : search.getFilters()) {
            currentFilter = combineFilters(currentFilter, getLdapFilter(filter, propertyMapper));
        }
        if ("".equals(currentFilter)) {
            return "(objectClass=*)";
        }
        return currentFilter;
    }

    /**
     * Creates an LDAP filter for a GenericDAO filter .
     *
     * @param filter
     * @return
     */
    private String getLdapFilter(Filter filter, Map<String, Object> propertyMapper) {
        String property = filter.getProperty();
        Map<String, Object> mapper = propertyMapper;
        if (propertyMapper.containsKey(property)) {
            if (propertyMapper.get(property) instanceof String) {
                property = (String) propertyMapper.get(property);
            } else if (propertyMapper.get(property) instanceof Map) {
                mapper = (Map) propertyMapper.get(property);
            }
        }
        // we support the minimum set of operators used by GeoStore user and group services
        switch (filter.getOperator()) {
            case Filter.OP_EQUAL:
                return property + "=" + filter.getValue().toString();
            case Filter.OP_SOME:
                return getLdapFilter((Filter) filter.getValue(), mapper);
            case Filter.OP_ILIKE:
                return property + "=" + filter.getValue().toString().replaceAll("[%]", "*");
            case Filter.OP_IN:
                return getInLdapFilter(property, (List) filter.getValue());
                // TODO: implement all operators
        }
        return "";
    }

    /**
     * Builds a filter for property in (values) search type. This is done by creating a list of
     * property=value combined by or (|).
     *
     * @param property
     * @param values
     * @return
     */
    private String getInLdapFilter(String property, List values) {
        List<String> filters = new ArrayList<String>();
        for (Object value : values) {
            filters.add("(" + property + "=" + value.toString() + ")");
        }
        return StringUtils.join(filters, "|");
    }

    /**
     * Returns true if the given search has one or more filters on a nested object.
     *
     * @param search
     * @return
     */
    protected boolean isNested(ISearch search) {
        boolean found = false;
        for (Filter filter : search.getFilters()) {
            found = found || isNested(filter);
        }
        return found;
    }

    /**
     * Returns true if the given filter works on a nested object.
     *
     * @param filter
     * @return
     */
    private boolean isNested(Filter filter) {
        if (filter.getOperator() == Filter.OP_SOME || filter.getOperator() == Filter.OP_ALL) {
            return true;
        }
        return false;
    }

    /**
     * If the given search has filters working on nested objects, replaces them with the nested
     * filter.
     *
     * @param search
     * @return
     */
    protected ISearch getNestedSearch(ISearch search) {
        List<Filter> newFilters = new ArrayList<>();
        for (Filter filter : search.getFilters()) {
            Filter nestedFilter = getNestedFilter(filter);
            if (nestedFilter != null) {
                newFilters.add(nestedFilter);
            } else {
                newFilters.add(filter);
            }
        }
        search.getFilters().clear();
        search.getFilters().addAll(newFilters);
        return search;
    }

    /**
     * Returns the internal filter of a nested filter, null otherwise.
     *
     * @param filter
     * @return
     */
    protected Filter getNestedFilter(Filter filter) {
        if (filter.getOperator() == Filter.OP_SOME || filter.getOperator() == Filter.OP_ALL) {
            return (Filter) filter.getValue();
        }
        return null;
    }

    /**
     * Creates an SpEL expression for a GenericDAO search.
     *
     * @param search
     * @return
     */
    protected Expression getSearchExpression(ISearch search) {
        String expression = "";
        for (Filter filter : search.getFilters()) {
            expression = combineExpressions(expression, getSearchExpression(filter));
        }
        if ("".equals(expression)) {
            expression = "true";
        }
        ExpressionParser parser = new SpelExpressionParser();
        return parser.parseExpression(expression);
    }

    /**
     * Returns a combined expression (AND) from the given two. If any is empty, the other filter is
     * returned.
     *
     * @param expression
     * @param searchExpression
     * @return
     */
    protected String combineExpressions(String expression, String searchExpression) {
        if ("".equals(expression)) {
            return searchExpression;
        }
        if ("".equals(searchExpression)) {
            return expression;
        }
        return "(" + expression + ") && (" + searchExpression + ")";
    }

    /**
     * Creates an SpEL expression for a GenericDAO filter.
     *
     * @param filter
     * @return
     */
    private String getSearchExpression(Filter filter) {
        switch (filter.getOperator()) {
            case Filter.OP_EQUAL:
                return filter.getProperty() + "=='" + filter.getValue().toString() + "'";
            case Filter.OP_ILIKE:
                return filter.getProperty()
                        + " matches '^"
                        + filter.getValue().toString().replace("*", ".*")
                        + "$'";
                // TODO: implement all operators
        }
        return "";
    }
}
