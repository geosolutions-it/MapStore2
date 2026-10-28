/*
 *  Copyright (C) 2007-2025 GeoSolutions S.A.S.
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

import static org.junit.Assert.assertThrows;

import static java.util.stream.Collectors.toList;

import it.geosolutions.geostore.core.model.Attribute;
import it.geosolutions.geostore.core.model.Category;
import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.SecurityRule;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.UserGroupAttribute;
import it.geosolutions.geostore.core.model.enums.DataType;
import it.geosolutions.geostore.core.model.enums.GroupReservedNames;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.services.dto.ShortResource;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.DuplicatedResourceNameServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;
import it.geosolutions.geostore.services.exception.ReservedUserGroupNameEx;

import org.junit.Test;

import java.util.*;
import java.util.stream.Collectors;

/**
 * @author DamianoG
 */
public class UserGroupServiceImplTest extends ServiceTestBase {

    @Test
    public void testGroupCRUDOperations() throws BadRequestServiceEx, NotFoundServiceEx {
        UserGroup ug1 = new UserGroup();
        ug1.setGroupName("ug1");
        userGroupService.insert(ug1);
        UserGroup ug2 = new UserGroup();
        ug2.setGroupName("ug2");
        userGroupService.insert(ug2);
        UserGroup ug3 = new UserGroup();
        ug3.setGroupName("ug3");
        userGroupService.insert(ug3);
        UserGroup ug4 = new UserGroup();
        ug4.setGroupName("ug4");
        userGroupService.insert(ug4);

        List<UserGroup> groups = userGroupService.getAll(null, null);
        assertEquals("Saved 4 groups but retrieved less or more groups...", 4, groups.size());

        userGroupService.delete(ug4.getId());
        groups = userGroupService.getAll(null, null);
        assertEquals("Removed 1 group of 4 but retrieved less or more groups...", 3, groups.size());
    }

    @Test
    public void testAssignGroupToUser() throws BadRequestServiceEx, NotFoundServiceEx {
        UserGroup ug1 = new UserGroup();
        ug1.setGroupName("ug1");
        long gid = userGroupService.insert(ug1);

        User u = new User();
        u.setName("u1");
        u.setPassword("password");
        u.setRole(Role.USER);
        long uid = userService.insert(u);

        userGroupService.assignUserGroup(uid, gid);

        User uu = userService.get(uid);
        Set<UserGroup> groups = uu.getGroups();
        assertEquals("GroupSize must be 1!", 1, groups.size());
    }

    /**
     * Test the case of updating permissions on rules based on resource/group when the group isn't
     * assigned yet to the resource Test the case of updating permissions on rules based on
     * resource/group when the group is already assigned to the resource
     *
     * @throws BadRequestServiceEx
     * @throws NotFoundServiceEx
     * @throws DuplicatedResourceNameServiceEx
     */
    @Test
    public void testChangeGroupPermissionsOnResources()
            throws BadRequestServiceEx, NotFoundServiceEx, DuplicatedResourceNameServiceEx {

        UserGroup ug1 = new UserGroup();
        ug1.setGroupName("ug1");
        long gid = userGroupService.insert(ug1);

        User u = new User();
        u.setName("u1");
        u.setPassword("password");
        u.setRole(Role.USER);
        Set<UserGroup> group = new HashSet<>();
        group.add(ug1);
        u.setGroups(group);
        long uid = userService.insert(u);

        Resource r = new Resource();
        List<Attribute> attributeList = new ArrayList<>();
        Attribute a1 = new Attribute();
        a1.setTextValue("a1");
        a1.setType(DataType.STRING);
        a1.setName("a1");
        attributeList.add(a1);
        r.setAttribute(attributeList);
        Category cat = new Category();
        cat.setName("cat1");
        r.setCategory(cat);
        r.setCreation(new Date());
        r.setName("r1");
        categoryService.insert(cat);
        long id = resourceService.insert(r);
        r = resourceService.get(id);

        List<Long> idList = new ArrayList<>();
        idList.add(id);
        List<Resource> resourcelist = resourceDAO.findResources(idList);
        List<SecurityRule> listSecurity = resourcelist.get(0).getSecurity();
        assertEquals(0, listSecurity.size()); // shouldn't be any rule...

        List<Long> listR = new ArrayList<>();
        listR.add(r.getId());

        List<ShortResource> listsr =
                userGroupService.updateSecurityRules(ug1.getId(), listR, true, true);
        assertEquals(1, listsr.size());
        assertTrue("Expected TRUE", listsr.get(0).isCanDelete());
        assertTrue("Expected TRUE", listsr.get(0).isCanEdit());
        assertTrue("Expected TRUE", listsr.get(0).isCanCopy());

        idList = new ArrayList<>();
        idList.add(id);
        resourcelist = resourceDAO.findResources(idList);
        listSecurity = resourcelist.get(0).getSecurity();
        assertEquals(1, listSecurity.size()); // now the rules should be 1: one for the group added

        listsr = userGroupService.updateSecurityRules(ug1.getId(), listR, false, false);
        assertEquals(1, listsr.size());
        assertFalse("Expected FALSE", listsr.get(0).isCanDelete());
        assertFalse("Expected FALSE", listsr.get(0).isCanEdit());
        assertFalse("Expected FALSE", listsr.get(0).isCanCopy());
    }

