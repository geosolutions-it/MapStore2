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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Map based implementation of GrantedAuthoritiesMapper. *
 *
 * @author Mauro Bartolomeoli
 */
public class SimpleGrantedAuthoritiesMapper implements GrantedAuthoritiesMapper {

    private Map<String, String> mappings = new HashMap<>();

    /** Do not consider authorities that do not exist in the mapping */
    private boolean dropUnmapped = false;

    private static final Log logger = LogFactory.getLog(SimpleGrantedAuthoritiesMapper.class);

    public SimpleGrantedAuthoritiesMapper(Map<String, String> mappings) {
        super();
        this.mappings = mappings;
    }

    @Override
    public Collection<? extends GrantedAuthority> mapAuthorities(
            Collection<? extends GrantedAuthority> authorities) {
        if (mappings.isEmpty()) {
            return authorities;
        }

        List<GrantedAuthority> result = new ArrayList<>();

        for (GrantedAuthority authority : authorities) {
            String src = authority.getAuthority();
            if (mappings.containsKey(src)) {
                String dst = mappings.get(authority.getAuthority());
                result.add(new SimpleGrantedAuthority(dst));
                if (logger.isDebugEnabled()) {
                    logger.debug("Mapping authority: " + src + " --> " + dst);
                }
            } else if (dropUnmapped) {
                if (logger.isDebugEnabled()) {
                    logger.debug("Dropping unmapped authority: " + src);
                }
            } else {
                result.add(authority);
                if (logger.isDebugEnabled()) {
                    logger.debug("Adding unmapped authority: " + src);
                }
            }
        }
        return result;
    }

    public void setDropUnmapped(boolean dropUnmapped) {
        this.dropUnmapped = dropUnmapped;
    }
}
