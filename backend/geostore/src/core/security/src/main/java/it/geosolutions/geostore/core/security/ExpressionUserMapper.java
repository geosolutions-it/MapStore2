/* ====================================================================
 *
 * Copyright (C) 2015 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.core.security;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserAttribute;

import org.springframework.expression.Expression;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Implementation of UserMapper that maps attributes from a generic object to GeoStore User
 * attributes. Mappings are expressed using SpEL expressions.
 *
 * <p>Inherited classes should add their propertyAccessor implementations to the evaluationContext.
 *
 * @author Mauro Bartolomeoli
 */
public abstract class ExpressionUserMapper implements UserMapper {
    Map<String, String> attributeMappings;

    public static SpelExpressionParser parser = new SpelExpressionParser();

    protected StandardEvaluationContext evaluationContext = new StandardEvaluationContext();

    /**
     * @param attributeMappings maps attribute names to SpEL expressions (using a
     *     UserDetailsWithAttributes source)
     */
    public ExpressionUserMapper(Map<String, String> attributeMappings) {
        this.attributeMappings = attributeMappings;
    }

    @Override
    /**
     * If details is a UserDetailsWithAttributes object, its attributes are mapped to User
     * attributes. Each mapping is an SpEL expression using the UserDetailsWithAttributes as a
     * source.
     */
    public void mapUser(Object details, User user) {
        List<UserAttribute> attributes = new ArrayList<UserAttribute>();
        details = preProcessDetails(details);
        for (String attributeName : attributeMappings.keySet()) {

            Expression exp = parser.parseExpression(attributeMappings.get(attributeName));
            UserAttribute userAttribute = new UserAttribute();
            userAttribute.setName(attributeName);
            Object value = exp.getValue(evaluationContext, details);
            userAttribute.setValue(value == null ? null : value.toString());
            attributes.add(userAttribute);
        }
        user.setAttribute(attributes);
    }

    protected Object preProcessDetails(Object details) {
        return details;
    }
}