    /**
     * Test the insertion of a UserGroup with UserGroupAttributes.
     *
     * @throws BadRequestServiceEx
     */
    @Test
    public void testInsertGroupWithAttributes() throws BadRequestServiceEx {
        UserGroup group = new UserGroup();
        group.setGroupName("GroupWithAttrs");
        UserGroupAttribute attribute = new UserGroupAttribute();
        attribute.setName("attr1");
        attribute.setValue("value,value2,value3");

        UserGroupAttribute attribute2 = new UserGroupAttribute();
        attribute2.setName("attr2");
        attribute2.setValue("value4,value5,value6");

        group.setAttributes(Arrays.asList(attribute, attribute2));

        long id = userGroupService.insert(group);

        UserGroup ug = userGroupService.get(id);
        List<UserGroupAttribute> attributes = ug.getAttributes();
        assertEquals(2, attributes.size());
        assertEquals("attr1", attributes.get(0).getName());
        assertEquals("attr2", attributes.get(1).getName());
    }

    /**
     * Test the updating of UserGroupAttributes.
     *
     * @throws BadRequestServiceEx
     * @throws NotFoundServiceEx
     */
    @Test
    public void testUpdateGroup() throws BadRequestServiceEx, NotFoundServiceEx {
        UserGroup group = new UserGroup();
        group.setGroupName("GroupWithAttrs2");
        UserGroupAttribute attribute = new UserGroupAttribute();
        attribute.setName("attr1");
        attribute.setValue("value,value2,value3");

        UserGroupAttribute attribute2 = new UserGroupAttribute();
        attribute2.setName("attr2");
        attribute2.setValue("value4,value5,value6");

        group.setAttributes(Arrays.asList(attribute, attribute2));

        long id = userGroupService.insert(group);

        UserGroup toUpdate = userGroupService.get(id);
        toUpdate.setDescription("Updated Description");

        long idUpdated = userGroupService.update(toUpdate);

        UserGroup updated = userGroupService.get(idUpdated);

        assertEquals(id, idUpdated);
        assertEquals("Updated Description", updated.getDescription());
    }

    @Test
    public void testUpdateUserGroupAttributes() throws BadRequestServiceEx, NotFoundServiceEx {
        UserGroup group = new UserGroup();
        group.setGroupName("GroupWithAttrs2");
        UserGroupAttribute attribute = new UserGroupAttribute();
        attribute.setName("attr1");
        attribute.setValue("value,value2,value3");

        UserGroupAttribute attribute2 = new UserGroupAttribute();
        attribute2.setName("attr2");
        attribute2.setValue("value4,value5,value6");

        group.setAttributes(Arrays.asList(attribute, attribute2));

        long id = userGroupService.insert(group);

        UserGroupAttribute attributeToUpdate1 = new UserGroupAttribute();
        attributeToUpdate1.setName(attribute.getName());
        attributeToUpdate1.setValue(attribute.getValue());
        UserGroupAttribute attributeToUpdate2 = new UserGroupAttribute();
        attributeToUpdate2.setName("updated");
        attributeToUpdate2.setValue("updatedValue");
        List<UserGroupAttribute> attributes = Arrays.asList(attributeToUpdate1, attributeToUpdate2);

        userGroupService.updateAttributes(id, attributes);
        UserGroup groupUpdated = userGroupService.get(id);
        List<UserGroupAttribute> updatedList = groupUpdated.getAttributes();
        assertTrue(updatedList.stream().anyMatch(g -> g.getName().equals(attribute.getName())));
        assertTrue(
                updatedList.stream()
                        .anyMatch(g -> g.getName().equals(attributeToUpdate2.getName())));
        assertFalse(updatedList.stream().anyMatch(g -> g.getName().equals(attribute2.getName())));
    }

