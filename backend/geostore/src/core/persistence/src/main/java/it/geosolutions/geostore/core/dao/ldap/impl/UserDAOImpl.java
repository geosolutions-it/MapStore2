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
package it.geosolutions.geostore.core.dao.ldap.impl;

import com.googlecode.genericdao.search.Filter;
import com.googlecode.genericdao.search.ISearch;
import com.googlecode.genericdao.search.Search;

import it.geosolutions.geostore.core.dao.UserDAO;
import it.geosolutions.geostore.core.dao.search.GeoStoreISearchWrapper;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserAttribute;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.Role;

import org.springframework.ldap.core.ContextSource;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.ldap.core.DirContextProcessor;
import org.springframework.ldap.core.support.AbstractContextMapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.naming.directory.SearchControls;

/**
 * Class UserDAOImpl. LDAP (read-only) implementation of UserDAO. Allows fetching User from an LDAP
 * repository.
 *
 * @author Mauro Bartolomeoli (mauro.bartolomeoli at geo-solutions.it)
 */
public class UserDAOImpl extends LdapBaseDAOImpl implements UserDAO {
    protected Map<String, String> attributesMapper = new HashMap<String, String>();
    private Pattern memberPattern = Pattern.compile("^(.*)$");
    private String adminRoleGroup = "ADMIN";

    UserGroupDAOImpl userGroupDAO = null;

    public UserDAOImpl(ContextSource contextSource) {
        super(contextSource);
    }

    public void setUserGroupDAO(UserGroupDAOImpl userGroupDAO) {
        if (this.userGroupDAO == null) {
            this.userGroupDAO = userGroupDAO;
            userGroupDAO.setUserDAO(this);
        }
    }

    public String getAdminRoleGroup() {
        return adminRoleGroup;
    }

    /**
     * Case insensitive name of the group associated to the ADMIN role. This is used to assign ADMIN
     * role to users belonging to a specific LDAP group.
     *
     * @param adminRoleGroup ADMIN role group name (default to ADMIN)
     */
    public void setAdminRoleGroup(String adminRoleGroup) {
        this.adminRoleGroup = adminRoleGroup;
    }

    /**
     * Sets regular expression used to extract the member user name from a member LDAP attribute.
     * The LDAP attribute can contain a DN, so this is useful to extract the real member name from
     * it.
     *
     * <p>e.g. ^(uid=[^,]+.*)$ extracts the uid fragment of a DN
     *
     * @param memberPattern
     */
    public void setMemberPattern(String memberPattern) {
        this.memberPattern = Pattern.compile(memberPattern);
    }

    public Map<String, String> getAttributesMapper() {
        return attributesMapper;
    }

