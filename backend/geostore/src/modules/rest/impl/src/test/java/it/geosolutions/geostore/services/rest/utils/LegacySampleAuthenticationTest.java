package it.geosolutions.geostore.services.rest.utils;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.core.security.password.PwEncoder;
import it.geosolutions.geostore.services.UserService;
import it.geosolutions.geostore.services.rest.security.FormerDefaultPasswordCheck;
import it.geosolutions.geostore.services.rest.security.UserServiceAuthenticationProvider;

import org.apache.cxf.configuration.security.AuthorizationPolicy;
import org.apache.cxf.interceptor.security.AccessDeniedException;
import org.apache.cxf.message.Message;
import org.apache.cxf.message.MessageImpl;
import org.apache.cxf.security.SecurityContext;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.core.LogEvent;
import org.apache.logging.log4j.core.Logger;
import org.apache.logging.log4j.core.appender.AbstractAppender;
import org.apache.logging.log4j.core.config.Property;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Accounts that still have their former default password, or a variant of it differing only in
 * case, spaces or punctuation, cannot log in, and each refusal is logged with the way to fix it.
 */
public class LegacySampleAuthenticationTest {

    private final List<LogEvent> errors = new ArrayList<>();

    private final AbstractAppender capture =
            new AbstractAppender("capture", null, null, true, Property.EMPTY_ARRAY) {
                @Override
                public void append(LogEvent event) {
                    if (event.getLevel() == Level.ERROR) {
                        errors.add(event.toImmutable());
                    }
                }
            };

    private Logger checkLogger;

    @Before
    public void captureSecurityErrors() {
        checkLogger = (Logger) LogManager.getLogger(FormerDefaultPasswordCheck.class);
        capture.start();
        checkLogger.addAppender(capture);
    }

    @After
    public void stopCapturing() {
        checkLogger.removeAppender(capture);
        capture.stop();
    }

    private static User stored(String name, String rawPassword) {
        User user = new User();
        user.setId(1L);
        user.setName(name);
        user.setRole(Role.ADMIN);
        user.setEnabled(true);
        user.setPassword(PwEncoder.encode(rawPassword));
        return user;
    }

    private static UserServiceAuthenticationProvider provider(User account) throws Exception {
        UserService users = mock(UserService.class);
        when(users.get(anyString())).thenReturn(account);
        UserServiceAuthenticationProvider provider = new UserServiceAuthenticationProvider();
        ReflectionTestUtils.setField(provider, "userService", users);
        return provider;
    }

    private static AbstractGeoStoreAuthenticationInterceptor interceptor(User account) {
        return new AbstractGeoStoreAuthenticationInterceptor() {
            @Override
            protected User getUser(String username, Message message) {
                return account;
            }
        };
    }

    private static Message basicAuth(String username, String password) {
        MessageImpl message = new MessageImpl();
        AuthorizationPolicy policy = new AuthorizationPolicy();
        policy.setUserName(username);
        policy.setPassword(password);
        message.put(AuthorizationPolicy.class, policy);
        return message;
    }

    @Test
    public void providerRefusesFormerDefaultPasswordsAndTheirVariants() throws Exception {
        String[][] pairs = {
            {"admin", "admin"},
            {"user", "user"},
            {"admin", "Admin"},
            {"admin", " ADMIN "},
            {"user", "u-s-e-r!"}
        };
        for (String[] pair : pairs) {
            UserServiceAuthenticationProvider provider = provider(stored(pair[0], pair[1]));
            try {
                provider.authenticate(new UsernamePasswordAuthenticationToken(pair[0], pair[1]));
                fail("login accepted for " + pair[0] + "/" + pair[1]);
            } catch (BadCredentialsException expected) {
                // refused like any other bad login
            }
        }
        assertEquals(pairs.length, errors.size());
    }

    @Test
    public void providerStillAuthenticatesTheSameAccountsWithOtherPasswords() throws Exception {
        for (String name : new String[] {"admin", "user"}) {
            UserServiceAuthenticationProvider provider = provider(stored(name, "S0mething-else"));

            Authentication result =
                    provider.authenticate(
                            new UsernamePasswordAuthenticationToken(name, "S0mething-else"));

            assertEquals(name, ((User) result.getPrincipal()).getName());
        }
        assertTrue(errors.isEmpty());
    }

    @Test
    public void providerDoesNotReportWrongPasswordsAsDefaultOnes() throws Exception {
        UserServiceAuthenticationProvider provider = provider(stored("admin", "S0mething-else"));
        try {
            provider.authenticate(new UsernamePasswordAuthenticationToken("admin", "admin"));
            fail("login accepted with a wrong password");
        } catch (BadCredentialsException expected) {
            // a plain bad login
        }
        assertTrue(errors.isEmpty());
    }

    @Test
    public void refusalLogNamesTheUserAndHowToFixIt() throws Exception {
        for (String name : new String[] {"admin", "user"}) {
            try {
                provider(stored(name, name))
                        .authenticate(new UsernamePasswordAuthenticationToken(name, name));
                fail("login accepted for " + name);
            } catch (BadCredentialsException expected) {
                // refused
            }
        }
        assertEquals(2, errors.size());
        for (int i = 0; i < 2; i++) {
            String name = i == 0 ? "admin" : "user";
            String logged = errors.get(i).getMessage().getFormattedMessage();
            assertTrue(logged, logged.contains("default password has been recognized"));
            assertTrue(logged, logged.contains("'" + name + "'"));
            assertTrue(logged, logged.contains("INITIAL_ADMIN_PASSWORD"));
            assertTrue(logged, logged.contains("in the database"));
        }
    }

    @Test
    public void interceptorRefusesFormerDefaultPasswordsAndTheirVariants() {
        String[][] pairs = {{"admin", "admin"}, {"user", "user"}, {"admin", "aDmIn."}};
        for (String[] pair : pairs) {
            try {
                interceptor(stored(pair[0], pair[1])).handleMessage(basicAuth(pair[0], pair[1]));
                fail("login accepted for " + pair[0] + "/" + pair[1]);
            } catch (AccessDeniedException expected) {
                // refused
            }
        }
        assertEquals(pairs.length, errors.size());
    }

    @Test
    public void interceptorStillAuthenticatesTheSameAccountsWithOtherPasswords() {
        for (String name : new String[] {"admin", "user"}) {
            Message message = basicAuth(name, "S0mething-else");

            interceptor(stored(name, "S0mething-else")).handleMessage(message);

            assertEquals(
                    name,
                    ((GeoStorePrincipal) message.get(SecurityContext.class).getUserPrincipal())
                            .getUser()
                            .getName());
        }
        assertTrue(errors.isEmpty());
    }
}
