/*
 *  Copyright (C) 2019 GeoSolutions S.A.S.
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

import it.geosolutions.geostore.core.model.SecurityRule;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.Role;

import java.util.ArrayList;
import java.util.List;

/**
 * Alternative implementation of SecurityDAO that uses names for users and groups instead of loading
 * data from the database. To be activated as an alias when external authentication is enabled:
 *
 * <p><alias name="externalSecurityDAO" alias="securityDAO"/>
 *
 * @author mauro.bartolomeoli@geo-solutions.it
 */
public class ExternalSecurityDAOImpl extends SecurityDAOImpl {

    @Override
    public void persist(SecurityRule... entities) {
        SecurityRule[] entitiesWithNames = extractNames(entities).toArray(new SecurityRule[0]);
        super.persist(entitiesWithNames);
        for (int i = 0; i < entitiesWithNames.length; i++) {
            entities[i].setId(entitiesWithNames[i].getId());
        }
    }

    /**
     * Extracts username and groupname from DTO objets, so that security is persisted with the names
     * instead of the object.
     *
     * @param rules input rules
     * @return
     */
    private List<SecurityRule> extractNames(SecurityRule[] rules) {
        List<SecurityRule> extracted = new ArrayList<>();
        for (SecurityRule rule : rules) {
            SecurityRule extractedRule = new SecurityRule();
            extractedRule.setId(rule.getId());
            extractedRule.setResource(rule.getResource());
            extractedRule.setCanRead(rule.isCanRead());
            extractedRule.setCanWrite(rule.isCanWrite());
            extractedRule.setIpRanges(rule.getIpRanges());
            if (rule.getUser() != null) {
                extractedRule.setUsername(rule.getUser().getName());
            } else {
                extractedRule.setUsername(rule.getUsername());
            }
            if (rule.getGroup() != null) {
                extractedRule.setGroupname(rule.getGroup().getGroupName());
            } else {
                extractedRule.setGroupname(rule.getGroupname());
            }
            extracted.add(extractedRule);
        }
        return extracted;
    }

    @Override
    public List<SecurityRule> findAll() {
        return fillFromNames(super.findAll());
    }

    @Override
    public List<SecurityRule> search(ISearch search) {
        return fillFromNames(super.search(search));
    }

    /** Add security filtering in order to filter out resources the user has not read access to */
    @Override
    public void addReadSecurityConstraints(Search searchCriteria, User user) {
        // no further constraints for admin user
        if (user.getRole() == Role.ADMIN) {
            return;
        }

        Filter userFiltering = Filter.equal("username", user.getName());

        if (user.getGroups() != null && !user.getGroups().isEmpty()) {
            List<String> groupsName = new ArrayList<>();
            for (UserGroup group : user.getGroups()) {
                groupsName.add(group.getGroupName());
            }

            userFiltering = Filter.or(userFiltering, Filter.in("groupname", groupsName));
        }

        Filter securityFilter =
                Filter.some("security", Filter.and(Filter.equal("canRead", true), userFiltering));

        searchCriteria.addFilter(securityFilter);
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
                Filter.and(
                        Filter.equal("resource.id", resourceId),
                        Filter.equal("username", userName));
        searchCriteria.addFilter(securityFilter);
        // now rules are not properly filtered.
        // so no user rules have to be removed externally (see RESTServiceImpl >
        // ResourceServiceImpl)
        // TODO: apply same worakaround of findGroupSecurityRule or fix searchCriteria issue (when
        // this unit is well tested).
        return fillFromNames(super.search(searchCriteria));
    }

    @Override
    public List<SecurityRule> findResourceSecurityRules(long resourceId) {
        return fillFromNames(super.findResourceSecurityRules(resourceId));
    }

    /* (non-Javadoc)
     * @see it.geosolutions.geostore.core.dao.ResourceDAO#findGroupSecurityRule(java.lang.String, long)
     */
    @Override
    public List<SecurityRule> findGroupSecurityRule(List<String> groupNames, long resourceId) {
        List<SecurityRule> rules = findResourceSecurityRules(resourceId);
        // WORKAROUND
        List<SecurityRule> filteredRules = new ArrayList<>();
        for (SecurityRule sr : rules) {
            if (sr.getGroupname() != null && groupNames.contains(sr.getGroupname())) {
                filteredRules.add(sr);
            }
        }
        return fillFromNames(filteredRules);
    }

    /**
     * Returns a new list populating User object from username and UserGroup object from groupname
     * so that using external users is transparent for higher levels.
     *
     * @param rules input rules
     * @return rules with populated user objects
     */
    private List<SecurityRule> fillFromNames(List<SecurityRule> rules) {
        List<SecurityRule> filled = new ArrayList<>();
        for (SecurityRule rule : rules) {
            SecurityRule filledRule = new SecurityRule();
            filledRule.setId(rule.getId());
            filledRule.setResource(rule.getResource());
            filledRule.setCanRead(rule.isCanRead());
            filledRule.setCanWrite(rule.isCanWrite());
            filledRule.setIpRanges(rule.getIpRanges());
            if (rule.getUsername() != null) {
                filledRule.setUsername(rule.getUsername());
                if (rule.getUser() == null) {
                    User user = new User();
                    user.setId(null);
                    user.setEnabled(true);
                    user.setName(rule.getUsername());
                    filledRule.setUser(user);
                }
            }
            if (rule.getGroupname() != null) {
                filledRule.setGroupname(rule.getGroupname());
                if (rule.getGroup() == null) {
                    UserGroup group = new UserGroup();
                    group.setId(null);
                    group.setEnabled(true);
                    group.setGroupName(rule.getGroupname());
                    filledRule.setGroup(group);
                }
            }
            filled.add(filledRule);
        }
        return filled;
    }
}
