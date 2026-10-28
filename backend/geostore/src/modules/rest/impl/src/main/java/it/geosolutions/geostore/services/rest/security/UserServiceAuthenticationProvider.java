package it.geosolutions.geostore.services.rest.security;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.security.password.PwEncoder;
import it.geosolutions.geostore.services.UserService;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.ArrayList;
import java.util.List;

/**
 * Wrap geostore Rest Services to allow Authentication using Geostore Users
 *
 * @author Lorenzo Natali
 */
public class UserServiceAuthenticationProvider implements AuthenticationProvider {

    private static final Logger LOGGER =
            LogManager.getLogger(UserServiceAuthenticationProvider.class);

    /** Message shown if the user is not found. */
    // TODO: Localize it
    private static final String USER_NOT_FOUND_MSG =
            "User not found. Please check your credentials";

    /** Message shown if the user credentials are wrong. */
    // TODO: Localize it
    private static final String UNAUTHORIZED_MSG = "Bad credentials";

    @Autowired UserService userService;

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(UsernamePasswordAuthenticationToken.class);
    }

    @Override
    public Authentication authenticate(Authentication authentication) {
        String pw = (String) authentication.getCredentials();
        String us = (String) authentication.getPrincipal();

        // We use the credentials for all the session in the GeoStore client
        User user;
        try {
            user = userService.get(us);
            LOGGER.info("US: {}", us); // + " PW: " + PwEncoder.encode(pw) + " -- " +
            if (user.getPassword() == null || !PwEncoder.isPasswordValid(user.getPassword(), pw)) {
                throw new BadCredentialsException(UNAUTHORIZED_MSG);
            }
            if (!user.isEnabled()) {
                throw new DisabledException(USER_NOT_FOUND_MSG);
            }
            if (FormerDefaultPasswordCheck.refusesLogin(user.getName(), pw)) {
                throw new BadCredentialsException(UNAUTHORIZED_MSG);
            }
        } catch (Exception e) {
            LOGGER.info("Error while authenticating user", e);
            user = null;
        }

        if (user != null) {
            String role = user.getRole().toString();
            List<GrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
            return new UsernamePasswordAuthenticationToken(user, pw, authorities);
        } else {
            throw new BadCredentialsException(USER_NOT_FOUND_MSG);
        }
    }
}
