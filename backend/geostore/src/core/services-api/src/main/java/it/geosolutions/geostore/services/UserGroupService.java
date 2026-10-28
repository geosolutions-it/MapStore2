/*
 *  Copyright (C) 2007-2012 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.UserGroupAttribute;
import it.geosolutions.geostore.services.dto.ShortResource;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;

import java.util.Collection;
import java.util.List;

/**
 * @author DamianoG
 */
public interface UserGroupService {

    /**
     * @param userGroup
     * @return
     * @throws BadRequestServiceEx
     */
    long insert(UserGroup userGroup) throws BadRequestServiceEx;

    /**
     * @param id
     * @throws NotFoundServiceEx
     * @throws BadRequestServiceEx
     */
    boolean delete(long id) throws NotFoundServiceEx, BadRequestServiceEx;

    /**
     * @param userId
     * @param groupId
     * @throws NotFoundServiceEx
     */
    void assignUserGroup(long userId, long groupId) throws NotFoundServiceEx;

    /**
     * @param userId
     * @param groupId
     * @throws NotFoundServiceEx
     */
    void deassignUserGroup(long userId, long groupId) throws NotFoundServiceEx;

    /**
     * Returns a list of groups that match searching criteria with pagination.
     *
     * @param user the user that performs the research
     * @param page the requested page number
     * @param entries max entries for page.
     * @param nameLike a sub-string to filter groups names with ILIKE operator
     * @param all if <code>true</code> adds to result the 'everyone' group if it matches the
     *     searching criteria
     * @return a list of groups that match searching criteria with pagination.
     * @throws BadRequestServiceEx
     */
    List<UserGroup> getAllAllowed(
            User user, Integer page, Integer entries, String nameLike, boolean all)
            throws BadRequestServiceEx;

    /**
     * Returns a list of groups that match searching criteria with pagination.
     *
     * @param page the requested page number
     * @param entries max entries for page.
     * @return a list of groups that match searching criteria with pagination.
     * @throws BadRequestServiceEx
     */
    List<UserGroup> getAll(Integer page, Integer entries) throws BadRequestServiceEx;

    /**
     * Returns a list of groups that match searching criteria with pagination.
     *
     * @param page the requested page number
     * @param entries max entries for page.
     * @param nameLike a sub-string to filter groups names with ILIKE operator
     * @param all if <code>true</code> adds to result the 'everyone' group if it matches the
     *     searching criteria
     * @return a list of groups that match searching criteria with pagination.
     * @throws BadRequestServiceEx
     */
    List<UserGroup> getAll(Integer page, Integer entries, String nameLike, boolean all)
            throws BadRequestServiceEx;

    UserGroup get(long id) throws BadRequestServiceEx;

    /**
     * @param groupId
     * @param resourcesToSet
     * @param canRead
     * @param canWrite
     * @return
     * @throws BadRequestServiceEx
     * @throws NotFoundServiceEx
     */
    List<ShortResource> updateSecurityRules(
            Long groupId, List<Long> resourcesToSet, boolean canRead, boolean canWrite)
            throws NotFoundServiceEx, BadRequestServiceEx;

    /**
     * Persist the special UserGroups, those that implies special behavior
     *
     * <p>For obvious reasons this Method MUST NOT be exposed through the rest interface.
     *
     * @return true if the persist operation finish with success, false otherwise
     */
    boolean insertSpecialUsersGroups();

    /**
     * Remove the special UserGroups, those that implies special behavior
     *
     * <p>For obvious reasons this Method MUST NOT be exposed through the rest interface.
     *
     * @return true if the removal operation finish with success, false otherwise
     */
    boolean removeSpecialUsersGroups();

    /**
     * Get The UserGroup from the name
     *
     * @param name
     */
    UserGroup get(String name);

    /**
     * Returns the amount of groups that match searching criteria.
     *
     * @param nameLike a sub-string to search in group name
     * @param all if <code>true</code> adds to result the 'everyone' group if it matches the
     *     searching criteria
     * @return the amount of groups that match searching criteria
     * @throws BadRequestServiceEx
     */
    long getCount(String nameLike, boolean all) throws BadRequestServiceEx;

    /**
     * Returns the amount of groups that match searching criteria.
     *
     * @param authUser the user that performs the research
     * @param nameLike a sub-string to search in group name
     * @param all if <code>true</code> adds to result the 'everyone' group if it matches the
     *     searching criteria
     * @return the amount of groups that match searching criteria
     * @throws BadRequestServiceEx
     */
    long getCount(User authUser, String nameLike, boolean all) throws BadRequestServiceEx;

    /**
     * @param id
     * @param attributes
     * @throws NotFoundServiceEx
     */
    void updateAttributes(long id, List<UserGroupAttribute> attributes) throws NotFoundServiceEx;

    /**
     * @param group
     * @return long
     * @throws NotFoundServiceEx
     * @throws BadRequestServiceEx
     */
    long update(UserGroup group) throws NotFoundServiceEx, BadRequestServiceEx;

    Collection<UserGroup> findByAttribute(String name, List<String> values, boolean ignoreCase);

    // ---------------------------------------------------------------------
    // Optional helpers to avoid LazyInitialization in security filters
    // and to safely update a single attribute without replacing others.
    // ---------------------------------------------------------------------

    /**
     * Returns the {@link UserGroup} with the given id with its attributes fully initialized (e.g.
     * via JOIN FETCH). This is useful when a caller needs to read group attributes outside of a web
     * request transaction boundary without triggering lazy-loading issues.
     *
     * @param id the group id
     * @return the group with initialized attributes
     * @throws NotFoundServiceEx if the group does not exist
     * @throws BadRequestServiceEx if the request cannot be fulfilled
     * @since 2025
     */
    UserGroup getWithAttributes(long id) throws NotFoundServiceEx, BadRequestServiceEx;

    /**
     * Upserts a single attribute on the given group, creating it if missing or updating its value
     * if already present. This method does not replace unrelated attributes.
     *
     * @param groupId the group id
     * @param name attribute name (case-insensitive match recommended by implementations)
     * @param value attribute value (may be {@code null} depending on implementation policy)
     * @throws NotFoundServiceEx if the group does not exist
     * @throws BadRequestServiceEx if the update cannot be performed
     * @since 2025
     */
    void upsertAttribute(long groupId, String name, String value)
            throws NotFoundServiceEx, BadRequestServiceEx;
}
