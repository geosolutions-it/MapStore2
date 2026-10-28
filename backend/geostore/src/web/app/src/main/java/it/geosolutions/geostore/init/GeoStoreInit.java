/*
 *  Copyright (C) 2007 - 2012 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package it.geosolutions.geostore.init;

import it.geosolutions.geostore.core.model.Category;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.core.security.password.GeoStorePasswordEncoder;
import it.geosolutions.geostore.core.security.password.PwEncoder;
import it.geosolutions.geostore.init.model.InitUserList;
import it.geosolutions.geostore.services.CategoryService;
import it.geosolutions.geostore.services.UserGroupService;
import it.geosolutions.geostore.services.UserService;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;
import it.geosolutions.geostore.services.exception.ReservedUserGroupNameEx;
import it.geosolutions.geostore.services.rest.model.CategoryList;
import it.geosolutions.geostore.services.rest.model.RESTUserGroup;
import it.geosolutions.geostore.services.rest.model.UserGroupList;
import it.geosolutions.geostore.services.rest.security.FormerDefaultPasswordCheck;
import it.geosolutions.geostore.services.rest.utils.GeoStoreJAXBContext;

import jakarta.xml.bind.JAXBContext;
import jakarta.xml.bind.JAXBException;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.InitializingBean;

import java.io.File;
import java.util.Collections;
import java.util.List;

/**
 * @author ETj (etj at geo-solutions.it)
 */
public class GeoStoreInit implements InitializingBean {

    private static final Logger LOGGER = LogManager.getLogger(GeoStoreInit.class);

    private static final String ADMIN_NAME = "admin";

    /**
     * Environment variable holding the password used to create the {@code admin} account whenever
     * it is missing at startup.
     */
    static final String INITIAL_ADMIN_PASSWORD_ENV =
            FormerDefaultPasswordCheck.INITIAL_ADMIN_PASSWORD_ENV;

    protected UserService userService;

    protected CategoryService categoryService;

    protected UserGroupService userGroupService;

    protected File userListInitFile = null;

    protected File categoryListInitFile = null;

    protected File userGroupListInitFile = null;

    /** The password encoder to be set as default */
    protected GeoStorePasswordEncoder passwordEncoder = null;

    /** If set to true, the recoding of the password is automatic */
    protected boolean allowPasswordRecoding = false;

    @Override
    public void afterPropertiesSet() throws Exception {
        initPasswordEncoding();
        LOGGER.info("===== Starting GeoStore services =====");
        long catCnt = categoryService.getCount(null);
        if (catCnt == 0) {
            LOGGER.warn("No category found.");
            if (categoryListInitFile != null) {
                LOGGER.warn("Initializing categories from file " + categoryListInitFile);
                initCategories(categoryListInitFile);
            } else {
                LOGGER.info("No category initializer defined.");
            }
        } else {
            LOGGER.info("Categories already in db: " + catCnt);
        }

        long userGroupCnt = userGroupService.getAll(null, null).size();
        if (userGroupCnt == 0) {
            LOGGER.warn("No usersgroup found.");
            if (userGroupListInitFile != null) {
                LOGGER.warn("Initializing users from file " + userGroupListInitFile);
                initUsersGroup(userGroupListInitFile);
            } else {
                LOGGER.info("No usersgroup initializer defined.");
            }
        } else {
            LOGGER.info("UsersGroup already in db: " + userGroupCnt);
        }

        long userCnt = userService.getCount(null);
        if (userCnt == 0) {
            LOGGER.warn("No user found.");
            if (userListInitFile != null) {
                LOGGER.warn("Initializing users from file " + userListInitFile);
                initUsers(userListInitFile);
            } else {
                userService.insertSpecialUsers();
            }
        } else {
            LOGGER.info("Users already in db: " + userCnt);
        }
        ensureAdminAccount();
        if (userCnt > 0) {
            warnAboutLegacySampleCredentials();
        }
    }

