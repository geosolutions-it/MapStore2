package it.geosolutions.geostore.services.rest.security;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.GroupReservedNames;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.core.security.UserMapper;
import it.geosolutions.geostore.services.UserGroupService;
import it.geosolutions.geostore.services.UserService;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;

import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.ldap.authentication.LdapAuthenticationProvider;
import org.springframework.security.ldap.authentication.LdapAuthenticator;
import org.springframework.security.ldap.userdetails.LdapAuthoritiesPopulator;
import org.springframework.security.ldap.userdetails.LdapUserDetails;

import java.util.*;

/**
 * @author alessio.fabiani
 */
public class UserLdapAuthenticationProvider extends LdapAuthenticationProvider {

    private static final Logger LOGGER = LogManager.getLogger(UserLdapAuthenticationProvider.class);

    /** Message shown if the user it's not found. */
    // TODO: Localize it
    private static final String USER_NOT_FOUND_MSG =
            "User not found. Please check your credentials";

    /** Message shown if the user credentials are wrong. */
    // TODO: Localize it
    private static final String UNAUTHORIZED_MSG = "Bad credentials";

    @Autowired UserService userService;
    @Autowired UserGroupService userGroupService;
    private UserMapper userMapper;

    @Value("${geostoreLdapProvider.ignoreUsernameCase:false}")
    private boolean ignoreUsernameCase;

    public UserLdapAuthenticationProvider(
            LdapAuthenticator authenticator, LdapAuthoritiesPopulator authoritiesPopulator) {
        super(authenticator, authoritiesPopulator);
    }

    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    public void setUserGroupService(UserGroupService userGroupService) {
        this.userGroupService = userGroupService;
    }

    public void setUserMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public Authentication authenticate(Authentication authentication)
            throws AuthenticationException {

        authentication = ldapAuthentication(authentication);

        if (!authentication.isAuthenticated()) {
            throw new BadCredentialsException(UNAUTHORIZED_MSG);
        }

        LdapUserDetails ldapUser = (LdapUserDetails) authentication.getPrincipal();

        if (userShouldNotAuthenticate(ldapUser)) {
            throw new DisabledException(USER_NOT_FOUND_MSG);
        }

        // Normalize username once
        String ldapUserUsername = normalizeUsername(ldapUser.getUsername());

        // Try exact (normalized) match; optionally try CI fallback
        User user = findUser(ldapUserUsername);

        try {
            String pw = (String) authentication.getCredentials();
            Collection<? extends GrantedAuthority> ldapAuthorities = ldapUser.getAuthorities();

            if (user != null) {
                return authenticateExistingUser(user, pw, ldapAuthorities);
            } else {
                return authenticateNewUser(ldapUserUsername, ldapAuthorities, ldapUser, pw);
            }
        } catch (BadRequestServiceEx | NotFoundServiceEx e) {
            LOGGER.log(Level.ERROR, e.getMessage(), e);
            throw new BadCredentialsException(USER_NOT_FOUND_MSG);
        }
    }

    private Authentication ldapAuthentication(Authentication authentication) {
        try {
            authentication = super.authenticate(authentication);
        } catch (Exception e) {
            LOGGER.log(Level.ERROR, e.getMessage(), e);
            throw new BadCredentialsException(UNAUTHORIZED_MSG);
        }
        return authentication;
    }

    private boolean userShouldNotAuthenticate(LdapUserDetails ldapUser) {
        return !(ldapUser.isAccountNonExpired()
                && ldapUser.isAccountNonLocked()
                && ldapUser.isCredentialsNonExpired()
                && ldapUser.isEnabled());
    }

    /** Normalize incoming usernames (trim, optional UPPER with Locale.ROOT). */
    private String normalizeUsername(String raw) {
        if (raw == null) return null;
        String s = raw.trim();
        return ignoreUsernameCase ? s.toUpperCase(Locale.ROOT) : s;
    }

    /**
     * Find user by exact normalized name; when the flag is ON and nothing found, try a
     * case-insensitive fallback using the existing UserService#getAll(..., nameLike, ...). If a
     * legacy record is found with different case, we return it after setting the canonical
     * (normalized) name on the object; the actual update will occur in
     * authenticateExistingUser(...) together with role/group sync.
     */
    private User findUser(String normalizedName) {
        try {
            User user = userService.get(normalizedName);
            LOGGER.info("User lookup hit for '{}'", normalizedName);
            if (!user.isEnabled()) {
                throw new DisabledException(USER_NOT_FOUND_MSG);
            }
            return user;
        } catch (NotFoundServiceEx notFound) {
            if (ignoreUsernameCase) {
                User ci = findUserIgnoreCase(normalizedName);
                if (ci != null) {
                    // Normalize the in-memory object; it will be persisted on update.
                    if (!normalizedName.equals(ci.getName())) {
                        LOGGER.warn(
                                "Found legacy user '{}' (case-variant), normalizing to '{}'",
                                ci.getName(),
                                normalizedName);
                        ci.setName(normalizedName);
                    }
                    if (!ci.isEnabled()) {
                        throw new DisabledException(USER_NOT_FOUND_MSG);
                    }
                    return ci;
                }
            }
            LOGGER.info("User not found with name: {}", normalizedName);
            return null;
        } catch (Exception e) {
            LOGGER.log(Level.ERROR, "Error while looking up user '{}'", normalizedName, e);
            return null;
        }
    }

