/* ====================================================================
 *
 * Copyright (C) 2026 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.impl;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import it.geosolutions.geostore.services.UserService;
import it.geosolutions.geostore.services.rest.exception.NotFoundWebEx;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Verifies the {@code cascadeResourceDelete} query parameter of {@code DELETE /users/user/{id}}
 * (support #5817): the raw comma-separated string is forwarded as-is to {@link
 * UserService#delete(long, String)}.
 */
public class RESTUserServiceImplCascadeDeleteTest {

    private UserService userService;
    private RESTUserServiceImpl restService;

    @BeforeEach
    void setUp() {
        userService = mock(UserService.class);
        restService = new RESTUserServiceImpl();
        restService.setUserService(userService);
    }

    @Test
    public void testDeleteWithoutCascadeParameter() {
        when(userService.delete(7L, (String) null)).thenReturn(true);

        restService.delete(null, 7L, null);

        verify(userService).delete(7L, (String) null);
    }

    @Test
    public void testDeleteWithBlankCascadeParameter() {
        when(userService.delete(7L, "   ")).thenReturn(true);

        restService.delete(null, 7L, "   ");

        verify(userService).delete(7L, "   ");
    }

    @Test
    public void testDeleteWithSingleCategory() {
        when(userService.delete(7L, "USERSESSION")).thenReturn(true);

        restService.delete(null, 7L, "USERSESSION");

        verify(userService).delete(7L, "USERSESSION");
    }

    @Test
    public void testDeleteWithMultipleCategoriesAndBlankEntries() {
        when(userService.delete(7L, " USERSESSION , TEMP ,, ")).thenReturn(true);

        restService.delete(null, 7L, " USERSESSION , TEMP ,, ");

        verify(userService).delete(7L, " USERSESSION , TEMP ,, ");
    }

    @Test
    public void testDeleteUserNotFound() {
        when(userService.delete(99L, (String) null)).thenReturn(false);

        assertThrows(NotFoundWebEx.class, () -> restService.delete(null, 99L, null));
    }
}