    @Test
    public void testgetByAttributes() throws BadRequestServiceEx {
        UserGroup group = new UserGroup();
        group.setGroupName("GroupWithAttrs");
        UserGroupAttribute attribute = new UserGroupAttribute();
        attribute.setName("organization");
        attribute.setValue("value");

        UserGroupAttribute attribute2 = new UserGroupAttribute();
        attribute2.setName("attr2");
        attribute2.setValue("value4,value5,value6");

        group.setAttributes(Arrays.asList(attribute, attribute2));

        long id = userGroupService.insert(group);

        UserGroup group2 = new UserGroup();
        group2.setGroupName("GroupWithAttrs2");
        UserGroupAttribute attribute21 = new UserGroupAttribute();
        attribute21.setName("Organization");
        attribute21.setValue("value");

        UserGroupAttribute attribute22 = new UserGroupAttribute();
        attribute22.setName("attr2");
        attribute22.setValue("value4,value5,value6");

        group2.setAttributes(Arrays.asList(attribute21, attribute22));

        userGroupService.insert(group2);
        UserGroupAttribute groupAttribute = new UserGroupAttribute();
        groupAttribute.setName("organization");
        groupAttribute.setValue("value");
        Collection<UserGroup> groups =
                userGroupService.findByAttribute("organization", Arrays.asList("value"), true);
        assertEquals(2, groups.size());

        groups = userGroupService.findByAttribute("organization", Arrays.asList("value"), false);
        assertEquals(1, groups.size());
    }

    @Test
    public void testGetWithAttributesLoadsAllAttributes() throws Exception {
        // create a group with two attributes
        UserGroup group = new UserGroup();
        group.setGroupName("group-get-with-attrs");
        UserGroupAttribute a1 = new UserGroupAttribute();
        a1.setName("k1");
        a1.setValue("v1");
        UserGroupAttribute a2 = new UserGroupAttribute();
        a2.setName("k2");
        a2.setValue("v2");
        group.setAttributes(Arrays.asList(a1, a2));

        long id = userGroupService.insert(group);

        // WHEN
        UserGroup loaded = userGroupService.getWithAttributes(id);

        // THEN
        assertNotNull(loaded);
        assertEquals(id, loaded.getId().longValue());
        assertNotNull("Attributes must be initialized", loaded.getAttributes());
        assertEquals(2, loaded.getAttributes().size());
        // ordering is not guaranteed; check by name
        assertTrue(
                loaded.getAttributes().stream()
                        .anyMatch(ua -> "k1".equals(ua.getName()) && "v1".equals(ua.getValue())));
        assertTrue(
                loaded.getAttributes().stream()
                        .anyMatch(ua -> "k2".equals(ua.getName()) && "v2".equals(ua.getValue())));
    }

