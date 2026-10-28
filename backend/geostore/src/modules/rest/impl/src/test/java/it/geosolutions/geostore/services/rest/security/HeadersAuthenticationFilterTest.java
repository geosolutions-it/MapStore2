/* ====================================================================
 *
 * Copyright (C) 2019 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.security;

import static org.junit.Assert.*;

import com.google.common.collect.Lists;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.core.security.GrantedAuthoritiesMapper;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;
import it.geosolutions.geostore.services.rest.utils.SpelMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class HeadersAuthenticationFilterTest {
    private static final String SAMPLE_USER = "user";
    private static final String SAMPLE_GROUP1 = "group1";
    private static final String SAMPLE_GROUP2 = "group2";
    private static final String ADMIN_ROLE = "ADMIN";
    private static final String ROLE_GROUP = "MYROLE";
    HttpServletRequest request = null;
    HttpServletResponse response = null;
    FilterChain chain = null;
    private HeadersAuthenticationFilter filter;

    @Before
    public void setUp() {
        SecurityContextHolder.getContext().setAuthentication(null);
        filter = new HeadersAuthenticationFilter();

        request = Mockito.mock(HttpServletRequest.class);
        response = Mockito.mock(HttpServletResponse.class);
        chain = Mockito.mock(FilterChain.class);
    }

    @After
    public void tearDown() {
        SecurityContextHolder.getContext().setAuthentication(null);
    }

    @Test
    public void usernameHeaderAuthentication()
            throws IOException, ServletException, BadRequestServiceEx, NotFoundServiceEx {
        Mockito.when(request.getHeader(HeadersAuthenticationFilter.DEFAULT_USERNAME_HEADER))
                .thenReturn(SAMPLE_USER);

        filter.doFilter(request, response, chain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        User authUser =
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        assertEquals(SAMPLE_USER, authUser.getName());
        assertNotNull(authUser.getId());
    }

    @Test
    public void noAuthenticationWithoutUsernameHeader()
            throws IOException, ServletException, BadRequestServiceEx, NotFoundServiceEx {
        Mockito.when(request.getHeader(HeadersAuthenticationFilter.DEFAULT_USERNAME_HEADER))
                .thenReturn(null);

        filter.doFilter(request, response, chain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    public void usernameAndGroupsHeaderAuthentication()
            throws IOException, ServletException, BadRequestServiceEx, NotFoundServiceEx {
        Mockito.when(request.getHeader(HeadersAuthenticationFilter.DEFAULT_USERNAME_HEADER))
                .thenReturn(SAMPLE_USER);
        Mockito.when(request.getHeader(HeadersAuthenticationFilter.DEFAULT_GROUPS_HEADER))
                .thenReturn(SAMPLE_GROUP1 + "," + SAMPLE_GROUP2);

        filter.doFilter(request, response, chain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        User authUser =
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        assertEquals(2, authUser.getGroups().size());
    }

    @Test
    public void defaultNoPrefixedGroupsHeaderAuthentication()
            throws IOException, ServletException, BadRequestServiceEx, NotFoundServiceEx {
        Mockito.when(request.getHeader(HeadersAuthenticationFilter.DEFAULT_USERNAME_HEADER))
                .thenReturn(SAMPLE_USER);
        Mockito.when(request.getHeader(HeadersAuthenticationFilter.DEFAULT_GROUPS_HEADER))
                .thenReturn(SAMPLE_GROUP1 + "," + "ROLE_" + SAMPLE_GROUP2);

        filter.doFilter(request, response, chain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        User authUser =
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        assertEquals(2, authUser.getGroups().size());
        List<String> groups = new ArrayList<String>();
        groups.add(SAMPLE_GROUP1);
        groups.add("ROLE_" + SAMPLE_GROUP2);
        for (UserGroup ug : authUser.getGroups()) {
            assertTrue(groups.contains(ug.getGroupName()));
        }
    }

    @Test
    public void prefixedGroupsHeaderAuthentication()
            throws IOException, ServletException, BadRequestServiceEx, NotFoundServiceEx {
        filter.setGroupMapper(new SpelMapper("name.replace('ROLE_', '')"));
        Mockito.when(request.getHeader(HeadersAuthenticationFilter.DEFAULT_USERNAME_HEADER))
                .thenReturn(SAMPLE_USER);
        Mockito.when(request.getHeader(HeadersAuthenticationFilter.DEFAULT_GROUPS_HEADER))
                .thenReturn(SAMPLE_GROUP1 + "," + "ROLE_" + SAMPLE_GROUP2);

        filter.doFilter(request, response, chain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        User authUser =
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        assertEquals(2, authUser.getGroups().size());
        List<String> groups = new ArrayList<String>();
        groups.add(SAMPLE_GROUP1);
        groups.add(SAMPLE_GROUP2);
        for (UserGroup ug : authUser.getGroups()) {
            assertTrue(groups.contains(ug.getGroupName()));
        }
    }

    @Test
    public void usernameAndRoleHeaderAuthentication()
            throws IOException, ServletException, BadRequestServiceEx, NotFoundServiceEx {
        Mockito.when(request.getHeader(HeadersAuthenticationFilter.DEFAULT_USERNAME_HEADER))
                .thenReturn(SAMPLE_USER);
        Mockito.when(request.getHeader(HeadersAuthenticationFilter.DEFAULT_ROLE_HEADER))
                .thenReturn(ADMIN_ROLE);

        filter.doFilter(request, response, chain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        User authUser =
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        assertEquals(Role.ADMIN, authUser.getRole());
        assertEquals(
                1, SecurityContextHolder.getContext().getAuthentication().getAuthorities().size());
        assertEquals(
                "ROLE_ADMIN",
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getAuthorities()
                        .iterator()
                        .next()
                        .getAuthority());
    }

    @Test
    public void rolesMapper()
            throws IOException, ServletException, BadRequestServiceEx, NotFoundServiceEx {
        Mockito.when(request.getHeader(HeadersAuthenticationFilter.DEFAULT_USERNAME_HEADER))
                .thenReturn(SAMPLE_USER);
        Mockito.when(request.getHeader(HeadersAuthenticationFilter.DEFAULT_GROUPS_HEADER))
                .thenReturn(ROLE_GROUP);
        filter.setAuthoritiesMapper(
                new GrantedAuthoritiesMapper() {
                    @Override
                    public Collection<? extends GrantedAuthority> mapAuthorities(
                            Collection<? extends GrantedAuthority> authorities) {
                        for (GrantedAuthority authority : authorities) {
                            if (ROLE_GROUP.equals(authority.getAuthority())) {
                                return Lists.newArrayList(new SimpleGrantedAuthority("ADMIN"));
                            }
                        }
                        return Lists.newArrayList();
                    }
                });
        filter.doFilter(request, response, chain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        User authUser =
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        assertEquals(Role.ADMIN, authUser.getRole());
        assertEquals(
                1, SecurityContextHolder.getContext().getAuthentication().getAuthorities().size());
        assertEquals(
                "ROLE_ADMIN",
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getAuthorities()
                        .iterator()
                        .next()
                        .getAuthority());
    }
}
