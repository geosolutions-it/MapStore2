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

import com.googlecode.genericdao.search.Filter;
import com.googlecode.genericdao.search.Search;

import it.geosolutions.geostore.core.dao.*;
import it.geosolutions.geostore.core.model.*;
import it.geosolutions.geostore.core.model.enums.GroupReservedNames;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.services.dto.ShortResource;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;
import it.geosolutions.geostore.services.exception.ReservedUserGroupNameEx;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * @author DamianoG
 */
@Transactional(value = "geostoreTransactionManager", readOnly = true)
public class UserGroupServiceImpl implements UserGroupService {

    private static final Logger LOGGER = LogManager.getLogger(UserGroupServiceImpl.class);

    private UserGroupDAO userGroupDAO;

    private UserDAO userDAO;

    private ResourceDAO resourceDAO;

    private SecurityDAO securityDAO;

    private UserGroupAttributeDAO userGroupAttributeDAO;

    /**
     * @param userGroupDAO the userGroupDAO to set
     */
    public void setUserGroupDAO(UserGroupDAO userGroupDAO) {
        this.userGroupDAO = userGroupDAO;
    }

    /**
     * @param userDAO the userDAO to set
     */
    public void setUserDAO(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    /**
     * @param resourceDAO the resourceDAO to set
     */
    public void setResourceDAO(ResourceDAO resourceDAO) {
        this.resourceDAO = resourceDAO;
    }

    /**
     * @param securityDAO the securityDAO to set
     */
    public void setSecurityDAO(SecurityDAO securityDAO) {
        this.securityDAO = securityDAO;
    }

    public void setUserGroupAttributeDAO(UserGroupAttributeDAO userGroupAttributeDAO) {
        this.userGroupAttributeDAO = userGroupAttributeDAO;
    }

    /* (non-Javadoc)
     * @see it.geosolutions.geostore.services.UserGroupService#insert(it.geosolutions.geostore.core.model.UserGroup)
     */
    @Override
    @Transactional(value = "geostoreTransactionManager")
    public long insert(UserGroup userGroup) throws BadRequestServiceEx {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Persisting UserGroup... ");
        }

        if (userGroup == null || StringUtils.isEmpty(userGroup.getGroupName())) {
            throw new BadRequestServiceEx(
                    "The provided UserGroup instance is null or group Name is not specified!");
        }

        if (!GroupReservedNames.isAllowedName(userGroup.getGroupName())) {
            throw new ReservedUserGroupNameEx(
                    "The usergroup name you try to save: '"
                            + userGroup.getGroupName()
                            + "' is a reserved name!");
        }

        userGroup.setGroupName(userGroup.getGroupName());

        userGroupDAO.persist(userGroup);
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("UserGroup '{}' persisted!", userGroup.getGroupName());
        }

        List<UserGroupAttribute> attributes = userGroup.getAttributes();
        if (attributes != null && !attributes.isEmpty()) {
            for (UserGroupAttribute attr : attributes) {
                attr.setUserGroup(userGroup);
                userGroupAttributeDAO.persist(attr);
            }
        }