    /**
     * Makes sure an {@code admin} account exists and can be recovered, using the password in the
     * {@value #INITIAL_ADMIN_PASSWORD_ENV} environment variable:
     *
     * <ul>
     *   <li>when {@code admin} is missing, on a new database or because it was renamed or deleted,
     *       it is created with that password;
     *   <li>when {@code admin} still has its former default password, the password is reset to that
     *       value, so setting the variable and restarting replaces the publicly known one;
     *   <li>otherwise an existing {@code admin} is not modified, and a warning is logged while it
     *       still uses that password.
     * </ul>
     *
     * Without the variable nothing is created or changed and startup continues, so installations
     * whose administrator has a different name or comes from an external provider keep working.
     */
    void ensureAdminAccount() {
        String password = initialAdminPassword();
        boolean configured = password != null && !password.trim().isEmpty();
        if (configured && PwEncoder.isLegacySamplePassword(ADMIN_NAME, password)) {
            LOGGER.error(
                    "SECURITY: {} is set to the former default password or a variant of it, so it is ignored. Choose a different password.",
                    INITIAL_ADMIN_PASSWORD_ENV);
            return;
        }

        User admin = adminOrNull();
        if (admin == null) {
            if (configured) {
                createAdmin(password);
            } else {
                LOGGER.warn(
                        "No '{}' account found and the {} environment variable is not set, so none was created. Set {} to have GeoStore create the '{}' account at startup.",
                        ADMIN_NAME,
                        INITIAL_ADMIN_PASSWORD_ENV,
                        INITIAL_ADMIN_PASSWORD_ENV,
                        ADMIN_NAME);
            }
            return;
        }
        if (!configured) {
            LOGGER.info(
                    "The {} environment variable is not set. Set it if GeoStore should recreate the '{}' account when it is missing.",
                    INITIAL_ADMIN_PASSWORD_ENV,
                    ADMIN_NAME);
            return;
        }
        if (usesPassword(admin, ADMIN_NAME)) {
            resetFormerDefaultPassword(admin, password);
        } else if (usesPassword(admin, password)) {
            LOGGER.warn(
                    "SECURITY: the '{}' account still uses the password from the {} environment variable. Change it.",
                    ADMIN_NAME,
                    INITIAL_ADMIN_PASSWORD_ENV);
        }
    }

    private void createAdmin(String password) {
        User admin = new User();
        admin.setName(ADMIN_NAME);
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        admin.setNewPassword(password);
        try {
            userService.insert(admin);
        } catch (Exception e) {
            LOGGER.error("Could not create the '{}' account.", ADMIN_NAME, e);
            return;
        }
        LOGGER.warn(
                "Created the '{}' account with the password from the {} environment variable. Change it after the first login.",
                ADMIN_NAME,
                INITIAL_ADMIN_PASSWORD_ENV);
    }

    private void resetFormerDefaultPassword(User admin, String password) {
        admin.setNewPassword(password);
        // Attributes are stored separately; leaving them out keeps them as they are.
        admin.setAttribute(null);
        try {
            userService.update(admin);
        } catch (Exception e) {
            LOGGER.error(
                    "Could not reset the former default password of the '{}' account.",
                    ADMIN_NAME,
                    e);
            return;
        }
        LOGGER.warn(
                "SECURITY: the '{}' account still had its former default password; it was reset to the password from the {} environment variable. Change it after logging in.",
                ADMIN_NAME,
                INITIAL_ADMIN_PASSWORD_ENV);
    }

    private static boolean usesPassword(User user, String rawPassword) {
        return user.getPassword() != null
                && PwEncoder.isPasswordValid(user.getPassword(), rawPassword);
    }

    /** The password for the {@code admin} account, or null when none is configured. */
    protected String initialAdminPassword() {
        return System.getenv(INITIAL_ADMIN_PASSWORD_ENV);
    }

    /**
     * Logs a critical security error for every stored {@code admin} or {@code user} account that
     * still has its former sample password. It does not change the database or stop startup; the
     * logins themselves are refused by {@link FormerDefaultPasswordCheck} until it is changed.
     */
    void warnAboutLegacySampleCredentials() {
        for (String name : new String[] {"admin", "user"}) {
            User existing = userOrNull(name);
            if (existing != null && usesPassword(existing, name)) {
                LOGGER.error(
                        "SECURITY: GeoStore user '{}' still uses its former default password, so its logins are refused. {}",
                        name,
                        ADMIN_NAME.equals(name)
                                ? "Set "
                                        + INITIAL_ADMIN_PASSWORD_ENV
                                        + " and restart to initialize it correctly, or reset a correct password in the database."
                                : "Log in as an administrator and set a new password, or reset a correct password in the database.");
            }
        }
    }

    private User adminOrNull() {
        return userOrNull(ADMIN_NAME);
    }

    private User userOrNull(String name) {
        try {
            return userService.get(name);
        } catch (NotFoundServiceEx missing) {
            return null;
        }
    }

    private void initCategories(File file) {
        try {
            JAXBContext context = GeoStoreJAXBContext.getContext();
            CategoryList list = (CategoryList) context.createUnmarshaller().unmarshal(file);
            for (Category item : list.getList()) {
                LOGGER.info("Adding category " + item);
                categoryService.insert(item);
            }
        } catch (JAXBException ex) {
            throw new RuntimeException("Error reading categories init file " + file, ex);
        } catch (Exception e) {
            LOGGER.error("Error while initting categories. Rolling back.", e);
            List<Category> removeList;
            try {
                removeList = categoryService.getAll(null, null);
            } catch (BadRequestServiceEx ex) {
                throw new RuntimeException(
                        "Error while rolling back categories initialization. Your DB may now contain an incomplete category list. Please check manually.",
                        e);
            }

            for (Category cat : removeList) {
                categoryService.delete(cat.getId());
            }

            throw new RuntimeException("Error while initting categories.");
        }
    }

