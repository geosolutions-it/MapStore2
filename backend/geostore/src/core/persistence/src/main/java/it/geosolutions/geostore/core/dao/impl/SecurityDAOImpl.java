/*
 *  Copyright (C) 2007 - 2025 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.core.dao.impl;

import com.googlecode.genericdao.search.Filter;
import com.googlecode.genericdao.search.ISearch;
import com.googlecode.genericdao.search.Search;

import it.geosolutions.geostore.core.dao.ResourceDAO;
import it.geosolutions.geostore.core.dao.SecurityDAO;
import it.geosolutions.geostore.core.dao.UserGroupDAO;
import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.SecurityRule;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.Role;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

/**
 * Class SecurityDAOImpl.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 * @author ETj (etj at geo-solutions.it)
 */
@Transactional(value = "geostoreTransactionManager")
public class SecurityDAOImpl extends BaseDAO<SecurityRule, Long> implements SecurityDAO {

    private static final Logger LOGGER = LogManager.getLogger(SecurityDAOImpl.class);

    private UserGroupDAO userGroupDAO;

    private ResourceDAO resourceDAO;

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#persist(T[])
     */
    @Override
    public void persist(SecurityRule... entities) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.info("Inserting new entities for Security ... ");
        }
        for (SecurityRule rule : entities) {
            validateGroup(rule);
            updateResourceCreatorIfEmpty(rule);
        }
        super.persist(entities);
    }

    protected void validateGroup(SecurityRule rule) throws InternalError {
        if (rule.getGroup() != null) {
            UserGroup ug = userGroupDAO.find(rule.getGroup().getId());
            if (ug == null) {
                throw new InternalError("The usergroup having the provided Id doesn't exist");
            }
            rule.setGroup(ug);
        }
    }

    private void updateResourceCreatorIfEmpty(SecurityRule rule) {
        if (rule.getResource() != null && (rule.getUser() != null || rule.getUsername() != null)) {
            Resource resource = rule.getResource();
            boolean updated = false;
            if (resource.getCreator() == null) {
                resource.setCreator(
                        rule.getUser() != null ? rule.getUser().getName() : rule.getUsername());
                updated = true;
            }
            if (updated) {
                resourceDAO.merge(resource);
            }
        }
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#findAll()
     */
    @Override
    public List<SecurityRule> findAll() {
        return super.findAll();
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#search(com.trg.search.ISearch)
     */
    @SuppressWarnings("unchecked")
    @Override
    public List<SecurityRule> search(ISearch search) {
        return super.search(search);
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#merge(java.lang.Object)
     */
    @Override
    public SecurityRule merge(SecurityRule entity) {
        return super.merge(entity);
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#remove(java.lang.Object)
     */
    @Override
    public boolean remove(SecurityRule entity) {
        return super.remove(entity);
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#removeById(java.io.Serializable)
     */
    @Override
    public boolean removeById(Long id) {
        return super.removeById(id);
    }

    /** Add security filtering in order to filter out resources the user has not read access to */
    public void addReadSecurityConstraints(Search searchCriteria, User user) {
        // no further constraints for admin user
        if (user.getRole() == Role.ADMIN) {
            return;
        }

        // User filtering based on user and groups
        Filter userFiltering =
                Filter.or(
                        Filter.equal("username", user.getName()),
                        Filter.equal("user.name", user.getName()));

        if (user.getGroups() != null && !user.getGroups().isEmpty()) {
            List<Long> groupsId = new ArrayList<>();
            for (UserGroup group : user.getGroups()) {
                groupsId.add(group.getId());
            }

            userFiltering = Filter.or(userFiltering, Filter.in("group.id", groupsId));
        }

        Filter securityFilter =
                Filter.some("security", Filter.and(Filter.equal("canRead", true), userFiltering));

        searchCriteria.addFilter(securityFilter);
    }

    /**
     * Add security filtering to the {@code searchCriteria} in order to filter out resources hidden
     * to the user.
     */
    public void addSecurityConstraintsToSearch(Search searchCriteria, User user) {
        if (user.getRole() == Role.ADMIN) {
            return;
        }

        Filter securityFilter = createOwnershipFilter(user);

        if (user.getIpAddress() != null) {
            securityFilter = Filter.or(securityFilter, createIPRangeFilter(user));
        }

        searchCriteria.addFilter(
                Filter.some("security", Filter.and(Filter.equal("canRead", true), securityFilter)));
    }

    private Filter createOwnershipFilter(User user) {
        Filter userFilter =
                Filter.or(
                        /* Resource should be accessible by user entity name or by username (the latter in LDAP direct setup) */
                        Filter.equal("username", user.getName()),
                        Filter.equal("user.name", user.getName()));

        Filter ownershipFilter = userFilter;

        if (user.getGroups() != null && !user.getGroups().isEmpty()) {
            List<Long> groupIds = user.getGroups().stream().map(UserGroup::getId).toList();

            List<String> groupNames =
                    user.getGroups().stream().map(UserGroup::getGroupName).toList();

            ownershipFilter =
                    Filter.or(
                            userFilter,
                            Filter.and(
                                    /* Resource should be accessible by user's group id or by group name (the latter in LDAP direct setup) */
                                    Filter.or(
                                            Filter.in("group.id", groupIds),
                                            Filter.in("groupname", groupNames)),
                                    /* When the user is part of a group, he should only access the group's advertised resources */
                                    Filter.equal("resource.advertised", true)));
        }
        return ownershipFilter;
    }

    private Filter createIPRangeFilter(User user) {
        BigInteger decimalIPAddress = user.getIpAddress().getValue();
        return Filter.some(
                "ipRanges",
                Filter.and(
                        Filter.lessOrEqual("ipLow", decimalIPAddress),
                        Filter.greaterOrEqual("ipHigh", decimalIPAddress)));
    }

    /**
     * @param userName
     * @param resourceId
     * @return List<SecurityRule>
     */
    @Override
    public List<SecurityRule> findUserSecurityRule(String userName, long resourceId) {
        Search searchCriteria = new Search(SecurityRule.class);

        Filter securityFilter =
                Filter.or(
                        Filter.and(
                                Filter.equal("resource.id", resourceId),
                                Filter.equal("username", userName)),
                        Filter.and(
                                Filter.equal("resource.id", resourceId),
                                Filter.equal("user.name", userName)));
        searchCriteria.addFilter(securityFilter);
        // now rules are not properly filtered.
        // so no user rules have to be removed externally (see RESTServiceImpl >
        // ResourceServiceImpl)
        // TODO: apply same workaround of findGroupSecurityRule or fix searchCriteria issue (when
        // this unit is well tested).
        return super.search(searchCriteria);
    }

    /**
     * @param resourceId
     * @return List<SecurityRule>
     */
    @Override
    public List<SecurityRule> findResourceSecurityRules(long resourceId) {
        Search searchCriteria = new Search(SecurityRule.class);

        Filter securityFilter = Filter.equal("resource.id", resourceId);

        searchCriteria.addFilter(securityFilter);

        searchCriteria.addFetch("ipRanges");

        searchCriteria.setDistinct(true);

        return super.search(searchCriteria);
    }

    @Override
    public boolean isIpRangeInUse(long ipRangeId) {
        Search searchCriteria = new Search(SecurityRule.class);
        searchCriteria.addFilter(Filter.some("ipRanges", Filter.equal("id", ipRangeId)));
        return super.count(searchCriteria) > 0;
    }

    @Override
    public List<SecurityRule> findGroupSecurityRule(List<String> groupNames, long resourceId) {
        List<SecurityRule> rules = findResourceSecurityRules(resourceId);
        // WORKAROUND
        List<SecurityRule> filteredRules = new ArrayList<>();
        for (SecurityRule sr : rules) {
            if (sr.getGroup() != null && groupNames.contains(sr.getGroup().getGroupName())) {
                filteredRules.add(sr);
            }
        }
        return filteredRules;
    }

    public UserGroupDAO getUserGroupDAO() {
        return userGroupDAO;
    }

    public void setUserGroupDAO(UserGroupDAO userGroupDAO) {
        this.userGroupDAO = userGroupDAO;
    }

    public ResourceDAO getResourceDAO() {
        return resourceDAO;
    }

    public void setResourceDAO(ResourceDAO resourceDAO) {
        this.resourceDAO = resourceDAO;
    }
}