    @Test
    public void testUpsertAttributeInsertAndUpdate() throws Exception {
        // start with a group having a different attribute
        UserGroup group = new UserGroup();
        group.setGroupName("group-upsert-attrs");
        UserGroupAttribute base = new UserGroupAttribute();
        base.setName("base");
        base.setValue("b0");
        group.setAttributes(Arrays.asList(base));

        long id = userGroupService.insert(group);

        // 1) INSERT a new attribute (k1=v1)
        userGroupService.upsertAttribute(id, "k1", "v1");
        UserGroup afterInsert = userGroupService.getWithAttributes(id);
        assertNotNull(afterInsert.getAttributes());
        assertEquals(
                "Should still have 2 attributes (base + k1)",
                2,
                afterInsert.getAttributes().size());
        assertTrue(
                afterInsert.getAttributes().stream()
                        .anyMatch(a -> "base".equals(a.getName()) && "b0".equals(a.getValue())));
        assertTrue(
                afterInsert.getAttributes().stream()
                        .anyMatch(a -> "k1".equals(a.getName()) && "v1".equals(a.getValue())));

        // 2) UPDATE existing attribute (k1=v2)
        userGroupService.upsertAttribute(id, "k1", "v2");
        UserGroup afterUpdate = userGroupService.getWithAttributes(id);
        assertEquals(
                "Attribute count must remain the same after update",
                2,
                afterUpdate.getAttributes().size());
        long k1Count =
                afterUpdate.getAttributes().stream().filter(a -> "k1".equals(a.getName())).count();
        assertEquals("Upsert must not duplicate attributes with the same name", 1, k1Count);
        assertTrue(
                afterUpdate.getAttributes().stream()
                        .anyMatch(a -> "k1".equals(a.getName()) && "v2".equals(a.getValue())));
        // base attribute must be preserved
        assertTrue(
                afterUpdate.getAttributes().stream()
                        .anyMatch(a -> "base".equals(a.getName()) && "b0".equals(a.getValue())));

        // 3) INSERT another attribute to ensure others aren't dropped
        userGroupService.upsertAttribute(id, "k2", "v2");
        UserGroup afterSecondInsert = userGroupService.getWithAttributes(id);
        assertEquals(
                "Now we should have 3 attributes", 3, afterSecondInsert.getAttributes().size());
        assertTrue(
                afterSecondInsert.getAttributes().stream()
                        .anyMatch(a -> "k2".equals(a.getName()) && "v2".equals(a.getValue())));
    }

    @Test
    public void testUpsertAttributeOnMissingGroupThrowsNotFound() {
        long missingId = Long.MAX_VALUE;

        try {
            userGroupService.upsertAttribute(missingId, "any", "value");
            fail("Expected NotFoundServiceEx to be thrown");
        } catch (it.geosolutions.geostore.services.exception.NotFoundServiceEx e) {
            // message may vary; keep assertion loose
            String msg = e.getMessage() == null ? "" : e.getMessage().toLowerCase();
            assertTrue(
                    "Exception message should hint 'not found'",
                    msg.contains("not found") || msg.contains("usergroup"));
        } catch (Exception other) {
            fail("Unexpected exception type: " + other);
        }
    }

    @Test
    public void testInsertReservedGroupFails() throws BadRequestServiceEx {
        assertThrows(
                ReservedUserGroupNameEx.class,
                () -> userGroupService.insert(group(GroupReservedNames.EVERYONE.groupName())));
    }

    @Test
    public void testDeleteReservedGroupFails() throws Exception {
        ensureReservedExists();
        UserGroup everyone = userGroupService.get(GroupReservedNames.EVERYONE.groupName());
        assertNotNull("Reserved EVERYONE group must exist for this test", everyone);
        assertThrows(BadRequestServiceEx.class, () -> userGroupService.delete(everyone.getId()));
    }

    @Test
    public void testAssignReservedGroupFails() throws Exception {
        ensureReservedExists();
        UserGroup everyone = userGroupService.get(GroupReservedNames.EVERYONE.groupName());
        assertNotNull("Reserved EVERYONE group must exist for this test", everyone);

        long uid = userService.insert(user("u"));
        assertThrows(
                NotFoundServiceEx.class,
                () -> userGroupService.assignUserGroup(uid, everyone.getId()));
    }

    @Test
    public void testGetAllAllowedForUser() throws Exception {
        long g1 = userGroupService.insert(group("A"));
        long g2 = userGroupService.insert(group("B"));
        long g3 = userGroupService.insert(group("C"));

        long uid = userService.insert(user("u1"));
        userGroupService.assignUserGroup(uid, g1);
        userGroupService.assignUserGroup(uid, g3);

        User u = userService.get(uid);
        List<UserGroup> allowed = userGroupService.getAllAllowed(u, null, null, null, true);
        assertEquals(
                Set.of(g1, g3), allowed.stream().map(UserGroup::getId).collect(Collectors.toSet()));
    }

    @Test
    public void testGetAllAllowedForAdmin() throws Exception {
        long g1 = userGroupService.insert(group("A"));
        long g2 = userGroupService.insert(group("B"));
        long g3 = userGroupService.insert(group("C"));

        long uid = userService.insert(admin("administrator"));

        User u = userService.get(uid);
        List<UserGroup> allowed = userGroupService.getAllAllowed(u, null, null, null, true);
        assertEquals(
                Set.of(g1, g2, g3),
                allowed.stream().map(UserGroup::getId).collect(Collectors.toSet()));
    }

