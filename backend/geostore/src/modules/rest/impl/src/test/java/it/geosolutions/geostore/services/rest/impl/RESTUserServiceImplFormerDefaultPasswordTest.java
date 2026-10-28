package it.geosolutions.geostore.services.rest.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.services.UserService;
import it.geosolutions.geostore.services.rest.exception.BadRequestWebEx;

import jakarta.ws.rs.core.SecurityContext;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * The former sample pairs are publicly known, so the REST API must not set them as a new password.
 */
public class RESTUserServiceImplFormerDefaultPasswordTest {

    private UserService userService;
    private RESTUserServiceImpl restService;

    @BeforeEach
    void setUp() {
        userService = mock(UserService.class);
        restService = new RESTUserServiceImpl();
        restService.setUserService(userService);
        // update() records the caller's address from the current request.
        RequestContextHolder.setRequestAttributes(
                new ServletRequestAttributes(new MockHttpServletRequest()));
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    public void createWithFormerDefaultPairIsRejected() throws Exception {
        for (String name : new String[] {"admin", "user", " user "}) {
            User user = new User();
            user.setName(name);
            user.setNewPassword(name.trim());
            user.setRole(Role.USER);

            assertThrows(BadRequestWebEx.class, () -> restService.insert(null, user));
        }
        verify(userService, never()).insert(any());
    }

    @Test
    public void createWithOtherPasswordIsAccepted() throws Exception {
        User user = new User();
        user.setName("user");
        user.setNewPassword("a-different-password");
        user.setRole(Role.USER);
        when(userService.insert(user)).thenReturn(5L);

        assertEquals(5L, restService.insert(null, user));
    }

    @Test
    public void adminCannotSetFormerDefaultPassword() throws Exception {
        for (String name : new String[] {"admin", "user"}) {
            User stored = storedUser(9L, name);
            User change = new User();
            change.setNewPassword(name);

            assertThrows(
                    BadRequestWebEx.class,
                    () ->
                            restService.update(
                                    as(storedUser(1L, "site-admin"), Role.ADMIN), 9L, change));
            verify(userService, never()).update(stored);
        }
    }

    @Test
    public void userCannotSetFormerDefaultPasswordOnOwnAccount() throws Exception {
        User stored = storedUser(9L, "user");
        User change = new User();
        change.setNewPassword("user");

        assertThrows(
                BadRequestWebEx.class, () -> restService.update(as(stored, Role.USER), 9L, change));
        verify(userService, never()).update(stored);
    }

    @Test
    public void otherPasswordChangeIsAccepted() throws Exception {
        User stored = storedUser(9L, "admin");
        User change = new User();
        change.setNewPassword("a-different-password");
        when(userService.update(stored)).thenReturn(9L);

        assertEquals(9L, restService.update(as(stored, Role.ADMIN), 9L, change));
        assertEquals("a-different-password", stored.getNewPassword());
    }

    private User storedUser(long id, String name) throws Exception {
        User user = new User();
        user.setId(id);
        user.setName(name);
        user.setRole(Role.ADMIN);
        user.setEnabled(false);
        when(userService.get(id)).thenReturn(user);
        return user;
    }

    private static SecurityContext as(User user, Role role) {
        user.setRole(role);
        SecurityContext sc = mock(SecurityContext.class);
        when(sc.getUserPrincipal()).thenReturn(new UsernamePasswordAuthenticationToken(user, null));
        return sc;
    }
}
