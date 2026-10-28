/* ====================================================================
 *
 * Copyright (C) 2025 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.security.oauth2;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import it.geosolutions.geostore.services.rest.IdPLoginService;
import it.geosolutions.geostore.services.rest.security.RestAuthenticationEntryPoint;

import jakarta.ws.rs.core.Response;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Tests that the OIDC callback endpoint surfaces the real authentication failure cause (recorded by
 * the security layer in the {@link RestAuthenticationEntryPoint#OAUTH2_AUTH_ERROR_KEY} request
 * attribute) instead of a generic "No access token found." message.
 */
public class IdPLoginRestCallbackTest {

    private IdPLoginRestImpl loginRest;
    private IdPLoginService loginService;
    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        loginRest = new IdPLoginRestImpl();
        loginService = mock(IdPLoginService.class);
        loginRest.registerService("oidc", loginService);
        request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(
                new ServletRequestAttributes(request, new MockHttpServletResponse()));
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.resetRequestAttributes();
    }

    private void serviceReturns(Response response) {
        when(loginService.doInternalRedirect(any(), any(), eq("oidc"))).thenReturn(response);
    }

    @Test
    void surfacesRecordedFailureCauseOnGenericFailure() {
        request.setAttribute(
                RestAuthenticationEntryPoint.OAUTH2_AUTH_ERROR_KEY,
                "The identity provider rejected the token exchange: invalid_grant");
        serviceReturns(Response.status(500).entity("No access token found.").build());

        Response result = loginRest.callback("oidc");

        assertEquals(500, result.getStatus());
        String body = String.valueOf(result.getEntity());
        assertTrue(body.contains("provider 'oidc'"), "body should name the provider: " + body);
        assertTrue(body.contains("invalid_grant"), "body should contain the cause: " + body);
    }

    @Test
    void keepsSpecificEntityFromLoginService() {
        request.setAttribute(RestAuthenticationEntryPoint.OAUTH2_AUTH_ERROR_KEY, "recorded cause");
        serviceReturns(Response.status(500).entity("a specific failure explanation").build());

        Response result = loginRest.callback("oidc");

        assertEquals("a specific failure explanation", result.getEntity());
    }

    @Test
    void leavesFailureUntouchedWhenNoCauseRecorded() {
        serviceReturns(Response.status(500).entity("No access token found.").build());

        Response result = loginRest.callback("oidc");

        assertEquals(500, result.getStatus());
        assertEquals("No access token found.", result.getEntity());
    }

    @Test
    void successfulCallbackPassesThrough() {
        request.setAttribute(
                RestAuthenticationEntryPoint.OAUTH2_AUTH_ERROR_KEY, "stale error from a sub-call");
        serviceReturns(Response.status(302).build());

        Response result = loginRest.callback("oidc");

        assertEquals(302, result.getStatus());
    }
}
