/*
 * Copyright (C) 2026 GeoSolutions S.A.S.
 * http://www.geo-solutions.it
 *
 * GPLv3 + Classpath exception
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 */
package it.geosolutions.geostore.services.rest.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserAttribute;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.services.UserService;
import it.geosolutions.geostore.services.rest.exception.ForbiddenErrorWebEx;

import jakarta.ws.rs.core.SecurityContext;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;

/** Regression tests for authorization and authentication-token attributes in user updates. */
class RESTUserServiceImplUpdateAuthorizationTest {

    private static final long ADMIN_ID = 1L;
    private static final long USER_ID = 2L;

    private UserService userService;
    private RESTUserServiceImpl restService;

    @BeforeEach
    void setUp() {
        userService = mock(UserService.class);
        restService = new RESTUserServiceImpl();
        restService.setUserService(userService);
        RequestContextHolder.setRequestAttributes(
                new ServletRequestAttributes(new MockHttpServletRequest()));
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void regularUserCannotWriteUuidAttributeOnAdministrator() throws Exception {
        when(userService.get(ADMIN_ID)).thenReturn(user("admin", Role.ADMIN, ADMIN_ID));
        User update = new User();
        update.setAttribute(List.of(attribute("UUID", "controlled-token")));

        assertThrows(
                ForbiddenErrorWebEx.class,
                () ->
                        restService.update(
                                securityContext(user("alice", Role.USER, USER_ID)),
                                ADMIN_ID,
                                update));

        verify(userService, never()).updateAttributes(eq(ADMIN_ID), anyList());
        verify(userService, never()).update(org.mockito.ArgumentMatchers.any(User.class));
    }

    @Test
    void regularUserCannotUpdateAnotherAccountEvenWithoutAttributes() throws Exception {
        when(userService.get(ADMIN_ID)).thenReturn(user("admin", Role.ADMIN, ADMIN_ID));

        assertThrows(
                ForbiddenErrorWebEx.class,
                () ->
                        restService.update(
                                securityContext(user("alice", Role.USER, USER_ID)),
                                ADMIN_ID,
                                new User()));

        verify(userService, never()).updateAttributes(anyLong(), anyList());
        verify(userService, never()).update(org.mockito.ArgumentMatchers.any(User.class));
    }

    @Test
    void regularUserCanStillChangeOwnPassword() throws Exception {
        User old = user("alice", Role.USER, USER_ID);
        when(userService.get(USER_ID)).thenReturn(old);
        when(userService.update(old)).thenReturn(USER_ID);
        User update = new User();
        update.setNewPassword("new-password-for-test");

        long result =
                restService.update(
                        securityContext(user("alice", Role.USER, USER_ID)), USER_ID, update);

        assertEquals(USER_ID, result);
        assertEquals("new-password-for-test", old.getNewPassword());
        verify(userService, never()).updateAttributes(eq(USER_ID), anyList());
        verify(userService).update(old);
    }

    @Test
    void regularUserCannotWriteOwnAttributesWhenTokenNameIsConfigurable() throws Exception {
        when(userService.get(USER_ID)).thenReturn(user("alice", Role.USER, USER_ID));
        User update = new User();
        update.setAttribute(List.of(attribute("customTokenAttribute", "test-value")));

        assertThrows(
                ForbiddenErrorWebEx.class,
                () ->
                        restService.update(
                                securityContext(user("alice", Role.USER, USER_ID)),
                                USER_ID,
                                update));

        verify(userService, never()).updateAttributes(eq(USER_ID), anyList());
        verify(userService, never()).update(org.mockito.ArgumentMatchers.any(User.class));
    }

    @Test
    void administratorCanUpdateOrdinaryAttributes() throws Exception {
        User target = user("alice", Role.USER, USER_ID);
        when(userService.get(USER_ID)).thenReturn(target);
        UserAttribute department = attribute("department", "maps");
        User update = new User();
        update.setAttribute(List.of(department));

        long result =
                restService.update(
                        securityContext(user("admin", Role.ADMIN, ADMIN_ID)), USER_ID, update);

        assertEquals(-1L, result);
        verify(userService).updateAttributes(USER_ID, List.of(attribute("department", "maps")));
    }

    @Test
    void administratorUpdateIgnoresRequestedUuidAndKeepsTheStoredOne() throws Exception {
        User target = user("alice", Role.USER, USER_ID);
        target.setAttribute(
                List.of(attribute("UUID", "stored-uuid"), attribute("department", "old")));
        when(userService.get(USER_ID)).thenReturn(target);
        User update = new User();
        update.setAttribute(
                List.of(attribute("UUID", "requested-uuid"), attribute("department", "maps")));

        restService.update(securityContext(user("admin", Role.ADMIN, ADMIN_ID)), USER_ID, update);

        verify(userService)
                .updateAttributes(
                        USER_ID,
                        List.of(attribute("department", "maps"), attribute("UUID", "stored-uuid")));
    }

    @Test
    void administratorAttributeUpdateKeepsStoredUuid() throws Exception {
        User target = user("alice", Role.USER, USER_ID);
        target.setAttribute(
                List.of(attribute("UUID", "stored-uuid"), attribute("department", "old")));
        when(userService.get(USER_ID)).thenReturn(target);
        User update = new User();
        update.setAttribute(List.of(attribute("department", "maps")));

        restService.update(securityContext(user("admin", Role.ADMIN, ADMIN_ID)), USER_ID, update);

        verify(userService)
                .updateAttributes(
                        USER_ID,
                        List.of(attribute("department", "maps"), attribute("UUID", "stored-uuid")));
    }

    @Test
    void uuidOnlyRequestLeavesAttributesUnchanged() throws Exception {
        User target = user("alice", Role.USER, USER_ID);
        target.setAttribute(List.of(attribute("UUID", "stored-uuid")));
        when(userService.get(USER_ID)).thenReturn(target);
        User update = new User();
        update.setAttribute(List.of(attribute("UUID", "requested-uuid")));

        restService.update(securityContext(user("admin", Role.ADMIN, ADMIN_ID)), USER_ID, update);

        verify(userService, never()).updateAttributes(anyLong(), anyList());
    }

    private static User user(String name, Role role, long id) {
        User user = new User();
        user.setName(name);
        user.setRole(role);
        user.setId(id);
        return user;
    }

    private static UserAttribute attribute(String name, String value) {
        UserAttribute attribute = new UserAttribute();
        attribute.setName(name);
        attribute.setValue(value);
        return attribute;
    }

    private static SecurityContext securityContext(User user) {
        SecurityContext context = mock(SecurityContext.class);
        when(context.getUserPrincipal())
                .thenReturn(new UsernamePasswordAuthenticationToken(user, "token", List.of()));
        return context;
    }
}