    /**
     * Mapping of LDAP attribute names to geostore attribute names.
     *
     * @param attributesMapper
     */
    public void setAttributesMapper(Map<String, String> attributesMapper) {
        this.attributesMapper = attributesMapper;
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#persist(T[])
     */
    @Override
    public void persist(User... entities) {
        // we don't want to throw an exception on write operations, because
        // some authentication providers try to persist stuff for synchronization
        // purposes and they don't know  DAOs can be readonly
        // TODO: make readonly behaviour explicit
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#findAll()
     */
    @Override
    public List<User> findAll() {
        return ldapSearch(baseFilter, new NullDirContextProcessor());
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#search(com.trg.search.ISearch)
     */
    @SuppressWarnings("unchecked")
    @Override
    public List<User> search(ISearch search) {
        if (isNested(search)) {
            // users belonging to a group
            List<User> users = new ArrayList<User>();
            for (UserGroup group : userGroupDAO.search(getNestedSearch(search))) {
                users.addAll(group.getUsers());
            }
            return users;
        } else {
            return ldapSearch(
                    combineFilters(baseFilter, getLdapFilter(search, getPropertyMapper())),
                    getProcessorForSearch(search));
        }
    }

    /**
     * Maps user properties to LDAP properties.
     *
     * @return
     */
    private Map<String, Object> getPropertyMapper() {
        Map<String, Object> mapper = new HashMap<>();
        mapper.put("name", nameAttribute);
        for (String ldap : attributesMapper.keySet()) {
            mapper.put(attributesMapper.get(ldap), ldap);
        }
        // sub-mapper for groups properties
        if (userGroupDAO != null) {
            mapper.put("groups", userGroupDAO.getPropertyMapper());
        }
        return mapper;
    }

    protected List<User> ldapSearch(String filter, DirContextProcessor processor) {
        SearchControls controls = new SearchControls();
        controls.setSearchScope(SearchControls.SUBTREE_SCOPE);
        return template.search(
                searchBase,
                filter,
                controls,
                new AbstractContextMapper() {
                    int counter = 1;

                    @Override
                    protected User doMapFromContext(DirContextOperations ctx) {
                        User user = new User();
                        user.setId((long) counter++); // TODO: optionally map an attribute to the id
                        user.setEnabled(true);
                        user.setName(ctx.getStringAttribute(nameAttribute));
                        user.setAttribute(fetchAttributes(ctx));
                        assignGroupsAndRole(ctx, user);
                        return user;
                    }
                },
                processor);
    }

    /**
     * Gets all the attributes defined in AttributeMapper.
     *
     * @param ctx
     * @return
     */
    private List<UserAttribute> fetchAttributes(DirContextOperations ctx) {
        List<UserAttribute> attributes = new ArrayList<UserAttribute>();
        for (String ldapAttr : attributesMapper.keySet()) {
            String value = ctx.getStringAttribute(ldapAttr);
            String userAttr = attributesMapper.get(ldapAttr);
            UserAttribute attr = new UserAttribute();
            attr.setName(userAttr);
            attr.setValue(value);
            attributes.add(attr);
        }
        return attributes;
    }

    /**
     * If UserGroupDAO is defined, fetches all the groups using a membership filter
     * (member=<userDN>) on groups.
     *
     * <p>Assigns the ADMIN role to users belonging to the adminRoleGroup group.
     *
     * @param ctx
     * @param user
     */
    private void assignGroupsAndRole(DirContextOperations ctx, User user) {
        // defaults to no groups and USER role
        user.setGroups(new HashSet<UserGroup>());
        user.setRole(Role.USER);
        if (userGroupDAO != null) {
            Search searchCriteria = new Search(UserGroup.class);
            searchCriteria.addFilterSome(
                    "user", new Filter("name", ctx.getNameInNamespace(), Filter.OP_EQUAL));
            GeoStoreISearchWrapper searchWrapper =
                    new GeoStoreISearchWrapper(searchCriteria, this.getClass());
            for (UserGroup ug : userGroupDAO.search(searchWrapper)) {
                if (isAdminGroup(ug)) {
                    user.setRole(Role.ADMIN);
                }
                user.getGroups().add(ug);
            }
        }
    }

    /**
     * Returns true if the given group is the adminRoleGroup group.
     *
     * @param ug
     * @return
     */
    private boolean isAdminGroup(UserGroup ug) {
        return ug.getGroupName().equalsIgnoreCase(adminRoleGroup);
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#merge(java.lang.Object)
     */
    @Override
    public User merge(User entity) {
        // we don't want to throw an exception on write operations, because
        // some authentication providers try to persist stuff for synchronization
        // purposes and they don't know  DAOs can be readonly
        // TODO: make readonly behaviour explicit
        return entity;
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#remove(java.lang.Object)
     */
    @Override
    public boolean remove(User entity) {
        // we don't want to throw an exception on write operations, because
        // some authentication providers try to persist stuff for synchronization
        // purposes and they don't know  DAOs can be readonly
        // TODO: make readonly behaviour explicit
        return true;
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#removeById(java.io.Serializable)
     */
    @Override
    public boolean removeById(Long id) {
        // we don't want to throw an exception on write operations, because
        // some authentication providers try to persist stuff for synchronization
        // purposes and they don't know  DAOs can be readonly
        // TODO: make readonly behaviour explicit
        return true;
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#find(java.io.Serializable)
     */
    @Override
    public User find(Long id) {
        // Not supported yet, we can eventually map an LDAP attribute and use it as an ID
        // If needed in any use case
        return null;
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#save(T[])
     */
    @Override
    public User[] save(User... entities) {
        throw new UnsupportedOperationException();
    }

    @Override
    public int count(ISearch search) {
        // TODO: optimize
        return search(search).size();
    }

    /**
     * Create a User object from a group member name.
     *
     * @param member
     * @return
     */
    public User createMemberUser(String member) {
        User user = new User();
        user.setEnabled(true);
        user.setId(-1L);
        user.setName(getMemberName(member));
        return user;
    }

    /**
     * Extracts a User name from a member name, using the memberPattern regexp.
     *
     * @param member
     * @return
     */
    private String getMemberName(String member) {
        Matcher m = memberPattern.matcher(member);
        if (m.find()) {
            return m.group(1);
        }
        return member;
    }
}
