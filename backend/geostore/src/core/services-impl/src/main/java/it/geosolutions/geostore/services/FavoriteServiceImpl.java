/*
 *  Copyright (C) 2025 GeoSolutions S.A.S.
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

import com.googlecode.genericdao.search.Search;

import it.geosolutions.geostore.core.dao.ResourceDAO;
import it.geosolutions.geostore.core.dao.UserDAO;
import it.geosolutions.geostore.core.dao.UserFavoriteDAO;
import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserFavorite;
import it.geosolutions.geostore.services.exception.DuplicatedFavoriteServiceException;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;

import jakarta.ws.rs.ForbiddenException;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.function.BiFunction;
import java.util.function.LongFunction;

public class FavoriteServiceImpl implements FavoriteService {

    private static final LongFunction<Search> SEARCH_BY_RESOURCE_ID =
            resourceId -> new Search(UserFavorite.class).addFilterEqual("resource.id", resourceId);

    private static final BiFunction<Long, Long, Search> SEARCH_BY_USER_ID =
            (userId, resourceId) ->
                    SEARCH_BY_RESOURCE_ID.apply(resourceId).addFilterEqual("user.id", userId);

    private static final BiFunction<String, Long, Search> SEARCH_BY_USERNAME =
            (username, resourceId) ->
                    SEARCH_BY_RESOURCE_ID.apply(resourceId).addFilterEqual("username", username);

    private final UserFavoriteDAO userFavoriteDAO;
    private final ResourcePermissionService resourcePermissionService;
    private final UserDAO userDAO;
    private final ResourceDAO resourceDAO;

    public FavoriteServiceImpl(
            UserFavoriteDAO userFavoriteDAO,
            ResourcePermissionService resourcePermissionService,
            UserDAO userDAO,
            ResourceDAO resourceDAO) {
        this.userFavoriteDAO = userFavoriteDAO;
        this.resourcePermissionService = resourcePermissionService;
        this.userDAO = userDAO;
        this.resourceDAO = resourceDAO;
    }

    @Override
    @Transactional(value = "geostoreTransactionManager")
    public void addFavorite(User user, long resourceId)
            throws NotFoundServiceEx, DuplicatedFavoriteServiceException {

        Resource resource = resourceDAO.find(resourceId);
        if (resource == null) {
            throw new NotFoundServiceEx("Resource not found");
        }

        if (!resourcePermissionService.canResourceBeReadByUser(resource, user)) {
            throw new ForbiddenException("Resource is protected");
        }

        if (isUserFromExternalSecurity(user)) {
            /* external security setup - using username */
            addFavoriteByUsername(user.getName(), resource);
            return;
        }

        addFavoriteByUserId(user.getId(), resource);
    }

    private void addFavoriteByUsername(String username, Resource resource)
            throws DuplicatedFavoriteServiceException {

        checkForDuplicates(SEARCH_BY_USERNAME.apply(username, resource.getId()));

        userFavoriteDAO.persist(UserFavorite.withUsername(username, resource));
    }

    private void addFavoriteByUserId(long userId, Resource resource)
            throws NotFoundServiceEx, DuplicatedFavoriteServiceException {

        User user = userDAO.find(userId);
        if (user == null) {
            throw new NotFoundServiceEx("User not found");
        }

        checkForDuplicates(SEARCH_BY_USER_ID.apply(userId, resource.getId()));

        userFavoriteDAO.persist(UserFavorite.withUser(user, resource));
    }

    private void checkForDuplicates(Search duplicateSearch)
            throws DuplicatedFavoriteServiceException {

        Search search = duplicateSearch.setMaxResults(1);

        if (userFavoriteDAO.count(search) > 0) {
            throw new DuplicatedFavoriteServiceException(
                    "Cannot create favorite since it already exists.");
        }
    }

    @Override
    @Transactional(value = "geostoreTransactionManager")
    public void removeFavorite(User user, long resourceId) throws NotFoundServiceEx {

        Search searchCriteria = SEARCH_BY_USER_ID.apply(user.getId(), resourceId);

        if (isUserFromExternalSecurity(user)) {
            /* external security setup - searching by username instead */
            searchCriteria = SEARCH_BY_USERNAME.apply(user.getName(), resourceId);
        }

        List<UserFavorite> favorites = userFavoriteDAO.search(searchCriteria);
        if (favorites.isEmpty()) {
            throw new NotFoundServiceEx("Favorite not found");
        }

        userFavoriteDAO.remove(favorites.get(0));
    }

    private static boolean isUserFromExternalSecurity(User user) {
        return user.getId() == -1;
    }
}
