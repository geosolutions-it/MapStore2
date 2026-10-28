/*  Copyright (C) 2007 - 2025 GeoSolutions S.A.S.
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

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;

import inet.ipaddr.IPAddressString;

import it.geosolutions.geostore.core.model.IPRange;
import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.SecurityRule;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.GroupReservedNames;
import it.geosolutions.geostore.core.model.enums.Role;

import org.junit.Before;
import org.junit.Test;

import java.util.Collections;
import java.util.List;
import java.util.Set;

public class ResourcePermissionServiceImplTest {

    private ResourcePermissionServiceImpl service;

    @Before
    public void setUp() {
        service = new ResourcePermissionServiceImpl();
    }

    @Test
    public void testCanReadByUserNameMatch() {
        // Create a user with name "alice" and a dummy ID
        User user = new User();
        user.setId(100L);
        user.setName("alice");
        user.setRole(Role.USER);

        // Create a security rule: mismatch on user ID, but match on user's name
        SecurityRule rule = new SecurityRule();
        User ruleUser = new User();
        ruleUser.setId(999L);
        rule.setUser(ruleUser);
        rule.setUsername("alice");
        rule.setCanRead(true);

        Resource resource = new Resource();
        resource.setSecurity(Collections.singletonList(rule));

        // Assert that read is allowed via user's name matching
        assertTrue(
                "User should have read access via user's name match",
                service.canResourceBeReadByUser(resource, user));
    }

    @Test
    public void testCanReadByRuleUsernameMatch() {
        // Create a user with name "alice" and a dummy ID
        User user = new User();
        user.setId(-1L);
        user.setName("alice");
        user.setRole(Role.USER);

        // Create a security rule: match on rule username
        SecurityRule rule = new SecurityRule();
        rule.setUsername("alice");
        rule.setCanRead(true);

        Resource resource = new Resource();
        resource.setSecurity(Collections.singletonList(rule));

        // Assert that read is allowed via rule username matching
        assertTrue(
                "User should have read access via username match",
                service.canResourceBeReadByUser(resource, user));
    }

    @Test
    public void testCannotWriteByRuleFilledUserId() {
        // LDAP direct user
        User user = new User();
        user.setId(-1L);
        user.setName("alice");
        user.setRole(Role.USER);

        // with external security, security rules contain a dummy user
        User filledUser = new User();
        filledUser.setId(null);
        filledUser.setName("admin");
        SecurityRule filledRule = new SecurityRule();
        filledRule.setCanRead(true);
        filledRule.setCanWrite(true);
        filledRule.setUser(filledUser);

        Resource resource = new Resource();
        resource.setSecurity(Collections.singletonList(filledRule));

        // Assert that read is NOT allowed
        assertFalse(
                "User shouldn't have write access",
                service.canResourceBeWrittenByUser(resource, filledUser));
    }

    @Test
    public void testCanReadByGroupNameMatch() {
        // Create a user and assign to a group named "editors"
        UserGroup group = new UserGroup();
        group.setId(10L);
        group.setGroupName("editors");

        User user = new User();
        user.setId(200L);
        user.setName("bob");
        user.setRole(Role.USER);
        user.setGroups(Collections.singleton(group));

        // Create a security rule: mismatch on group ID, but match on group's name
        SecurityRule rule = new SecurityRule();
        UserGroup ruleGroup = new UserGroup();
        ruleGroup.setId(888L);
        rule.setGroup(ruleGroup);
        rule.setGroupname("editors");
        rule.setCanRead(true);

        Resource resource = new Resource();
        resource.setSecurity(Collections.singletonList(rule));

        // Assert that read is allowed via group's name matching
        assertTrue(
                "User should have read access via group's name match",
                service.canResourceBeReadByUser(resource, user));
    }

    @Test
    public void testCanReadByRuleGroupnameMatch() {
        // Create a user and assign to a group named "editors"
        UserGroup group = new UserGroup();
        group.setId(-1L);
        group.setGroupName("editors");

        User user = new User();
        user.setId(-1L);
        user.setName("bob");
        user.setRole(Role.USER);
        user.setGroups(Collections.singleton(group));

        // Create a security rule: match on rule groupname
        SecurityRule rule = new SecurityRule();
        rule.setGroupname("editors");
        rule.setCanRead(true);

        Resource resource = new Resource();
        resource.setSecurity(Collections.singletonList(rule));

        // Assert that read is allowed via rule groupname matching
        assertTrue(
                "User should have read access via group name match",
                service.canResourceBeReadByUser(resource, user));
    }

    @Test
    public void testCannotWriteByRuleFilledGroupId() {
        // LDAP direct group
        UserGroup group = new UserGroup();
        group.setId(-1L);
        group.setGroupName("group");

        User user = new User();
        user.setId(-1L);
        user.setName("bob");
        user.setRole(Role.USER);
        user.setGroups(Collections.singleton(group));

        // with external security, security rules contain a dummy group
        UserGroup filledGroup = new UserGroup();
        filledGroup.setId(null);
        filledGroup.setGroupName("admins");
        SecurityRule filledRule = new SecurityRule();
        filledRule.setCanRead(true);
        filledRule.setCanWrite(true);
        filledRule.setGroup(filledGroup);

        Resource resource = new Resource();
        resource.setSecurity(Collections.singletonList(filledRule));

        // Assert that read is NOT allowed
        assertFalse(
                "User shouldn't have write access",
                service.canResourceBeWrittenByUser(resource, user));
    }

    @Test
    public void testGuestCanReadEveryoneResource() {
        UserGroup group = new UserGroup();
        group.setId(-1L);
        group.setGroupName(GroupReservedNames.EVERYONE.groupName());

        User user = new User();
        user.setId(null);
        user.setName("guest");
        user.setRole(Role.GUEST);
        user.setGroups(Collections.singleton(group));

        // Create a security rule: match on rule groupname
        SecurityRule rule = new SecurityRule();
        rule.setGroupname(GroupReservedNames.EVERYONE.groupName());
        rule.setCanRead(true);

        Resource resource = new Resource();
        resource.setSecurity(Collections.singletonList(rule));

        // Assert that read is allowed via rule groupname matching
        assertTrue(
                "User should have read access via everyone group match",
                service.canResourceBeReadByUser(resource, user));
    }

    @Test
    public void testUserCanAccessByIPAddress() {
        // Create a user
        User user = new User();
        user.setId(100L);
        user.setRole(Role.USER);
        user.setIpAddress(new IPAddressString("1.2.3.4").getAddress());

        // Create IP range for the security rule that contains user's IP address
        IPRange ipRange = new IPRange();
        ipRange.setCidr("1.2.3.0/24");

        // Create a security rule with read and write permissions
        SecurityRule rule = new SecurityRule();
        rule.setCanRead(true);
        rule.setCanWrite(true);
        rule.setIpRanges(Set.of(ipRange));

        Resource resource = new Resource();
        resource.setSecurity(Collections.singletonList(rule));

        // Assert that access is allowed
        assertTrue(service.canResourceBeReadByUser(resource, user));
        assertTrue(service.canResourceBeWrittenByUser(resource, user));
    }

    @Test
    public void testUserCannotAccessByIPAddress() {
        // Create a user
        User user = new User();
        user.setId(100L);
        user.setRole(Role.USER);
        user.setIpAddress(new IPAddressString("127.0.0.1").getAddress());

        // Create IP range for the security rule that does not contain user's IP address
        IPRange ipRange = new IPRange();
        ipRange.setCidr("1.2.3.4/32");

        // Create a security rule with read and write permissions
        SecurityRule rule = new SecurityRule();
        rule.setCanRead(true);
        rule.setCanWrite(true);
        rule.setIpRanges(Set.of(ipRange));

        Resource resource = new Resource();
        resource.setSecurity(Collections.singletonList(rule));

        // Assert that access is not allowed
        assertFalse(service.canResourceBeReadByUser(resource, user));
        assertFalse(service.canResourceBeWrittenByUser(resource, user));
    }

    @Test
    public void testUserCannotAccessIfIPAddressIsMissing() {
        // Create a user
        User user = new User();
        user.setId(100L);
        user.setRole(Role.USER);
        user.setIpAddress(null);

        // Create IP range for the security rule
        IPRange ipRange = new IPRange();
        ipRange.setCidr("101.102.103.104/32");

        // Create a security rule with read and write permissions
        SecurityRule rule = new SecurityRule();
        rule.setCanRead(true);
        rule.setCanWrite(true);
        rule.setIpRanges(Set.of(ipRange));

        Resource resource = new Resource();
        resource.setSecurity(Collections.singletonList(rule));

        // Assert that access is not permitted
        IllegalStateException readException =
                assertThrows(
                        IllegalStateException.class,
                        () -> service.canResourceBeReadByUser(resource, user));
        assertTrue(readException.getMessage().contains("Missing IP address"));
        IllegalStateException writeException =
                assertThrows(
                        IllegalStateException.class,
                        () -> service.canResourceBeWrittenByUser(resource, user));
        assertTrue(writeException.getMessage().contains("Missing IP address"));
    }

    @Test
    public void testUserCanAccessIfIPRangeAppliesToAdditionalRule() {
        // Create a user
        User user = new User();
        user.setId(100L);
        user.setRole(Role.USER);
        user.setIpAddress(new IPAddressString("127.0.0.1").getAddress());

        // Create IP range that does not contain user's IP address
        IPRange ipRange = new IPRange();
        ipRange.setCidr("1.2.3.4/32");

        // Create a security rule with an IPRange
        SecurityRule ruleWithIPRange = new SecurityRule();
        ruleWithIPRange.setIpRanges(Set.of(ipRange));

        // Create a security rule for the user without an IPRange
        SecurityRule ruleWithoutIPRange = new SecurityRule();
        ruleWithoutIPRange.setUser(user);
        ruleWithoutIPRange.setCanRead(true);
        ruleWithoutIPRange.setCanWrite(true);

        Resource resource = new Resource();
        resource.setSecurity(List.of(ruleWithIPRange, ruleWithoutIPRange));

        // Assert that access is allowed
        assertTrue(service.canResourceBeReadByUser(resource, user));
        assertTrue(service.canResourceBeWrittenByUser(resource, user));
    }

    @Test
    public void testUserCanAccessIfRulesHaveConflictingIPRanges() {
        // Create a user
        User user = new User();
        user.setId(100L);
        user.setRole(Role.USER);
        user.setIpAddress(new IPAddressString("127.0.0.1").getAddress());

        // Create IP range that contains user's IP address
        IPRange inclusiveIpRange = new IPRange();
        inclusiveIpRange.setCidr("127.0.0.0/24");

        // Create IP range that does not contain user's IP address
        IPRange exclusiveIpRange = new IPRange();
        exclusiveIpRange.setCidr("1.2.3.4/32");

        // Create security rules for the IP ranges
        SecurityRule inclusiveSecurityRule = new SecurityRule();
        inclusiveSecurityRule.setCanRead(true);
        inclusiveSecurityRule.setCanWrite(true);
        inclusiveSecurityRule.setIpRanges(Set.of(inclusiveIpRange));

        SecurityRule exclusiveSecurityRule = new SecurityRule();
        exclusiveSecurityRule.setCanRead(true);
        exclusiveSecurityRule.setCanWrite(true);
        exclusiveSecurityRule.setIpRanges(Set.of(exclusiveIpRange));

        Resource resource = new Resource();
        resource.setSecurity(List.of(inclusiveSecurityRule, exclusiveSecurityRule));

        // Assert that access is allowed
        assertTrue(service.canResourceBeReadByUser(resource, user));
        assertTrue(service.canResourceBeWrittenByUser(resource, user));
    }

    @Test
    public void testPermissionsWithDefaultNetworkIPAddress() {
        User user = new User();
        user.setId(100L);
        user.setRole(Role.USER);
        user.setIpAddress(new IPAddressString("15.222.30.111").getAddress());

        IPRange ipRange = new IPRange();
        ipRange.setCidr("0.0.0.0/0");

        SecurityRule rule = new SecurityRule();
        rule.setCanRead(true);
        rule.setCanWrite(true);
        rule.setIpRanges(Set.of(ipRange));

        Resource resource = new Resource();
        resource.setSecurity(Collections.singletonList(rule));

        assertTrue(service.canResourceBeReadByUser(resource, user));
        assertTrue(service.canResourceBeWrittenByUser(resource, user));
    }

    @Test
    public void testPermissionsWithCidrEqualsIPAddress() {
        User user = new User();
        user.setId(100L);
        user.setRole(Role.USER);
        user.setIpAddress(new IPAddressString("192.168.1.0").getAddress());

        IPRange ipRange = new IPRange();
        ipRange.setCidr("192.168.1.0/32");

        SecurityRule rule = new SecurityRule();
        rule.setCanRead(true);
        rule.setCanWrite(true);
        rule.setIpRanges(Set.of(ipRange));

        Resource resource = new Resource();
        resource.setSecurity(Collections.singletonList(rule));

        assertTrue(service.canResourceBeReadByUser(resource, user));
        assertTrue(service.canResourceBeWrittenByUser(resource, user));
    }

    @Test
    public void testPermissionsWithMultipleConflictingCidrs() {
        User user = new User();
        user.setId(100L);
        user.setRole(Role.USER);
        user.setIpAddress(new IPAddressString("122.15.55.34").getAddress());

        IPRange ipRangeExclusive = new IPRange();
        ipRangeExclusive.setCidr("192.168.1.0/12");
        IPRange ipRangeInclusive = new IPRange();
        ipRangeInclusive.setCidr("122.15.0.0/16");

        SecurityRule rule = new SecurityRule();
        rule.setCanRead(true);
        rule.setCanWrite(true);
        rule.setIpRanges(Set.of(ipRangeExclusive, ipRangeInclusive));

        Resource resource = new Resource();
        resource.setSecurity(Collections.singletonList(rule));

        assertTrue(service.canResourceBeReadByUser(resource, user));
        assertTrue(service.canResourceBeWrittenByUser(resource, user));
    }
}