        return userGroup.getId();
    }

    /* (non-Javadoc)
     * @see it.geosolutions.geostore.services.UserGroupService#delete(long)
     */
    @Override
    @Transactional(value = "geostoreTransactionManager")
    public boolean delete(long id) throws NotFoundServiceEx, BadRequestServiceEx {
        UserGroup group = userGroupDAO.find(id);
        if (group == null) {
            LOGGER.error("Can't find usergroup with id '{}'", id);
            throw new NotFoundServiceEx("Can't find usergroup with id '" + id + "'");
        }
        if (!GroupReservedNames.isAllowedName(group.getGroupName())) {
            throw new BadRequestServiceEx(
                    "Delete a special usergroup ('"
                            + group.getGroupName()
                            + "' in this case) isn't possible");
        }

        for (User u : getUsersByGroup(id)) {
            u.removeGroup(id);
            userDAO.merge(u);
        }

        userGroupDAO.remove(group);
        return true;
    }

    private Collection<User> getUsersByGroup(long groupId) {
        Search searchByGroup = new Search(User.class);
        searchByGroup.addFilterSome("groups", Filter.equal("id", groupId));
        return userDAO.search(searchByGroup);
    }

    /* (non-Javadoc)
     * @see it.geosolutions.geostore.services.UserGroupService#assignUserGroup(long, long)
     */
    @Override
    @Transactional(value = "geostoreTransactionManager")
    public void assignUserGroup(long userId, long groupId) throws NotFoundServiceEx {
        UserGroup groupToAssign = userGroupDAO.find(groupId);

        User targetUser = userDAO.find(userId);
        if (groupToAssign == null || targetUser == null) {
            throw new NotFoundServiceEx("The userGroup or the user you provide doesn't exist");
        }
        // Check if the group user want to assign is an allowed one
        if (!GroupReservedNames.isAllowedName(groupToAssign.getGroupName())) {
            throw new NotFoundServiceEx(
                    "You can't re-assign the group EVERYONE or any other reserved groups...");
        }
        if (targetUser.getGroups() == null) {
            Set<UserGroup> groups = new HashSet<UserGroup>();
            groups.add(groupToAssign);
            targetUser.setGroups(groups);
        } else {
            targetUser.getGroups().add(groupToAssign);
        }
        userDAO.merge(targetUser);
    }

    /* (non-Javadoc)
     * @see it.geosolutions.geostore.services.UserGroupService#deassignUserGroup(long, long)
     */
    @Override
    @Transactional(value = "geostoreTransactionManager")
    public void deassignUserGroup(long userId, long groupId) throws NotFoundServiceEx {
        UserGroup groupToAssign = userGroupDAO.find(groupId);
        // Check if the group user want to remove is an allowed one
        if (!GroupReservedNames.isAllowedName(groupToAssign.getGroupName())) {
            throw new NotFoundServiceEx(
                    "You can't remove the group EVERYONE or any other reserved groups from the users group list...");
        }
        User targetUser = userDAO.find(userId);
        if (targetUser == null) {
            throw new NotFoundServiceEx("The userGroup or the user you provide doesn't exist");
        }

        if (targetUser.removeGroup(groupId)) {
            userDAO.merge(targetUser);
        }
    }

    @Override
    public List<UserGroup> getAllAllowed(
            User user, Integer page, Integer entries, String nameLike, boolean all)
            throws BadRequestServiceEx {

        if (user == null) throw new BadRequestServiceEx("User must be defined.");

        return remapWithoutAttributes(
                userGroupDAO.searchByUser(
                        user, createGetAllSearchCriteria(page, entries, nameLike, all)));
    }

    @Override
    public List<UserGroup> getAll(Integer page, Integer entries) throws BadRequestServiceEx {
        return getAll(page, entries, null, true);
    }

    @Override
    public List<UserGroup> getAll(Integer page, Integer entries, String nameLike, boolean all)
            throws BadRequestServiceEx {
        return remapWithoutAttributes(
                userGroupDAO.search(createGetAllSearchCriteria(page, entries, nameLike, all)));
    }

    private Search createGetAllSearchCriteria(
            Integer page, Integer entries, String nameLike, boolean includeReserved)
            throws BadRequestServiceEx {

        if (((page != null) && (entries == null)) || ((page == null) && (entries != null))) {
            throw new BadRequestServiceEx("Page and entries params should be declared together.");
        }

        Search searchCriteria = new Search(UserGroup.class);

        searchCriteria.addSortAsc("groupName");

        if (page != null) {
            searchCriteria.setMaxResults(entries);
            searchCriteria.setPage(page);
        }

        if (nameLike != null) {
            searchCriteria.addFilterILike("groupName", nameLike);
        }

        if (!includeReserved) {
            searchCriteria.addFilterNotEqual("groupName", GroupReservedNames.EVERYONE.groupName());
        }

        return searchCriteria;
    }

    /* (non-Javadoc)
     * @see it.geosolutions.geostore.services.UserGroupService#updateSecurityRules(java.lang.Long, java.util.List, boolean, boolean)
     */
    @Override
    @Transactional(value = "geostoreTransactionManager")
    public List<ShortResource> updateSecurityRules(
            Long groupId, List<Long> resourcesIds, boolean canRead, boolean canWrite)
            throws NotFoundServiceEx, BadRequestServiceEx {

        List<ShortResource> updated = new ArrayList<ShortResource>();
        UserGroup group = userGroupDAO.find(groupId);

        if (group == null) {
            throw new NotFoundServiceEx("The usergroup id you provide doesn't exist!");
        }

        if (group.getGroupName().equals(GroupReservedNames.EVERYONE.groupName())) {
            if (!canRead || canWrite) {
                LOGGER.error(
                        "You are trying to assign to a resource the following permissions for the group EVERYONE: [canRead='{}',canWrite'{}'] but...",
                        canRead,
                        canWrite);
                LOGGER.error(
                        "...the group EVERYONE can be set only in this way: [canRead='true',canWrite='false'] .");
                throw new BadRequestServiceEx(
                        "GroupEveryone cannot be set with this grants [canRead='"
                                + canRead
                                + "',canWrite'"
                                + canWrite
                                + "']");
            }
        }

        List<Resource> resourceToSet = resourceDAO.findResources(resourcesIds);

        for (Resource resource : resourceToSet) {
            SecurityRule sr = getRuleForGroup(resource.getSecurity(), group);
            if (sr == null) {
                // Create new rule
                SecurityRule newSR = new SecurityRule();
                newSR.setCanRead(canRead);
                newSR.setCanWrite(canWrite);
                newSR.setGroup(group);
                newSR.setResource(resource);
                securityDAO.persist(newSR);
                resource.getSecurity().add(newSR);

                ShortResource out = new ShortResource(resource);
                // In this case the short resource to return is not related to the permission
                // available by the user
                // who call the service (like in other service) but can Delete/Edit are set as the
                // rule updated.
                out.setCanDelete(canWrite);
                out.setCanEdit(canWrite);
                out.setCanCopy(canRead);
                updated.add(out);
            } else {
                // Update the existing rule
                sr.setCanRead(canRead);
                sr.setCanWrite(canWrite);
                securityDAO.merge(sr);

                ShortResource out = new ShortResource(resource);
                // In this case the short resource to return is not related to the permission
                // available by the user
                // who call the service (like in other service) but can Delete/Edit are set as the
                // rule updated.
                out.setCanDelete(canWrite);
                out.setCanEdit(canWrite);
                out.setCanCopy(canRead);
                updated.add(out);
            }
        }

        return updated;
    }

    private SecurityRule getRuleForGroup(List<SecurityRule> securityList, UserGroup group) {
        for (SecurityRule sr : securityList) {
            if (sr.getGroup() != null
                    && sr.getGroup().getGroupName() != null
                    && sr.getGroup().getGroupName().equals(group.getGroupName())) {
                return sr;
            }
        }
        return null;
    }

    @Transactional(value = "geostoreTransactionManager")
    public boolean insertSpecialUsersGroups() {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Persisting Reserved UsersGroup... ");
        }

        UserGroup ug = new UserGroup();
        ug.setGroupName(GroupReservedNames.EVERYONE.groupName());
        userGroupDAO.persist(ug);
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Special UserGroup '{}' persisted!", ug.getGroupName());
        }
        return true;
    }

    @Transactional(value = "geostoreTransactionManager")
    public boolean removeSpecialUsersGroups() {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Removing Reserved UsersGroup... ");
        }

        Search search = new Search();
        search.addFilterEqual("groupName", GroupReservedNames.EVERYONE.groupName());
        List<UserGroup> ugEveryone = userGroupDAO.search(search);
        if (ugEveryone.size() == 1) {
            UserGroup ug = ugEveryone.get(0);
            boolean res = userGroupDAO.removeById(ug.getId());
            if (LOGGER.isDebugEnabled()) {
                LOGGER.debug("Special UserGroup '{}' removed!", ug.getGroupName());
            }
            return res;
        }
        return false;
    }

    @Override
    public UserGroup get(long id) throws BadRequestServiceEx {
        return userGroupDAO.find(id);
    }

    @Override
    public UserGroup get(String name) {
        return userGroupDAO.findByName(name);
    }

    @Override
    public long getCount(String nameLike, boolean all) throws BadRequestServiceEx {
        return userGroupDAO.count(createCountSearchCriteria(nameLike, all));
    }

    @Override
    public long getCount(User user, String nameLike, boolean all) throws BadRequestServiceEx {
        if (user == null) {
            throw new BadRequestServiceEx("User must be defined.");
        }

        Search searchCriteria = createCountSearchCriteria(nameLike, all);

        if (user.getRole() == Role.USER) {
            Set<UserGroup> userGrp = user.getGroups();
            Collection<Long> grpIds = new ArrayList<>();
            for (UserGroup grp : userGrp) {
                grpIds.add(grp.getId());
            }
            searchCriteria.addFilterIn("id", grpIds);
        }

        return userGroupDAO.count(searchCriteria);
    }

    private Search createCountSearchCriteria(String nameLike, boolean includingReserved) {

        Search searchCriteria = new Search(UserGroup.class);

        if (nameLike != null) {
            searchCriteria.addFilterILike("groupName", nameLike);
        }

        if (!includingReserved) {
            searchCriteria.addFilterNotEqual("groupName", GroupReservedNames.EVERYONE.groupName());
        }

        return searchCriteria;
    }

    @Override
    @Transactional(value = "geostoreTransactionManager")
    public void updateAttributes(long id, List<UserGroupAttribute> attributes)
            throws NotFoundServiceEx {
        UserGroup group = userGroupDAO.find(id);
        if (group == null) {
            throw new NotFoundServiceEx("UserGroup not found " + id);
        }

        // 1) Remove existing rows
        List<UserGroupAttribute> oldList = group.getAttributes();
        if (oldList != null) {
            for (UserGroupAttribute a : oldList) {
                if (a.getId() != null) {
                    userGroupAttributeDAO.removeById(a.getId());
                }
            }
        }

        // 2) Persist the provided ones as NEW rows
        if (attributes != null) {
            for (UserGroupAttribute a : attributes) {
                // important: ensure they're transient and correctly linked
                a.setId(null);
                a.setUserGroup(group);
                userGroupAttributeDAO.persist(a);
            }
        }

        // (optional) keep the in-memory association coherent
        group.setAttributes(attributes != null ? new ArrayList<>(attributes) : new ArrayList<>());
    }

    @Override
    @Transactional(value = "geostoreTransactionManager")
    public long update(UserGroup group) throws NotFoundServiceEx, BadRequestServiceEx {
        UserGroup old = get(group.getId());
        if (old == null) old = get(group.getGroupName());
        group.setId(old.getId());
        userGroupDAO.merge(group);
        return old.getId();
    }

    @Override
    public Collection<UserGroup> findByAttribute(
            String name, List<String> values, boolean ignoreCase) {
        Search searchCriteria = new Search(UserGroupAttribute.class);
        if (!ignoreCase) {
            searchCriteria.addFilterEqual("name", name);
        } else {
            searchCriteria.addFilterILike("name", name);
        }
        if (values.size() > 1) searchCriteria.addFilterIn("value", values);
        else searchCriteria.addFilterEqual("value", values.get(0));
        searchCriteria.addFetch("userGroup");
        List<UserGroupAttribute> attributes = userGroupAttributeDAO.search(searchCriteria);
        return attributes.stream()
                .map(UserGroupAttribute::getUserGroup)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private List<UserGroup> remapWithoutAttributes(Collection<UserGroup> groups) {
        List<UserGroup> newList = new ArrayList<>(groups.size());
        for (UserGroup old : groups) {
            UserGroup newGroup = new UserGroup();
            newGroup.setId(old.getId());
            newGroup.setGroupName(old.getGroupName());
            newGroup.setDescription(old.getDescription());
            newGroup.setEnabled(old.isEnabled());
            newList.add(newGroup);
        }
        return newList;
    }

    // ---------------------------------------------------------------------
    // Optional helpers (added) to support auth filters without lazy issues
    // and to safely update a single attribute without replacing others.
    // ---------------------------------------------------------------------

    /**
     * Returns the {@link UserGroup} with attributes eagerly fetched and materialized. Uses a search
     * with {@code addFetch("attributes")} to avoid lazy initialization issues.
     *
     * @param id the group id
     * @return the group with initialized attributes
     * @throws NotFoundServiceEx if the group is not found
     * @throws BadRequestServiceEx if the request cannot be fulfilled
     * @since 2025
     */
    @Override
    public UserGroup getWithAttributes(long id) throws NotFoundServiceEx, BadRequestServiceEx {
        Search s = new Search(UserGroup.class);
        s.addFilterEqual("id", id);
        s.addFetch("attributes");
        List<UserGroup> res = userGroupDAO.search(s);
        if (res == null || res.isEmpty()) {
            throw new NotFoundServiceEx("UserGroup not found " + id);
        }
        UserGroup g = res.get(0);
        // materialize
        List<UserGroupAttribute> attrs = g.getAttributes();
        if (attrs != null) {
            attrs.size();
        }
        return g;
    }

    /**
     * Upserts a single attribute on a group (create if missing, update otherwise), without
     * replacing unrelated attributes.
     *
     * @param groupId the group id
     * @param name attribute name (case-insensitive match)
     * @param value attribute value (nullable by policy)
     * @throws NotFoundServiceEx if the group does not exist
     * @throws BadRequestServiceEx if the request cannot be performed
     * @since 2025
     */
    @Override
    @Transactional(value = "geostoreTransactionManager")
    public void upsertAttribute(long groupId, String name, String value)
            throws NotFoundServiceEx, BadRequestServiceEx {
        if (name == null) throw new BadRequestServiceEx("Attribute name must not be null");

        UserGroup group = userGroupDAO.find(groupId);
        if (group == null) {
            throw new NotFoundServiceEx("UserGroup not found " + groupId);
        }

        // look for the attribute (case-insensitive)
        UserGroupAttribute existing = null;
        List<UserGroupAttribute> current = group.getAttributes();
        if (current != null) {
            for (UserGroupAttribute a : current) {
                if (a.getName() != null && a.getName().equalsIgnoreCase(name)) {
                    existing = a;
                    break;
                }
            }
        }

        if (existing != null) {
            // update existing row (MERGE is safe for managed/detached)
            existing.setValue(value);
            userGroupAttributeDAO.merge(existing);
        } else {
            // insert new row
            UserGroupAttribute a = new UserGroupAttribute();
            a.setUserGroup(group);
            a.setName(name);
            a.setValue(value);
            userGroupAttributeDAO.persist(a);

            // keep in-memory model consistent
            if (current == null) {
                current = new ArrayList<>();
                group.setAttributes(current);
            }
            current.add(a);
        }
    }
}
