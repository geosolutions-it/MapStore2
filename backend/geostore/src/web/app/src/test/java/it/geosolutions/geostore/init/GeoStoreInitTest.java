package it.geosolutions.geostore.init;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.core.security.password.GeoStoreDigestPasswordEncoder;
import it.geosolutions.geostore.core.security.password.GeoStorePasswordEncoder;
import it.geosolutions.geostore.core.security.password.PwEncoder;
import it.geosolutions.geostore.services.CategoryService;
import it.geosolutions.geostore.services.UserGroupService;
import it.geosolutions.geostore.services.UserService;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

import java.io.File;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Proxy;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GeoStoreInitTest {

    @Rule public TemporaryFolder temporaryFolder = new TemporaryFolder();

    private GeoStorePasswordEncoder previousEncoder;

    @Before
    public void useDigestEncoder() {
        previousEncoder = PwEncoder.getEncoder();
        PwEncoder.setEncoder(new GeoStoreDigestPasswordEncoder());
    }

    @After
    public void restoreEncoder() {
        PwEncoder.setEncoder(previousEncoder);
    }

    @Test
    public void missingAdminIsCreatedFromTheEnvironmentPassword() {
        RecordingUsers users = new RecordingUsers();

        initializer(users, "operator-secret").ensureAdminAccount();

        assertEquals(1, users.inserted.size());
        User admin = users.inserted.get(0);
        assertEquals("admin", admin.getName());
        assertEquals(Role.ADMIN, admin.getRole());
        assertTrue(admin.isEnabled());
        assertEquals("operator-secret", admin.getNewPassword());
    }

    @Test
    public void existingAdminIsLeftUntouched() {
        RecordingUsers users = new RecordingUsers();
        users.existing.put("admin", userWithPassword("admin", "changed-by-the-operator"));

        initializer(users, "operator-secret").ensureAdminAccount();

        assertTrue(users.inserted.isEmpty());
        assertTrue(users.updated.isEmpty());
    }

    @Test
    public void adminStillOnFormerDefaultIsResetFromTheEnvironmentPassword() {
        RecordingUsers users = new RecordingUsers();
        User admin = userWithPassword("admin", "admin");
        admin.setId(1L);
        admin.setAttribute(new ArrayList<>());
        users.existing.put("admin", admin);

        initializer(users, "operator-secret").ensureAdminAccount();

        assertTrue(users.inserted.isEmpty());
        assertEquals(1, users.updated.size());
        User reset = users.updated.get(0);
        assertEquals("admin", reset.getName());
        assertEquals(Long.valueOf(1L), reset.getId());
        assertEquals(Role.ADMIN, reset.getRole());
        assertEquals("operator-secret", reset.getNewPassword());
        // Attributes are not sent with the update, so the stored ones are kept.
        assertEquals(null, reset.getAttribute());
    }

    @Test
    public void adminStillOnFormerDefaultIsNotChangedWithoutTheVariable() {
        RecordingUsers users = new RecordingUsers();
        users.existing.put("admin", userWithPassword("admin", "admin"));

        initializer(users, null).ensureAdminAccount();
        initializer(users, "admin").ensureAdminAccount();

        assertTrue(users.inserted.isEmpty());
        assertTrue(users.updated.isEmpty());
    }

    @Test
    public void adminStillUsingTheEnvironmentPasswordIsOnlyReported() {
        RecordingUsers users = new RecordingUsers();
        users.existing.put("admin", userWithPassword("admin", "operator-secret"));

        // Must not throw and must not change the account; it only logs a warning.
        initializer(users, "operator-secret").ensureAdminAccount();

        assertTrue(users.inserted.isEmpty());
        assertTrue(users.updated.isEmpty());
    }

    @Test
    public void adminRemovedFromAnExistingDatabaseIsRecreated() {
        RecordingUsers users = new RecordingUsers();
        // The administrator was renamed: other users exist, but no account is called 'admin'.
        users.existing.put("site-admin", userWithPassword("site-admin", "whatever"));

        initializer(users, "operator-secret").ensureAdminAccount();

        assertEquals(1, users.inserted.size());
        assertEquals("admin", users.inserted.get(0).getName());
        assertFalse(users.specialUsersInserted);
    }

    @Test
    public void withoutTheEnvironmentVariableNothingIsCreated() {
        RecordingUsers users = new RecordingUsers();

        initializer(users, null).ensureAdminAccount();
        initializer(users, "   ").ensureAdminAccount();

        assertTrue(users.inserted.isEmpty());
    }

    @Test
    public void formerDefaultPasswordInTheEnvironmentIsNotUsed() {
        RecordingUsers users = new RecordingUsers();

        initializer(users, "admin").ensureAdminAccount();

        assertTrue(users.inserted.isEmpty());
    }

    @Test
    public void insertFailureDoesNotStopStartup() {
        RecordingUsers users = new RecordingUsers();
        users.failOnInsert = true;

        // Must not throw: the error is logged and the next startup tries again.
        initializer(users, "operator-secret").ensureAdminAccount();
    }

    @Test
    public void emptyDatabaseGetsSpecialUsersAndAdmin() throws Exception {
        RecordingUsers users = new RecordingUsers();

        initializer(users, "operator-secret").afterPropertiesSet();

        assertTrue(users.specialUsersInserted);
        assertEquals(1, users.inserted.size());
        assertEquals("admin", users.inserted.get(0).getName());
    }

    @Test
    public void emptyDatabaseWithoutTheEnvironmentVariableStillStarts() throws Exception {
        RecordingUsers users = new RecordingUsers();

        initializer(users, null).afterPropertiesSet();

        assertTrue(users.specialUsersInserted);
        assertTrue(users.inserted.isEmpty());
    }

    @Test
    public void existingDatabaseWithAdminIsNotChangedAtStartup() throws Exception {
        RecordingUsers users = new RecordingUsers();
        users.existing.put("admin", userWithPassword("admin", "changed-by-the-operator"));

        initializer(users, "operator-secret").afterPropertiesSet();

        assertFalse(users.specialUsersInserted);
        assertTrue(users.inserted.isEmpty());
    }

    @Test
    public void legacySampleCredentialsAreReportedWithoutStoppingStartup() throws Exception {
        RecordingUsers users = new RecordingUsers();
        users.existing.put("admin", userWithPassword("admin", "admin"));
        users.existing.put("user", userWithPassword("user", "user"));

        // Must not throw: the application keeps starting, the condition is only logged.
        initializer(users, null).afterPropertiesSet();

        assertFalse(users.specialUsersInserted);
        assertTrue(users.inserted.isEmpty());
        assertTrue(users.updated.isEmpty());
    }

    @Test
    public void customSeedIsInsertedAndTheAdminFallbackStillApplies() throws Exception {
        RecordingUsers users = new RecordingUsers();
        File seed =
                seed(
                        "<User><name>operator</name><newPassword>operator-secret</newPassword><role>USER</role></User>");

        initializer(users, null).initUsers(seed);

        assertTrue(users.specialUsersInserted);
        assertEquals(1, users.inserted.size());
        assertEquals("operator", users.inserted.get(0).getName());
        assertEquals("operator-secret", users.inserted.get(0).getNewPassword());
    }

    @Test
    public void customSeedSkipsFormerDefaultPairs() throws Exception {
        RecordingUsers users = new RecordingUsers();
        File seed =
                seed(
                        "<User><name>admin</name><newPassword>admin</newPassword><role>ADMIN</role></User>"
                                + "<User><name>user</name><newPassword>user</newPassword><role>USER</role></User>"
                                + "<User><name>operator</name><newPassword>operator-secret</newPassword><role>USER</role></User>");

        initializer(users, null).initUsers(seed);

        assertEquals(1, users.inserted.size());
        assertEquals("operator", users.inserted.get(0).getName());
    }

    private File seed(String usersXml) throws Exception {
        File seed = temporaryFolder.newFile("custom-users.xml");
        Files.writeString(
                seed.toPath(),
                "<InitUserList>" + usersXml + "</InitUserList>",
                StandardCharsets.UTF_8);
        return seed;
    }

    private static User userWithPassword(String name, String rawPassword) {
        User user = new User();
        user.setName(name);
        user.setRole(Role.ADMIN);
        user.setPassword(PwEncoder.encode(rawPassword));
        return user;
    }

    private static GeoStoreInit initializer(RecordingUsers users, String environmentPassword) {
        GeoStoreInit initializer =
                new GeoStoreInit() {
                    @Override
                    protected String initialAdminPassword() {
                        return environmentPassword;
                    }
                };
        initializer.setUserService(users.proxy());
        initializer.setCategoryService(
                (CategoryService)
                        Proxy.newProxyInstance(
                                GeoStoreInitTest.class.getClassLoader(),
                                new Class<?>[] {CategoryService.class},
                                (proxy, method, args) -> {
                                    if ("getCount".equals(method.getName())) {
                                        return 1L;
                                    }
                                    throw new AssertionError(
                                            "Unexpected CategoryService call: " + method.getName());
                                }));
        initializer.setUserGroupService(
                (UserGroupService)
                        Proxy.newProxyInstance(
                                GeoStoreInitTest.class.getClassLoader(),
                                new Class<?>[] {UserGroupService.class},
                                (proxy, method, args) -> {
                                    if ("getAll".equals(method.getName())) {
                                        return new ArrayList<>(List.of(new Object()));
                                    }
                                    throw new AssertionError(
                                            "Unexpected UserGroupService call: "
                                                    + method.getName());
                                }));
        initializer.setPasswordEncoder(PwEncoder.getEncoder());
        return initializer;
    }

    private static class RecordingUsers implements InvocationHandler {
        private final List<User> inserted = new ArrayList<>();
        private final List<User> updated = new ArrayList<>();
        private final Map<String, User> existing = new HashMap<>();
        private boolean specialUsersInserted;
        private boolean failOnInsert;

        private UserService proxy() {
            return (UserService)
                    Proxy.newProxyInstance(
                            UserService.class.getClassLoader(),
                            new Class<?>[] {UserService.class},
                            this);
        }

        @Override
        public Object invoke(Object proxy, java.lang.reflect.Method method, Object[] args)
                throws Throwable {
            switch (method.getName()) {
                case "insertSpecialUsers":
                    specialUsersInserted = true;
                    return true;
                case "getCount":
                    return (long) existing.size();
                case "insert":
                    if (failOnInsert) {
                        throw new RuntimeException("Simulated persistence failure");
                    }
                    User copy = new User((User) args[0]);
                    copy.setId((long) inserted.size() + 1);
                    inserted.add(copy);
                    return copy.getId();
                case "update":
                    updated.add(new User((User) args[0]));
                    return ((User) args[0]).getId();
                case "getAll":
                    return new ArrayList<>(inserted);
                case "delete":
                    return inserted.removeIf(item -> item.getId().equals(args[0]));
                case "get":
                    User user = existing.get(args[0]);
                    if (user == null) {
                        throw new NotFoundServiceEx("Missing test user");
                    }
                    return user;
                default:
                    throw new AssertionError("Unexpected UserService call: " + method.getName());
            }
        }
    }
}
