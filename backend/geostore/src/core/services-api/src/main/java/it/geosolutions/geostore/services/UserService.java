/*
 * ====================================================================
 *
 * Copyright (C) 2007 - 2011 GeoSolutions S.A.S.
 * http://www.geo-solutions.it
 *
 * GPLv3 + Classpath exception
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.
 *
 * ====================================================================
 *
 * This software consists of voluntary contributions made by developers
 * of GeoSolutions.  For more information on GeoSolutions, please see
 * <http://www.geo-solutions.it/>.
 *
 */
package it.geosolutions.geostore.services;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserAttribute;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;

import java.util.Collection;
import java.util.List;

/**
 * Class UserInterface.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public interface UserService {

    /**
     * @param user
     * @return long
     * @throws BadRequestServiceEx
     * @throws NotFoundServiceEx
     */
    long insert(User user) throws BadRequestServiceEx, NotFoundServiceEx;

    /**
     * @param user
     * @return long
     * @throws NotFoundServiceEx
     * @throws BadRequestServiceEx
     */
    long update(User user) throws NotFoundServiceEx, BadRequestServiceEx;

    /**
     * @param id
     * @return boolean
     */
    boolean delete(long id);

    /**
     * Deletes a user and, in cascade, the resources of the given categories that the user solely
     * owns (e.g. the MapStore {@code USERSESSION} resources). Category names that do not exist are
     * ignored: the user deletion proceeds anyway.
     *
     * <p>The default implementation ignores the categories and performs a plain {@link
     * #delete(long)}: implementations that support the resource cascade must override it.
     *
     * @param id the user id
     * @param cascadeResourceCategories comma-separated names of the resource categories whose
     *     solely-owned resources must be deleted along with the user; may be null or blank for no
     *     cascade
     * @return boolean true if the user has been deleted
     */
    default boolean delete(long id, String cascadeResourceCategories) {
        return delete(id);
    }

    /**
     * @param id
     * @return User
     */
    User get(long id);

    /**
     * @param name
     * @return User
     * @throws NotFoundServiceEx
     */
    User get(String name) throws NotFoundServiceEx;

    /**
     * @param page
     * @param entries
     * @return List<User>
     * @throws BadRequestServiceEx
     */
    List<User> getAll(Integer page, Integer entries) throws BadRequestServiceEx;

    /**
     * @param page
     * @param entries
     * @param nameLike
     * @param includeAttributes
     * @return List<User>
     * @throws BadRequestServiceEx
     */
    List<User> getAll(Integer page, Integer entries, String nameLike, boolean includeAttributes)
            throws BadRequestServiceEx;

    /**
     * @param nameLike
     * @return long
     */
    long getCount(String nameLike);

    /**
     * @param id
     * @param attributes
     * @throws NotFoundServiceEx
     */
    void updateAttributes(long id, List<UserAttribute> attributes) throws NotFoundServiceEx;

    /**
     * Persist the special Users, those that implies special behavior (Like GUEST)
     *
     * <p>For obvious reasons, this Method MUST NOT expose through the rest interface.
     *
     * @return true if the persist operation finish with success, false otherwise
     */
    boolean insertSpecialUsers();

    /**
     * Returns all user with the specified attribute (name / value).
     *
     * @param attribute
     * @return
     */
    Collection<User> getByAttribute(UserAttribute attribute);

    Collection<User> getByGroup(UserGroup group);

    /**
     * Update the user entity by fetching its favorites resources from the database.
     *
     * @param user
     */
    default void fetchFavorites(User user) {
        /* no-op */
    }
}
