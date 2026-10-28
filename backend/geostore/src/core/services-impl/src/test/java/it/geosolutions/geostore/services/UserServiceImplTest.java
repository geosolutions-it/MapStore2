/*
 *  Copyright (C) 2007 - 2011 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services;

import it.geosolutions.geostore.core.model.Category;
import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.SecurityRule;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserAttribute;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.core.security.password.PwEncoder;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Class UserServiceImplTest.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public class UserServiceImplTest extends ServiceTestBase {

    @BeforeClass
    public static void setUpClass() throws Exception {}

    @AfterClass
    public static void tearDownClass() throws Exception {}

    public UserServiceImplTest() {}

    @Test
    public void testInsertDeleteUser() throws Exception {

        //
        // Creating and deleting user data
        //
        long userId = createUser("test", Role.USER, "tesPW");

        assertEquals(1, userService.getCount(null));
        assertTrue("Could not delete user", userService.delete(userId));
        assertEquals(0, userService.getCount(null));
    }

    @Test
    public void testUpdateLoadData() throws Exception {
        final String NAME = "name1";

        long userId = createUser(NAME, Role.USER, "testPW");

        assertEquals(1, userService.getCount(null));

        //
        // Updating User
        //
        {
            User loaded = userService.get(userId);
            assertNotNull(loaded);
            assertEquals(NAME, loaded.getName());
            assertTrue(PwEncoder.isPasswordValid(loaded.getPassword(), "testPW"));
            assertEquals(Role.USER, loaded.getRole());

            loaded.setNewPassword("testPW2");
            userService.update(loaded);
        }

        //
        // Loading User
        //
        {
            User loaded = userService.get(userId);
            assertNotNull(loaded);
            assertTrue(PwEncoder.isPasswordValid(loaded.getPassword(), "testPW2"));
        }

        //
        // Deleting User
        //
        {
            assertEquals(1, userService.getCount(null));
            userService.delete(userId);
            assertEquals(0, userService.getCount(null));
        }
    }

    @Test
    public void testGetByAttribute() throws Exception {
        UserAttribute attribute = new UserAttribute();
        String token = UUID.randomUUID().toString();
        attribute.setName("UUID");
        attribute.setValue(token);
        createUser("test", Role.USER, "tesPW", Arrays.asList(attribute));

        assertEquals(1, userService.getByAttribute(attribute).size());
    }

    @Test
    public void testGetByGroupId() throws Exception {
        long groupId = createGroup("testgroup");
        createUser("test", Role.USER, "tesPW", groupId);
        UserGroup group = new UserGroup();
        group.setId(groupId);
        Collection<User> users = userService.getByGroup(group);
        assertEquals(1, users.size());
    }

    @Test
    public void testGetByGroupName() throws Exception {
        long groupId = createGroup("testgroup");
        createUser("test", Role.USER, "tesPW", groupId);
        UserGroup group = new UserGroup();
        group.setGroupName("testgroup");
        Collection<User> users = userService.getByGroup(group);
        assertEquals(1, users.size());
    }

    @Test
    public void testUpdateByUserId() throws Exception {
        final String NAME = "name1";

        long userId = createUser(NAME, Role.USER, "testPW");

        assertEquals(1, userService.getCount(null));

        User loaded = userService.get(userId);
        assertNotNull(loaded);
        assertEquals(NAME, loaded.getName());
        assertTrue(PwEncoder.isPasswordValid(loaded.getPassword(), "testPW"));
        assertEquals(Role.USER, loaded.getRole());

        loaded.setNewPassword("testPW2");
        userService.update(loaded);

        loaded = userService.get(userId);
        assertNotNull(loaded);
        assertTrue(PwEncoder.isPasswordValid(loaded.getPassword(), "testPW2"));
    }

    @Test
    public void testUpdateWithGroups() throws Exception {
        final String NAME = "name1";

        long userId = createUser(NAME, Role.USER, "testPW");
        assertEquals(1, userService.getCount(null));

        createUserGroup("testgroup", new long[] {userId});

        User loaded = userService.get(userId);
        assertNotNull(loaded);
        assertEquals(NAME, loaded.getName());
        assertTrue(PwEncoder.isPasswordValid(loaded.getPassword(), "testPW"));
        assertEquals(Role.USER, loaded.getRole());
        assertEquals(1, loaded.getGroups().size());

        loaded.setNewPassword("testPW2");
        userService.update(loaded);

        loaded = userService.get(userId);
        assertNotNull(loaded);
        assertTrue(PwEncoder.isPasswordValid(loaded.getPassword(), "testPW2"));
        assertEquals(1, loaded.getGroups().size());
    }

    @Test
    public void testUpdateWithGroupsAndEveryone() throws Exception {
        final String NAME = "name1";

        createSpecialUserGroups();

        long userId = createUser(NAME, Role.USER, "testPW");
        assertEquals(1, userService.getCount(null));

        createUserGroup("testgroup", new long[] {userId});

        User loaded = userService.get(userId);
        assertNotNull(loaded);
        assertEquals(NAME, loaded.getName());
        assertTrue(PwEncoder.isPasswordValid(loaded.getPassword(), "testPW"));
        assertEquals(Role.USER, loaded.getRole());
        assertEquals(2, loaded.getGroups().size());

        loaded.setNewPassword("testPW2");
        userService.update(loaded);

        loaded = userService.get(userId);
        assertNotNull(loaded);
        assertTrue(PwEncoder.isPasswordValid(loaded.getPassword(), "testPW2"));
        assertEquals(2, loaded.getGroups().size());
    }

    @Test
    public void testUpdateByUserName() throws Exception {
        final String NAME = "name1";

        long userId = createUser(NAME, Role.USER, "testPW");

        assertEquals(1, userService.getCount(null));

        User loaded = userService.get(userId);
        assertNotNull(loaded);
        assertEquals(NAME, loaded.getName());
        assertTrue(PwEncoder.isPasswordValid(loaded.getPassword(), "testPW"));
        assertEquals(Role.USER, loaded.getRole());

        loaded.setNewPassword("testPW2");
        loaded.setId(-1L);
        userService.update(loaded);

        loaded = userService.get(userId);
        assertNotNull(loaded);
        assertTrue(PwEncoder.isPasswordValid(loaded.getPassword(), "testPW2"));
    }

    // ---------------------------------------------------------------------
    // delete(id, cascadeResourceCategories) — support #5817: deleting a user
    // must be able to cascade-delete the resources (e.g. USERSESSION) the
    // user solely owns, since resources have no FK to the owning user.
    // ---------------------------------------------------------------------

    @Test
    public void testDeleteUserCascadesSolelyOwnedCategoryResources() throws Exception {
        long userId = createUser("congchen", Role.USER, "userPW");
        User user = userService.get(userId);

        Category sessions = categoryService.get(createCategory("USERSESSION"));
        long sessionId = createResourceWithRules("default.congchen", sessions, ownerRule(user));

        assertEquals(1, resourceService.getCount(null));

        assertTrue(userService.delete(userId, "USERSESSION"));

        assertEquals(0, userService.getCount(null));
        assertNull(
                "UserSession resource should be cascade-deleted", resourceService.get(sessionId));
        assertEquals(0, resourceService.getCount(null));
    }

    @Test
    public void testDeleteUserCascadeSkipsMissingCategory() throws Exception {
        long userId = createUser("congchen", Role.USER, "userPW");

        // No category exists at all: the cascade must be a no-op and the user deleted anyway.
        assertTrue(userService.delete(userId, "USERSESSION,NOT_A_CATEGORY"));
        assertEquals(0, userService.getCount(null));
    }

    @Test
    public void testDeleteUserCascadePreservesSharedResources() throws Exception {
        long ownerId = createUser("owner", Role.USER, "ownerPW");
        long otherId = createUser("other", Role.USER, "otherPW");
        User owner = userService.get(ownerId);
        User other = userService.get(otherId);

        Category sessions = categoryService.get(createCategory("USERSESSION"));
        long sharedId =
                createResourceWithRules(
                        "shared.session", sessions, ownerRule(owner), readOnlyRule(other));

        assertTrue(userService.delete(ownerId, "USERSESSION"));

        assertNotNull(
                "Resource shared with another user must be preserved",
                resourceService.get(sharedId));
        // The deleted owner's rule is removed by the User-entity cascade; the other user's
        // read rule must survive.
        assertEquals(1, resourceService.getSecurityRules(sharedId).size());
        assertEquals(1, userService.getCount(null));
    }

    @Test
    public void testDeleteUserCascadeIgnoresOtherCategories() throws Exception {
        long userId = createUser("congchen", Role.USER, "userPW");
        User user = userService.get(userId);

        Category sessions = categoryService.get(createCategory("USERSESSION"));
        Category maps = categoryService.get(createCategory("MAP"));
        long sessionId = createResourceWithRules("session", sessions, ownerRule(user));
        long mapId = createResourceWithRules("map", maps, ownerRule(user));

        assertTrue(userService.delete(userId, "USERSESSION"));

        assertNull("USERSESSION resource should be deleted", resourceService.get(sessionId));
        assertNotNull(
                "Resources of categories not listed in the cascade must be untouched",
                resourceService.get(mapId));
    }

    @Test
    public void testDeleteUserCascadeMatchesUsernameRule() throws Exception {
        // Externally-authenticated (LDAP/SSO) users own resources via a username string rule
        // (user FK is null): the cascade must match those too.
        long userId = createUser("ldapuser", Role.USER, "userPW");

        Category sessions = categoryService.get(createCategory("USERSESSION"));
        long sessionId =
                createResourceWithRules("ldap.session", sessions, usernameOwnerRule("ldapuser"));

        assertTrue(userService.delete(userId, "USERSESSION"));

        assertNull(
                "Resource owned via username rule should be cascade-deleted",
                resourceService.get(sessionId));
        assertEquals(0, userService.getCount(null));
    }

    @Test
    public void testDeleteUserWithoutCascadeLeavesResources() throws Exception {
        // The single-argument delete keeps the pre-existing behavior: the user's resources are
        // left in place (orphaned) — the cascade only happens when explicitly requested.
        long userId = createUser("congchen", Role.USER, "userPW");
        User user = userService.get(userId);

        Category sessions = categoryService.get(createCategory("USERSESSION"));
        long sessionId = createResourceWithRules("session", sessions, ownerRule(user));

        assertTrue(userService.delete(userId));

        assertNotNull(
                "Without the cascade parameter the resource must be left untouched",
                resourceService.get(sessionId));
    }

    private long createResourceWithRules(String name, Category category, SecurityRule... rules)
            throws Exception {
        Resource resource = new Resource();
        resource.setName(name);
        resource.setDescription(name);
        resource.setCategory(category);
        resource.setSecurity(Arrays.asList(rules));
        return resourceService.insert(resource);
    }

    private SecurityRule ownerRule(User user) {
        SecurityRule rule = new SecurityRule();
        rule.setUser(user);
        rule.setCanRead(true);
        rule.setCanWrite(true);
        return rule;
    }

    private SecurityRule readOnlyRule(User user) {
        SecurityRule rule = new SecurityRule();
        rule.setUser(user);
        rule.setCanRead(true);
        rule.setCanWrite(false);
        return rule;
    }

    private SecurityRule usernameOwnerRule(String username) {
        SecurityRule rule = new SecurityRule();
        rule.setUsername(username);
        rule.setCanRead(true);
        rule.setCanWrite(true);
        return rule;
    }

    @Test
    public void testUpdateAttributesReusingStoredNames() throws Exception {
        long userId =
                createUser(
                        "attributes",
                        Role.USER,
                        "testPW",
                        Arrays.asList(
                                attribute("email", "old@example.test"),
                                attribute("UUID", "stored-uuid")));

        userService.updateAttributes(
                userId,
                Arrays.asList(
                        attribute("email", "new@example.test"),
                        attribute("UUID", "stored-uuid"),
                        attribute("notes", "added")));

        assertEquals(
                Map.of("email", "new@example.test", "UUID", "stored-uuid", "notes", "added"),
                attributesOf(userId));

        userService.updateAttributes(userId, Arrays.asList(attribute("notes", "changed")));

        assertEquals(Map.of("notes", "changed"), attributesOf(userId));
    }

    private static UserAttribute attribute(String name, String value) {
        UserAttribute attribute = new UserAttribute();
        attribute.setName(name);
        attribute.setValue(value);
        return attribute;
    }

    private Map<String, String> attributesOf(long userId) {
        Map<String, String> values = new HashMap<>();
        for (UserAttribute attribute : userService.get(userId).getAttribute()) {
            values.put(attribute.getName(), attribute.getValue());
        }
        return values;
    }
}
