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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.PropertyAccessor;
import org.springframework.expression.TypedValue;

import java.util.Map;

/**
 * Maps user attributes for a JSON object.
 *
 * @author Geo
 */
public class JSONExpressionUserMapper extends ExpressionUserMapper {

    private static final Logger LOGGER = LogManager.getLogger(JSONExpressionUserMapper.class);

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public JSONExpressionUserMapper(Map<String, String> attributeMappings) {
        super(attributeMappings);
        // property accessor for Map attributes (read-only)
        evaluationContext.addPropertyAccessor(
                new PropertyAccessor() {

                    @Override
                    public void write(
                            EvaluationContext ctx, Object target, String name, Object value) {}

                    @Override
                    public TypedValue read(EvaluationContext ctx, Object target, String name) {
                        return new TypedValue(((Map<?, ?>) target).get(name));
                    }

                    @Override
                    public Class[] getSpecificTargetClasses() {
                        return new Class[] {Map.class};
                    }

                    @Override
                    public boolean canWrite(EvaluationContext ctx, Object target, String name) {
                        return false;
                    }

                    @Override
                    public boolean canRead(EvaluationContext ctx, Object target, String name) {
                        return target instanceof Map;
                    }
                });
    }

    @Override
    protected Object preProcessDetails(Object details) {
        if (details instanceof String) {
            try {
                details = OBJECT_MAPPER.readValue((String) details, Map.class);
            } catch (JsonProcessingException e) {
                LOGGER.warn("Could not parse JSON details", e);
            }
        }
        return super.preProcessDetails(details);
    }
}