    /**
     * Case-insensitive fallback using nameLike and exact equalsIgnoreCase filtering. Returns a
     * single deterministic user if multiple legacy variants exist (lowest id).
     */
    protected User findUserIgnoreCase(String normalizedUpperName) {
        try {
            List<User> candidates = userService.getAll(null, null, normalizedUpperName, false);
            if (candidates == null || candidates.isEmpty()) return null;

            // exact equalsIgnoreCase filter; deterministic pick if multiple
            return candidates.stream()
                    .filter(
                            u ->
                                    u.getName() != null
                                            && u.getName()
                                                    .trim()
                                                    .equalsIgnoreCase(normalizedUpperName))
                    .min(Comparator.comparing(User::getId))
                    .orElse(null);
        } catch (Exception e) {
            LOGGER.log(Level.ERROR, "CI lookup failed for '{}'", normalizedUpperName, e);
            return null;
        }
    }

    private Authentication authenticateExistingUser(
            User user, String pw, Collection<? extends GrantedAuthority> ldapAuthorities)
            throws BadRequestServiceEx, NotFoundServiceEx {

        setUserRoleAndGroups(user, ldapAuthorities);

        if (userService != null) {
            userService.update(user); // also persists any name normalization done above
        }

        return prepareAuthentication(pw, user);
    }

    private Authentication authenticateNewUser(
            String ldapUserUsername,
            Collection<? extends GrantedAuthority> ldapAuthorities,
            LdapUserDetails ldapUser,
            String pw)
            throws BadRequestServiceEx, NotFoundServiceEx {

        User user = new User();
        user.setName(ldapUserUsername);
        user.setNewPassword(null);
        user.setEnabled(true);

        setUserRoleAndGroups(user, ldapAuthorities);

        if (userMapper != null) {
            userMapper.mapUser(ldapUser, user);
        }

        if (userService != null) {
            userService.insert(user);
        }

        return prepareAuthentication(pw, user);
    }

    private void setUserRoleAndGroups(
            User user, Collection<? extends GrantedAuthority> ldapAuthorities)
            throws BadRequestServiceEx {
        Set<UserGroup> groups = new HashSet<>();
        Role role = extractUserRoleAndGroups(user.getRole(), ldapAuthorities, groups);
        user.setRole(role);
        user.setGroups(GroupReservedNames.checkReservedGroups(groups));
    }

    protected Role extractUserRoleAndGroups(
            Role userRole,
            Collection<? extends GrantedAuthority> ldapAuthorities,
            Set<UserGroup> groups)
            throws BadRequestServiceEx {

        Role role = (userRole != null ? userRole : Role.USER);
        for (GrantedAuthority a : ldapAuthorities) {
            String authority = a.getAuthority();
            if (authority != null && authority.startsWith("ROLE_")) {
                if (authority.toUpperCase().endsWith("ADMIN")
                        && (role == Role.GUEST || role == Role.USER)) {
                    role = Role.ADMIN;
                } else if (authority.toUpperCase().endsWith("USER") && role == Role.GUEST) {
                    role = Role.USER;
                }
            } else {
                groups.add(synchronizeGroup(a));
            }
        }
        return role;
    }

    protected Authentication prepareAuthentication(String pw, User user) {
        List<GrantedAuthority> grantedAuthorities = new ArrayList<>();
        grantedAuthorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
        return new UsernamePasswordAuthenticationToken(user, pw, grantedAuthorities);
    }

    public void synchronizeGroups() throws BadRequestServiceEx {
        if (getAuthoritiesPopulator() instanceof GroupsRolesService groupsService) {
            for (GrantedAuthority authority : groupsService.getAllGroups()) {
                synchronizeGroup(authority);
            }
        }
    }

    private UserGroup synchronizeGroup(GrantedAuthority a) throws BadRequestServiceEx {
        UserGroup group = new UserGroup();
        group.setGroupName(a.getAuthority());

        if (userGroupService != null) {
            UserGroup userGroup = userGroupService.get(group.getGroupName());

            if (userGroup == null) {
                LOGGER.log(Level.INFO, "Creating new group from LDAP: {}", group.getGroupName());
                long groupId = userGroupService.insert(group);
                userGroup = userGroupService.get(groupId);
            }

            return userGroup;
        } else {
            return group;
        }
    }
}
