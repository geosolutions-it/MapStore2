package it.geosolutions.geostore.services;

import inet.ipaddr.IPAddress;
import inet.ipaddr.IPAddressString;

import it.geosolutions.geostore.core.model.IPRange;
import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.SecurityRule;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.Role;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.List;
import java.util.Set;
import java.util.function.BiPredicate;

public class ResourcePermissionServiceImpl implements ResourcePermissionService {

    private static final Logger LOGGER = LogManager.getLogger(ResourcePermissionServiceImpl.class);

    private final BiPredicate<SecurityRule, User> resourceUserOwnership =
            (rule, user) ->
                    rule.getUsername() != null && rule.getUsername().equals(user.getName())
                            || rule.getUser() != null
                                    && rule.getUser().getId() != null
                                    && rule.getUser().getId().equals(user.getId());

    private final BiPredicate<SecurityRule, UserGroup> resourceGroupOwnership =
            (rule, group) ->
                    rule.getGroupname() != null && rule.getGroupname().equals(group.getGroupName())
                            || rule.getGroup() != null
                                    && rule.getGroup().getId() != null
                                    && rule.getGroup().getId().equals(group.getId());

    private final BiPredicate<SecurityRule, User> resourceUserIPAccess =
            (rule, user) -> isUserIPAllowed(user, rule.getIpRanges());

    private final BiPredicate<SecurityRule, User> resourceUserOwnershipWithReadPermission =
            (rule, user) -> resourceUserOwnership.test(rule, user) && rule.isCanRead();

    private final BiPredicate<SecurityRule, UserGroup> resourceGroupOwnershipWithReadPermission =
            (rule, group) -> resourceGroupOwnership.test(rule, group) && rule.isCanRead();

    private final BiPredicate<SecurityRule, User> resourceUserIPAccessWithReadPermission =
            (rule, user) -> resourceUserIPAccess.test(rule, user) && rule.isCanRead();

    private final BiPredicate<SecurityRule, User> resourceUserOwnershipWithWritePermission =
            (rule, user) -> resourceUserOwnership.test(rule, user) && rule.isCanWrite();

    private final BiPredicate<SecurityRule, UserGroup> resourceGroupOwnershipWithWritePermission =
            (rule, group) -> resourceGroupOwnership.test(rule, group) && rule.isCanWrite();

    private final BiPredicate<SecurityRule, User> resourceUserIPAccessWithWritePermission =
            (rule, user) -> resourceUserIPAccess.test(rule, user) && rule.isCanWrite();

    @Override
    public boolean canResourceBeReadByUser(Resource resource, User user) {
        if (user.getRole() != null && user.getRole().equals(Role.ADMIN)) {
            return true;
        }
        checkResourceSecurityRules(resource);
        return canUserAccessWithReadPermission(resource, user);
    }

    private boolean canUserAccessWithReadPermission(Resource resource, User user) {
        return hasUserOwnershipWithReadPermission(user, resource)
                || haveUserGroupsOwnershipWithReadPermission(user, resource)
                || hasUserAccessByIpWithReadPermission(user, resource);
    }

    private boolean hasUserOwnershipWithReadPermission(User user, Resource resource) {
        return checkSecurityRulesAgainstUser(
                resource.getSecurity(), user, resourceUserOwnershipWithReadPermission);
    }

    private boolean haveUserGroupsOwnershipWithReadPermission(User user, Resource resource) {
        return checkResourceSecurityRulesAgainstUserGroup(
                user, resource, resourceGroupOwnershipWithReadPermission);
    }

    private boolean hasUserAccessByIpWithReadPermission(User user, Resource resource) {
        return checkSecurityRulesAgainstUser(
                resource.getSecurity(), user, resourceUserIPAccessWithReadPermission);
    }

    @Override
    public boolean canResourceBeWrittenByUser(Resource resource, User user) {
        if (user.getRole() != null
                && !user.getRole().equals(Role.GUEST)
                && user.getRole().equals(Role.ADMIN)) {
            return true;
        }
        checkResourceSecurityRules(resource);
        return canUserAccessWithWritePermission(resource, user);
    }

    private void checkResourceSecurityRules(Resource resource) {
        if (resource != null && resource.getSecurity() == null) {
            throw new IllegalArgumentException(
                    "set resource security rules prior checking for permissions");
        }
    }

    private boolean canUserAccessWithWritePermission(Resource resource, User user) {
        return hasUserOwnershipWithWritePermission(user, resource)
                || haveUserGroupsOwnershipWithWritePermission(user, resource)
                || hasUserAccessByIpWithWritePermission(user, resource);
    }

    private boolean hasUserOwnershipWithWritePermission(User user, Resource resource) {
        return checkSecurityRulesAgainstUser(
                resource.getSecurity(), user, resourceUserOwnershipWithWritePermission);
    }

    private boolean checkSecurityRulesAgainstUser(
            List<SecurityRule> rules, User user, BiPredicate<SecurityRule, User> check) {
        return rules.stream().anyMatch(rule -> check.test(rule, user));
    }

    private boolean haveUserGroupsOwnershipWithWritePermission(User user, Resource resource) {
        return checkResourceSecurityRulesAgainstUserGroup(
                user, resource, resourceGroupOwnershipWithWritePermission);
    }

    private boolean checkResourceSecurityRulesAgainstUserGroup(
            User user, Resource resource, BiPredicate<SecurityRule, UserGroup> check) {

        if (user.getGroups() == null || user.getGroups().isEmpty()) {
            return false;
        }

        return user.getGroups().stream()
                .anyMatch(
                        group ->
                                checkSecurityRulesAgainstUserGroup(
                                        resource.getSecurity(), group, check));
    }

    private boolean checkSecurityRulesAgainstUserGroup(
            List<SecurityRule> rules, UserGroup group, BiPredicate<SecurityRule, UserGroup> check) {
        return rules.stream().anyMatch(rule -> check.test(rule, group));
    }

    private boolean hasUserAccessByIpWithWritePermission(User user, Resource resource) {
        return checkSecurityRulesAgainstUser(
                resource.getSecurity(), user, resourceUserIPAccessWithWritePermission);
    }

    private boolean isUserIPAllowed(User user, Set<IPRange> ipRanges) {
        if (ipRanges == null || ipRanges.isEmpty()) {
            return false;
        }

        boolean userAllowed =
                ipRanges.stream()
                        .anyMatch(ipRange -> isUserIPInRange(user.getIpAddress(), ipRange));

        if (!userAllowed) {
            LOGGER.debug("User not allowed to access resource due to IP address restriction");
        }

        return userAllowed;
    }

    private boolean isUserIPInRange(IPAddress userIPAddress, IPRange ipRange) {
        if (userIPAddress == null) {
            throw new IllegalStateException(
                    "Missing IP address for the requesting user. Cannot proceed.");
        }

        IPAddress cidr = new IPAddressString(ipRange.getCidr()).getAddress().toPrefixBlock();

        return cidr.contains(userIPAddress);
    }
}
