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

import static org.junit.Assert.*;

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
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class TokenAuthenticationFilterTest {
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
    private TokenAuthenticationFilter filter;
    private Map<String, Authentication> tokens;

    @Before
    public void setUp() {
        tokens = new HashMap<String, Authentication>();
        tokens.put(SAMPLE_TOKEN, SAMPLE_AUTH);

        filter =
                new TokenAuthenticationFilter() {

                    @Override
                    protected Authentication checkToken(String token) {
                        return tokens.get(token);
                    }
                };

        filter.setUserService(new MockedUserService());
        request = Mockito.mock(HttpServletRequest.class);
        response = Mockito.mock(HttpServletResponse.class);
        chain = Mockito.mock(FilterChain.class);
    }

    @After
    public void tearDown() {
        SecurityContextHolder.getContext().setAuthentication(null);
    }

    @Test
    public void testExistingToken() throws IOException, ServletException {
        Mockito.when(request.getHeader(DEFAULT_HEADER)).thenReturn(DEFAULT_PREFIX + SAMPLE_TOKEN);
        filter.doFilter(request, response, chain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(SAMPLE_USER, SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @Test
    public void testUnknownToken() throws IOException, ServletException {
        Mockito.when(request.getHeader(DEFAULT_HEADER)).thenReturn(DEFAULT_PREFIX + WRONG_TOKEN);
        filter.doFilter(request, response, chain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    public void testCustomHeader() throws IOException, ServletException {
        Mockito.when(request.getHeader("Custom")).thenReturn(DEFAULT_PREFIX + SAMPLE_TOKEN);
        filter.setTokenHeader("Custom");
        filter.doFilter(request, response, chain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(SAMPLE_USER, SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @Test
    public void testCustomPrefix() throws IOException, ServletException {
        Mockito.when(request.getHeader(DEFAULT_HEADER)).thenReturn("Custom" + SAMPLE_TOKEN);
        filter.setTokenPrefix("Custom");
        filter.doFilter(request, response, chain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(SAMPLE_USER, SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @Test
    public void testCacheExpiration() throws IOException, ServletException, InterruptedException {
        Mockito.when(request.getHeader(DEFAULT_HEADER)).thenReturn(DEFAULT_PREFIX + SAMPLE_TOKEN);
        filter.setCacheExpiration(1);
        filter.doFilter(request, response, chain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(SAMPLE_USER, SecurityContextHolder.getContext().getAuthentication().getName());

        tokens.clear();
        SecurityContextHolder.getContext().setAuthentication(null);
        filter.doFilter(request, response, chain);
        // still there, cached value
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());

        // wait for cache expiration
        Thread.sleep(2000);

        SecurityContextHolder.getContext().setAuthentication(null);
        filter.doFilter(request, response, chain);
        // gone
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
