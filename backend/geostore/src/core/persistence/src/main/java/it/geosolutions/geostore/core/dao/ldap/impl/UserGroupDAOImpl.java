/*
 *  Copyright (C) 2019 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 3 of the License, or
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
import it.geosolutions.geostore.core.dao.UserGroupDAO;
import it.geosolutions.geostore.core.dao.search.GeoStoreISearchWrapper;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.GroupReservedNames;
import it.geosolutions.geostore.core.model.enums.Role;

import org.springframework.expression.Expression;
import org.springframework.ldap.core.ContextSource;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.ldap.core.DirContextProcessor;
import org.springframework.ldap.core.support.AbstractContextMapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import javax.naming.directory.SearchControls;

/**
 * Class UserGroupDAOImpl. LDAP (read-only) implementation of UserGroupDAO. Allows fetching
 * UserGroup from an LDAP repository.
 *
 * <p><b>Note:</b> Attributes are not persisted in this LDAP DAO; methods that would normally fetch
 * or mutate attributes in a DB-backed DAO are no-ops or unsupported here.
 *
 * @author Mauro Bartolomeoli (mauro.bartolomeoli at geo-solutions.it)
 */
public class UserGroupDAOImpl extends LdapBaseDAOImpl implements UserGroupDAO {

    private boolean addEveryOneGroup = false;
    private String memberAttribute = "member";
    private UserDAOImpl userDAO = null;

    public UserGroupDAOImpl(ContextSource contextSource) {
        super(contextSource);
    }

    public String getMemberAttribute() {
        return memberAttribute;
    }

    /**
     * LDAP Attribute containing the list of members of a group. A multi-valued attribute. Each
     * value should identify a user, either through its DN or simple name.
     *
     * @param memberAttribute
     */
    public void setMemberAttribute(String memberAttribute) {
        this.memberAttribute = memberAttribute;
    }

    public void setUserDAO(UserDAOImpl userDAO) {
        if (this.userDAO == null) {
            this.userDAO = userDAO;
            userDAO.setUserGroupDAO(this);
        }
    }

    public boolean isAddEveryOneGroup() {
        return addEveryOneGroup;
    }