    @Test
    public void testGetAllPaginationAndSorting() throws Exception {
        for (String n : List.of("bbb", "aaa", "ccc")) userGroupService.insert(group(n));
        List<UserGroup> page0 = userGroupService.getAll(0, 2);
        assertEquals(
                List.of("aaa", "bbb"),
                page0.stream().map(UserGroup::getGroupName).collect(toList()));
        List<UserGroup> page1 = userGroupService.getAll(1, 2);
        assertEquals(List.of("ccc"), page1.stream().map(UserGroup::getGroupName).collect(toList()));
    }

    @Test
    public void testNameLikeAndReservedToggle() throws Exception {
        userGroupService.insert(group("devs"));
        userGroupService.insert(group("qa"));
        ensureReservedExists();

        assertEquals(1, userGroupService.getAll(null, null, "de%", true).size());
        assertEquals(0, userGroupService.getAll(null, null, "EVER%", false).size());
    }

    @Test
    public void testUpdateByNameWhenIdMissing() throws Exception {
        long id = userGroupService.insert(group("updateMe"));
        UserGroup g = new UserGroup();
        g.setGroupName("updateMe");
        g.setDescription("D");
        // Avoid NPE due to null autounboxing; push code path to "lookup by name"
        g.setId(0L);
        long updatedId = userGroupService.update(g);
        assertEquals(id, updatedId);
        assertEquals("D", userGroupService.get(id).getDescription());
    }

    @Test
    public void testUpdateAttributesReplacesAll() throws Exception {
        long id = userGroupService.insert(groupWithAttrs("G", attr("a", "1"), attr("b", "2")));
        userGroupService.updateAttributes(id, List.of(attr("a", "1"), attr("c", "3")));
        List<UserGroupAttribute> attrs = userGroupService.getWithAttributes(id).getAttributes();
        assertNames(attrs, "a", "c"); // "b" removed
    }

    @Test
    public void testUpsertAttributeUpdatesCaseInsensitiveAndNullValue() throws Exception {
        long id = userGroupService.insert(groupWithAttrs("G", attr("SoUrCeSeRvIcE", "old")));
        userGroupService.upsertAttribute(id, "sourceservice", null); // policy: allow null
        UserGroup g = userGroupService.getWithAttributes(id);
        assertTrue(
                g.getAttributes().stream()
                        .anyMatch(a -> "sourceservice".equalsIgnoreCase(a.getName())));
    }

    @Test
    public void testGetWithAttributesIsEager() throws Exception {
        long id = userGroupService.insert(groupWithAttrs("G", attr("k", "v")));
        UserGroup g = userGroupService.getWithAttributes(id);
        // simulate detached use
        List<UserGroupAttribute> copy = new ArrayList<>(g.getAttributes());
        assertEquals(1, copy.size());
    }

    @Test
    public void testUpdateSecurityRulesEveryoneInvalidCombo() throws Exception {
        ensureReservedExists();
        UserGroup everyone = userGroupService.get(GroupReservedNames.EVERYONE.groupName());
        assertNotNull("Reserved EVERYONE group must exist for this test", everyone);
        assertThrows(
                BadRequestServiceEx.class,
                () ->
                        userGroupService.updateSecurityRules(
                                everyone.getId(), List.of(1L), false, true));
    }

    @Test
    public void testDeleteDetachesFromUsers() throws Exception {
        long gid = userGroupService.insert(group("toRemove"));
        long uid = userService.insert(user("x"));
        userGroupService.assignUserGroup(uid, gid);
        userGroupService.delete(gid);
        assertTrue(userService.get(uid).getGroups().isEmpty());
    }

