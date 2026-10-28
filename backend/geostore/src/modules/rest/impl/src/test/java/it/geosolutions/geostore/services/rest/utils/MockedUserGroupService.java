/*
 *  Copyright (C) 2015 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.utils;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.UserGroupAttribute;
import it.geosolutions.geostore.services.UserGroupService;
import it.geosolutions.geostore.services.dto.ShortResource;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class MockedUserGroupService implements UserGroupService {

    private static final Random RANDOM = new Random();

    private final Map<Long, UserGroup> GROUPS = new ConcurrentHashMap<Long, UserGroup>();

    @Override
    public long insert(UserGroup userGroup) throws BadRequestServiceEx {
        Long id = RANDOM.nextLong();
        userGroup.setId(id);

        GROUPS.put(id, userGroup);
        return id;
    }

    @Override
    public boolean delete(long id) throws NotFoundServiceEx, BadRequestServiceEx {
        return GROUPS.containsKey(id) && GROUPS.remove(id) != null;
    }

    @Override
    public void assignUserGroup(long userId, long groupId) throws NotFoundServiceEx {
        // TODO Auto-generated method stub

    }

    @Override
    public void deassignUserGroup(long userId, long groupId) throws NotFoundServiceEx {
        // TODO Auto-generated method stub

    }

    @Override
    public List<UserGroup> getAll(Integer page, Integer entries) throws BadRequestServiceEx {
        return new ArrayList<>(GROUPS.values());
    }

    @Override
    public List<UserGroup> getAll(Integer page, Integer entries, String nameLike, boolean all)
            throws BadRequestServiceEx {
        return new ArrayList<>(GROUPS.values());
    }

    @Override
    public UserGroup get(long id) throws BadRequestServiceEx {
        return GROUPS.get(id);
    }

    @Override
    public List<ShortResource> updateSecurityRules(
            Long groupId, List<Long> resourcesToSet, boolean canRead, boolean canWrite)
            throws NotFoundServiceEx, BadRequestServiceEx {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public boolean insertSpecialUsersGroups() {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public boolean removeSpecialUsersGroups() {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public UserGroup get(String name) {
        for (UserGroup userGroup : GROUPS.values()) {
            if (userGroup.getGroupName().equals(name)) {
                return userGroup;
            }
        }
        return null;
    }

    @Override
    public List<UserGroup> getAllAllowed(
            User user, Integer page, Integer entries, String nameLike, boolean all)
            throws BadRequestServiceEx {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public long getCount(String nameLike, boolean all) throws BadRequestServiceEx {
        // TODO Auto-generated method stub
        return 0;
    }

    @Override
    public long getCount(User authUser, String nameLike, boolean all) throws BadRequestServiceEx {
        // TODO Auto-generated method stub
        return 0;
    }

    @Override
    public void updateAttributes(long id, List<UserGroupAttribute> attributes)
            throws NotFoundServiceEx {}

    @Override
    public long update(UserGroup group) throws NotFoundServiceEx, BadRequestServiceEx {
        return 0;
    }

    @Override
    public Collection<UserGroup> findByAttribute(
            String name, List<String> values, boolean ignoreCase) {
        return null;
    }

    /**
     * @param id the group id
     * @return
     * @throws NotFoundServiceEx
     * @throws BadRequestServiceEx
     */
    @Override
    public UserGroup getWithAttributes(long id) throws NotFoundServiceEx, BadRequestServiceEx {
        return null;
    }

    /**
     * @param groupId the group id
     * @param name attribute name (case-insensitive match recommended by implementations)
     * @param value attribute value (may be {@code null} depending on implementation policy)
     * @throws NotFoundServiceEx
     * @throws BadRequestServiceEx
     */
    @Override
    public void upsertAttribute(long groupId, String name, String value)
            throws NotFoundServiceEx, BadRequestServiceEx {}
}