    void initUsers(File file) {
        try {
            userService.insertSpecialUsers();
            JAXBContext context = getUserContext();

            InitUserList list = (InitUserList) context.createUnmarshaller().unmarshal(file);
            List<User> users = list.getList() == null ? Collections.emptyList() : list.getList();
            for (User user : users) {
                if (PwEncoder.isLegacySamplePassword(user.getName(), user.getNewPassword())) {
                    LOGGER.error(
                            "SECURITY: skipping user '{}' from {}: it uses the former default password.",
                            user.getName(),
                            file);
                    continue;
                }
                LOGGER.info("Adding user " + user);
                userService.insert(user);
            }
        } catch (JAXBException ex) {
            throw new RuntimeException("Error reading users init file " + file, ex);
        } catch (Exception e) {
            LOGGER.error("Error while initting users. Rolling back.", e);
            List<User> removeList;
            try {
                removeList = userService.getAll(null, null);
            } catch (BadRequestServiceEx ex) {
                throw new RuntimeException(
                        "Error while rolling back user initialization. Your DB may now contain an incomplete user list. Please check manually.",
                        e);
            }

            for (User user : removeList) {
                userService.delete(user.getId());
            }

            throw new RuntimeException("Error while initting users.");
        }
    }

    private void initUsersGroup(File file) throws NotFoundServiceEx, BadRequestServiceEx {
        try {
            userGroupService.insertSpecialUsersGroups();
            JAXBContext context = GeoStoreJAXBContext.getContext();
            UserGroupList list = (UserGroupList) context.createUnmarshaller().unmarshal(file);
            for (RESTUserGroup userGroup : list.getUserGroupList()) {
                LOGGER.info("Adding user group " + userGroup);
                UserGroup ug = new UserGroup();
                ug.setGroupName(userGroup.getGroupName());
                ug.setDescription(userGroup.getDescription());
                try {
                    userGroupService.insert(ug);
                } catch (ReservedUserGroupNameEx e) {
                    // If  a reserved username is in the init usergroup file log the exception and
                    // skip this insertion
                    LOGGER.warn(e.getMessage());
                }
            }
        } catch (JAXBException ex) {
            throw new RuntimeException("Error reading usersgroup init file " + file, ex);
        } catch (Exception e) {
            LOGGER.error("Error while initting usersgroups. Rolling back.", e);
            List<UserGroup> removeList;
            try {
                removeList = userGroupService.getAll(null, null);
            } catch (BadRequestServiceEx ex) {
                throw new RuntimeException(
                        "Error while rolling back usergroup initialization. Your DB may now contain an incomplete usergroup list. Please check manually.",
                        e);
            }
            for (UserGroup ug : removeList) {
                userGroupService.delete(ug.getId());
            }
            throw new RuntimeException("Error while initting usersgroup.");
        }
    }

    private void initPasswordEncoding() {
        LOGGER.info("=== Set up the security system   ====");
        LOGGER.info("Encoding Type:" + passwordEncoder.getEncodingType());

        PwEncoder.setEncoder(this.passwordEncoder);
    }

    private static JAXBContext getUserContext() {

        List<Class> allClasses = GeoStoreJAXBContext.getGeoStoreClasses();
        allClasses.add(InitUserList.class);

        if (LOGGER.isDebugEnabled())
            LOGGER.debug(
                    "Initializing JAXBContext with "
                            + allClasses.size()
                            + " classes "
                            + allClasses);

        try {
            return JAXBContext.newInstance(allClasses.toArray(new Class[allClasses.size()]));
        } catch (JAXBException ex) {
            LOGGER.error("Can't create GeoStore context: " + ex.getMessage(), ex);
            return null;
        }
    }

    // ==========================================================================

    public void setUserListInitFile(File userListInitFile) {
        this.userListInitFile = userListInitFile;
    }

    public void setCategoryListInitFile(File categoryListInitFile) {
        this.categoryListInitFile = categoryListInitFile;
    }

    public void setUserGroupListInitFile(File userGroupListInitFile) {
        this.userGroupListInitFile = userGroupListInitFile;
    }

    // ==========================================================================

    public void setCategoryService(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    public void setUserGroupService(UserGroupService userGroupService) {
        this.userGroupService = userGroupService;
    }

    // ==========================================================================

    public GeoStorePasswordEncoder getPasswordEncoder() {
        return passwordEncoder;
    }

    public void setPasswordEncoder(GeoStorePasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    // ===========================================================================
    public boolean isAllowPasswordRecoding() {
        return allowPasswordRecoding;
    }

    public void setAllowPasswordRecoding(boolean allowPasswordRecoding) {
        this.allowPasswordRecoding = allowPasswordRecoding;
    }
}