    @Test
    public void testUpdateAttributesWithDetachedInstancesDoesNotThrow() throws Exception {
        // 1) Create a group with one attribute
        UserGroup group = new UserGroup();
        group.setGroupName("group-detached-updates");
        UserGroupAttribute base = new UserGroupAttribute();
        base.setName("base");
        base.setValue("b0");
        group.setAttributes(List.of(base));
        long id = userGroupService.insert(group);

        // 2) Load with attributes to obtain *detached* instances outside the original persist
        // context
        UserGroup loaded = userGroupService.getWithAttributes(id);
        assertNotNull(loaded);
        assertNotNull("Attributes must be initialized", loaded.getAttributes());
        assertEquals(1, loaded.getAttributes().size());

        // This is the detached instance we will re-use (carrying an id)
        UserGroupAttribute detached = loaded.getAttributes().get(0);
        // Change its value to verify the replacement logic actually persists our change
        detached.setValue("b1");

        // Add a brand-new attribute alongside the detached one
        UserGroupAttribute extra = new UserGroupAttribute();
        extra.setName("k1");
        extra.setValue("v1");

        // 3) BEFORE the fix this call would throw PersistentObjectException due to detached attr
        userGroupService.updateAttributes(id, Arrays.asList(detached, extra));

        // 4) Verify the attributes got replaced properly and no duplicates exist
        UserGroup after = userGroupService.getWithAttributes(id);
        assertNotNull(after);
        assertNotNull(after.getAttributes());
        assertEquals("Should now have 2 attributes", 2, after.getAttributes().size());

        // Verify updated 'base' is present with the NEW value
        assertTrue(
                "Updated base attribute (b1) must be present",
                after.getAttributes().stream()
                        .anyMatch(a -> "base".equals(a.getName()) && "b1".equals(a.getValue())));

        // Verify the new attribute is there too
        assertTrue(
                "New attribute k1=v1 must be present",
                after.getAttributes().stream()
                        .anyMatch(a -> "k1".equals(a.getName()) && "v1".equals(a.getValue())));

        // Optional: ensure every attribute is bound to the correct owning group
        assertTrue(
                "All attributes must reference the owning group",
                after.getAttributes().stream()
                        .allMatch(a -> a.getUserGroup() != null && id == a.getUserGroup().getId()));
    }

    @Test
    public void testUpdateAttributesIgnoresIncomingIdsOnNewAttributes() throws Exception {
        long id = userGroupService.insert(groupWithAttrs("ignore-ids", attr("a", "1")));

        // Create a "new" attribute but poison it with a random id to mimic stale/detached usage
        UserGroupAttribute poisoned = new UserGroupAttribute();
        poisoned.setId(999999L); // should be ignored/nullified by the service before persist
        poisoned.setName("b");
        poisoned.setValue("2");

        userGroupService.updateAttributes(id, Arrays.asList(attr("a", "1"), poisoned));

        UserGroup reloaded = userGroupService.getWithAttributes(id);
        assertNotNull(reloaded);
        assertEquals(2, reloaded.getAttributes().size());
        // Must contain both 'a' and 'b' exactly once
        Map<String, Long> byName =
                reloaded.getAttributes().stream()
                        .collect(
                                Collectors.groupingBy(
                                        UserGroupAttribute::getName, Collectors.counting()));
        assertEquals(Long.valueOf(1L), byName.get("a"));
        assertEquals(Long.valueOf(1L), byName.get("b"));
    }

    private static UserGroup group(String name) {
        UserGroup g = new UserGroup();
        g.setGroupName(name);
        return g;
    }

    private static User admin(String name) {
        User admin = user(name);
        admin.setRole(Role.ADMIN);
        return admin;
    }

    private static User user(String name) {
        User u = new User();
        u.setName(name);
        u.setPassword("p");
        u.setRole(Role.USER);
        u.setEnabled(true);
        u.setGroups(new HashSet<>());
        u.setAttribute(new ArrayList<>());
        return u;
    }

    private static UserGroupAttribute attr(String k, String v) {
        UserGroupAttribute a = new UserGroupAttribute();
        a.setName(k);
        a.setValue(v);
        return a;
    }

    private static UserGroup groupWithAttrs(String name, UserGroupAttribute... atts) {
        UserGroup g = group(name);
        g.setAttributes(Arrays.asList(atts));
        return g;
    }

    private static void assertNames(List<UserGroupAttribute> attrs, String... names) {
        assertEquals(
                Set.of(names),
                attrs.stream().map(UserGroupAttribute::getName).collect(Collectors.toSet()));
    }

    /** Ensure the reserved EVERYONE group exists, creating it via the special path if missing. */
    private void ensureReservedExists() throws BadRequestServiceEx {
        String reserved = GroupReservedNames.EVERYONE.groupName();
        if (userGroupService.get(reserved) == null) {
            userGroupService.insertSpecialUsersGroups();
        }
    }
}
