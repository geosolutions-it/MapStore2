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
package it.geosolutions.geostore.services.rest.security;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.services.InMemoryUserSessionServiceImpl;
import it.geosolutions.geostore.services.dto.UserSessionImpl;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;
import it.geosolutions.geostore.services.rest.utils.MockedUserService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.*;

public class SessionTokenAuthenticationFilterTest {
    private static final String DEFAULT_PREFIX = "Bearer ";

    private static final String DEFAULT_HEADER = "Authorization";
    private static final String SAMPLE_USER = "user";
    private static final String SAMPLE_TOKEN = UUID.randomUUID().toString();
    private static final String WRONG_TOKEN = UUID.randomUUID().toString();
    private static final Authentication SAMPLE_AUTH =
            new UsernamePasswordAuthenticationToken(SAMPLE_USER, "");
    HttpServletRequest request = null;
    HttpServletResponse response = null;
    FilterChain chain = null;
    private SessionTokenAuthenticationFilter filter;
    private Map<String, Authentication> tokens;

    @Before
    public void setUp() {
        tokens = new HashMap<String, Authentication>();
        tokens.put(SAMPLE_TOKEN, SAMPLE_AUTH);

        filter = new SessionTokenAuthenticationFilter();

        filter.setUserService(new MockedUserService());
        filter.setUserSessionService(new InMemoryUserSessionServiceImpl());
        request = Mockito.mock(HttpServletRequest.class);
        response = Mockito.mock(HttpServletResponse.class);
        chain = Mockito.mock(FilterChain.class);
    }

    @After
    public void tearDown() {
        SecurityContextHolder.getContext().setAuthentication(null);
    }

    /**
     * Checks that when using an external auth service (like LDAP) the user object is anyway
     * retrieved using username.
     *
     * @throws IOException
     * @throws ServletException
     * @throws BadRequestServiceEx
     * @throws NotFoundServiceEx
     */
    @Test
    public void userWorksWithNameOnlyTest()
            throws IOException, ServletException, BadRequestServiceEx, NotFoundServiceEx {
        User user = new User();
        user.setName(SAMPLE_USER);
        user.setRole(Role.USER);
        filter.setCacheExpiration(1);
        // different users, same name
        User sessionUser = new User();
        sessionUser.setName(SAMPLE_USER);
        sessionUser.setRole(Role.USER);
        // here the mock service sets the id.
        filter.getUserService().insert(user);

        Mockito.when(request.getHeader(DEFAULT_HEADER)).thenReturn(DEFAULT_PREFIX + SAMPLE_TOKEN);

        Calendar expires = new GregorianCalendar();
        expires.add(Calendar.SECOND, 60 * 60 * 24 * 15);

        filter.getUserSessionService()
                .registerNewSession(SAMPLE_TOKEN, new UserSessionImpl(sessionUser, expires));

        filter.doFilter(request, response, chain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        User authUser =
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        assertEquals(SAMPLE_USER, authUser.getName());
        assertNotNull(authUser.getId());
    }

    @Test
    public void userWorksWithFakeIdTest()
            throws IOException, ServletException, BadRequestServiceEx, NotFoundServiceEx {
        User user = new User();
        user.setName(SAMPLE_USER);
        user.setRole(Role.USER);
        filter.setCacheExpiration(1);
        // different users, same name
        User sessionUser = new User();
        sessionUser.setId(-1L);
        sessionUser.setName(SAMPLE_USER);
        sessionUser.setRole(Role.USER);
        // here the mock service sets the id.
        filter.getUserService().insert(user);

        Mockito.when(request.getHeader(DEFAULT_HEADER)).thenReturn(DEFAULT_PREFIX + SAMPLE_TOKEN);

        Calendar expires = new GregorianCalendar();
        expires.add(Calendar.SECOND, 60 * 60 * 24 * 15);

        filter.getUserSessionService()
                .registerNewSession(SAMPLE_TOKEN, new UserSessionImpl(sessionUser, expires));

        filter.doFilter(request, response, chain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        User authUser =
                (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        assertEquals(SAMPLE_USER, authUser.getName());
        assertNotNull(authUser.getId());
    }
}