    /**
     * Add everyOne group to search results.
     *
     * @param addEveryOneGroup
     */
    public void setAddEveryOneGroup(boolean addEveryOneGroup) {
        this.addEveryOneGroup = addEveryOneGroup;
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#persist(T[])
     */
    @Override
    public void persist(UserGroup... entities) {
        throw new UnsupportedOperationException();
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#findAll()
     */
    @Override
    public List<UserGroup> findAll() {
        return addEveryOne(ldapSearch(baseFilter, new NullDirContextProcessor(), null), null);
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#find(java.io.Serializable)
     */
    @Override
    public UserGroup find(Long id) {
        // Not supported yet, we can possibly map an LDAP attribute and use it as an ID
        // If needed in any use case
        return null;
    }

    @Override
    public UserGroup findByName(String name) {
        Search searchCriteria = new Search(UserGroup.class);
        searchCriteria.addFilterEqual(nameAttribute, name);
        UserGroup result = null;
        List<UserGroup> existingGroups = search(searchCriteria);
        if (!existingGroups.isEmpty()) {
            result = existingGroups.get(0);
        }
        return result;
    }

    /**
     * This search limits the results by the user's groups.
     *
     * <p>LDAP search is performed only for ADMIN role. USER role gets groups from the user object
     * only.
     *
     * <p>This implementation filters user groups only by <code>groupName ILIKE</code> if present in
     * the <code>search</code> parameter.
     */
    @Override
    public List<UserGroup> searchByUser(User user, Search search) {
        if (user.getRole() == Role.ADMIN) {
            return search(search);
        } else {
            return new ArrayList<>(retrieveUserGroups(user, search));
        }
    }

    private Set<UserGroup> retrieveUserGroups(User user, Search search) {
        Set<UserGroup> userGroups = user.getGroups();

        if (userGroups == null) {
            return Set.of();
        }

        return applyGroupNameFilter(userGroups, search);
    }

    private Set<UserGroup> applyGroupNameFilter(Set<UserGroup> userGroups, Search search) {

        Optional<Object> groupNameFilterValue = retrieveGroupNameFilterValue(search);

        if (groupNameFilterValue.isEmpty()) {
            return userGroups;
        }

        Pattern pattern = buildGroupNameILikePattern((String) groupNameFilterValue.get());

        return userGroups.stream()
                .filter(
                        ug ->
                                ug.getGroupName() != null
                                        && pattern.matcher(ug.getGroupName()).matches())
                .collect(Collectors.toSet());
    }

    private Optional<Object> retrieveGroupNameFilterValue(ISearch search) {
        return search.getFilters().stream()
                .filter(
                        filter ->
                                "groupName".equals(filter.getProperty())
                                        && Filter.OP_ILIKE == filter.getOperator())
                .findFirst()
                .map(Filter::getValue);
    }

    private Pattern buildGroupNameILikePattern(String groupNameILike) {
        String regex = groupNameILike.replace("*", ".*");
        return Pattern.compile("^" + regex + "$", Pattern.CASE_INSENSITIVE);
    }

    @Override
    public List<UserGroup> search(ISearch search) {
        String filter;
        if (isNested(search)) {
            // membership filter (member = <user>)
            Filter nested = getNestedFilter(search.getFilters().get(0));
            filter = memberAttribute + "=" + nested.getValue().toString();
        } else {
            filter = getLdapFilter(search, getPropertyMapper());
        }

        List<UserGroup> ldapGroups =
                ldapSearch(
                        combineFilters(baseFilter, filter), getProcessorForSearch(search), search);

        return addEveryOne(ldapGroups, search);
    }

    /**
     * Maps group properties to LDAP properties.
     *
     * @return
     */
    public Map<String, Object> getPropertyMapper() {
        Map<String, Object> mapper = new HashMap<>();
        mapper.put("groupName", nameAttribute);
        mapper.put("description", descriptionAttribute);
        return mapper;
    }

    protected List<UserGroup> ldapSearch(
            String filter, DirContextProcessor processor, final ISearch search) {
        SearchControls controls = new SearchControls();
        controls.setSearchScope(SearchControls.SUBTREE_SCOPE);
        return template.search(
                searchBase,
                filter,
                controls,
                new AbstractContextMapper() {
                    int counter = 1;

                    @Override
                    protected UserGroup doMapFromContext(DirContextOperations ctx) {
                        UserGroup group = new UserGroup();
                        group.setId(
                                (long) counter++); // TODO: optionally map an attribute to the id
                        group.setEnabled(true);
                        group.setGroupName(ctx.getStringAttribute(nameAttribute));
                        group.setDescription(ctx.getStringAttribute(descriptionAttribute));
                        // if we bind users to groups through member attribute on groups, we fill
                        // the users list here
                        if (!"".equals(memberAttribute) && userDAO != null && loadUsers(search)) {
                            String[] memberAttrs = ctx.getStringAttributes(memberAttribute);
                            if (memberAttrs != null && memberAttrs.length > 0) {
                                for (String member : memberAttrs) {
                                    group.getUsers().add(userDAO.createMemberUser(member));
                                }
                            }
                        }
                        return group;
                    }
                },
                processor);
    }

    /**
     * Add the "everyone" group to the groups list.
     *
     * <p>the "everyone" group will be added if not present already and if one of these conditions
     * is met:
     *
     * <ul>
     *   <li>no search is being performed
     *   <li>there is a search for the "everyone" group
     *   <li>there is a wildcard ("*") search for the group name
     * </ul>
     *
     * @param groups
     * @param search
     * @return
     */
    private List<UserGroup> addEveryOne(List<UserGroup> groups, ISearch search) {
        UserGroup everyoneGroup = createEveryoneGroup(groups.size() + 1);
        if (search == null
                || matchFilters(everyoneGroup, search)
                || wildcardGroupNameSearch(search)) {
            boolean everyoneFound = false;
            for (UserGroup group : groups) {
                if (group.getGroupName().equals(everyoneGroup.getGroupName())) {
                    everyoneFound = true;
                }
            }
            if (!everyoneFound && addEveryOneGroup) {
                groups.add(everyoneGroup);
            }
        }
        return groups;
    }

    private UserGroup createEveryoneGroup(int id) {
        UserGroup everyoneGroup = new UserGroup();
        everyoneGroup.setGroupName(GroupReservedNames.EVERYONE.groupName());
        everyoneGroup.setId((long) id);
        everyoneGroup.setEnabled(true);
        return everyoneGroup;
    }

    /**
     * Returns true if the group matches the given filters.
     *
     * @param group
     * @param search
     * @return
     */
    protected boolean matchFilters(UserGroup group, ISearch search) {
        Expression matchExpression = getSearchExpression(search);
        return matchExpression.getValue(group, Boolean.class);
    }

    private boolean wildcardGroupNameSearch(ISearch search) {
        return retrieveGroupNameFilterValue(search).map("*"::equals).orElse(false);
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#merge(java.lang.Object)
     */
    @Override
    public UserGroup merge(UserGroup entity) {
        throw new UnsupportedOperationException();
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#remove(java.lang.Object)
     */
    @Override
    public boolean remove(UserGroup entity) {
        throw new UnsupportedOperationException();
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#removeById(java.io.Serializable)
     */
    @Override
    public boolean removeById(Long id) {
        throw new UnsupportedOperationException();
    }

    @Override
    public UserGroup[] save(UserGroup... entities) {
        throw new UnsupportedOperationException();
    }

    @Override
    public int count(ISearch search) {
        // TODO: optimize
        return search(search).size();
    }

    protected boolean loadUsers(ISearch search) {
        if (search instanceof GeoStoreISearchWrapper) {
            GeoStoreISearchWrapper wrapper = (GeoStoreISearchWrapper) search;
            Class<?> clazz = wrapper.getCallerContext();
            if (clazz != null && UserDAO.class.isAssignableFrom(clazz)) return false;
        }
        return true;
    }

    // ---------------------------------------------------------------------
    // Optional helper required by the DAO interface (read-only in LDAP)
    // ---------------------------------------------------------------------

    /**
     * LDAP implementation does not persist attributes; this method simply delegates to {@link
     * #find(Long)} which is currently unsupported and returns {@code null}.
     *
     * @param id the group id
     * @return {@code null} (IDs are not supported in this LDAP DAO)
     * @since 2025
     */
    @Override
    public UserGroup findWithAttributes(long id) {
        return find(id);
    }
}
