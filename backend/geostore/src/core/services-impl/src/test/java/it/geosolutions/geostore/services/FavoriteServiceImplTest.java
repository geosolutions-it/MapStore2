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

import static org.junit.Assert.assertThrows;

import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.SecurityRule;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserFavorite;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.services.exception.DuplicatedFavoriteServiceException;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;

import jakarta.ws.rs.ForbiddenException;

import java.util.Collections;
import java.util.List;
import java.util.Set;

public class FavoriteServiceImplTest extends ServiceTestBase {

    public void testAddFavorite() throws Exception {

        long resourceId = createResource("resource", "description", "category");
        long userId = createUser("user", Role.USER, "password");

        User user = userService.get(userId);

        SecurityRule rule = new SecurityRule();
        rule.setUser(user);
        rule.setCanRead(true);
        resourceService.updateSecurityRules(resourceId, List.of(rule));

        favoriteService.addFavorite(user, resourceId);

        userService.fetchFavorites(user);

        Set<UserFavorite> userFavorites = user.getFavorites();
        assertEquals(1, userFavorites.size());
        UserFavorite userFavorite = userFavorites.stream().findFirst().orElseThrow();
        assertEquals(resourceId, userFavorite.getResource().getId().longValue());
        assertEquals(userId, userFavorite.getUser().getId().longValue());
    }

    public void testAddFavoriteWhenNotPermitted() throws Exception {

        long resourceId = createResource("resource", "description", "category");
        long userId = createUser("user", Role.USER, "password");

        User user = userService.get(userId);

        SecurityRule rule = new SecurityRule();
        rule.setUser(null);
        rule.setUsername("alice");
        rule.setCanRead(true);

        resourceService.updateSecurityRules(resourceId, List.of(rule));

        assertThrows(ForbiddenException.class, () -> favoriteService.addFavorite(user, resourceId));
    }

    public void testAddFavoriteWhenAdmin() throws Exception {

        long resourceId = createResource("resource", "description", "category");
        long adminId = createUser("minister", Role.ADMIN, "password");

        User admin = userService.get(adminId);

        SecurityRule rule = new SecurityRule();
        rule.setUser(null);
        rule.setUsername("magister");
        rule.setCanRead(true);
        resourceService.updateSecurityRules(resourceId, List.of(rule));

        favoriteService.addFavorite(admin, resourceId);

        userService.fetchFavorites(admin);

        Set<UserFavorite> userFavorites = admin.getFavorites();
        assertEquals(1, userFavorites.size());
        UserFavorite userFavorite = userFavorites.stream().findFirst().orElseThrow();
        assertEquals(resourceId, userFavorite.getResource().getId().longValue());
        assertEquals(adminId, userFavorite.getUser().getId().longValue());
    }

    public void testAddFavoriteWhenDuplicateExists() throws Exception {

        long resourceId = createResource("resource", "description", "category");
        long userId = createUser("user", Role.USER, "password");

        User user = userService.get(userId);

        SecurityRule rule = new SecurityRule();
        rule.setUser(user);
        rule.setCanRead(true);
        resourceService.updateSecurityRules(resourceId, List.of(rule));

        favoriteService.addFavorite(user, resourceId);

        assertThrows(
                DuplicatedFavoriteServiceException.class,
                () -> favoriteService.addFavorite(user, resourceId));
    }

    public void testAddFavoriteWhenNotFoundResource() throws Exception {
        long userId = createUser("user", Role.USER, "password");
        assertThrows(
                NotFoundServiceEx.class,
                () -> favoriteService.addFavorite(userService.get(userId), 0L));
    }

    public void testAddFavoriteWithExternalSecurity() throws Exception {

        long resourceId = createResource("resource", "description", "category");
        User user = createExternalSecurityUser();

        SecurityRule rule = new SecurityRule();
        rule.setUser(null);
        rule.setUsername(user.getName());
        rule.setCanRead(true);
        resourceService.updateSecurityRules(resourceId, List.of(rule));

        favoriteService.addFavorite(user, resourceId);

        Resource resource = resourceService.get(resourceId);
        resourceService.fetchFavorites(resource);

        Set<UserFavorite> favorites = resource.getFavorites();
        assertEquals(1, favorites.size());
        UserFavorite userFavorite = favorites.stream().findFirst().orElseThrow();
        assertEquals(resourceId, userFavorite.getResource().getId().longValue());
        assertEquals(user.getName(), userFavorite.getUsername());
    }

    public void testAddFavoriteWithExternalSecurityWhenNotPermitted() throws Exception {

        long resourceId = createResource("resource", "description", "category");
        User user = createExternalSecurityUser();

        SecurityRule rule = new SecurityRule();
        rule.setUser(null);
        rule.setUsername("alice");
        rule.setCanRead(true);

        resourceService.updateSecurityRules(resourceId, List.of(rule));

        assertThrows(ForbiddenException.class, () -> favoriteService.addFavorite(user, resourceId));
    }

    public void testAddFavoriteWithExternalSecurityWhenAdmin() throws Exception {

        long resourceId = createResource("resource", "description", "category");
        User user = createExternalSecurityUser();
        user.setRole(Role.ADMIN);

        SecurityRule rule = new SecurityRule();
        rule.setUser(null);
        rule.setUsername("simpleuser");
        rule.setCanRead(true);
        resourceService.updateSecurityRules(resourceId, List.of(rule));

        favoriteService.addFavorite(user, resourceId);

        Resource resource = resourceService.get(resourceId);
        resourceService.fetchFavorites(resource);

        Set<UserFavorite> favorites = resource.getFavorites();
        assertEquals(1, favorites.size());
        UserFavorite userFavorite = favorites.stream().findFirst().orElseThrow();
        assertEquals(resourceId, userFavorite.getResource().getId().longValue());
        assertEquals(user.getName(), userFavorite.getUsername());
    }

    public void testAddFavoriteWithExternalSecurityWhenDuplicateExists() throws Exception {

        long resourceId = createResource("resource", "description", "category");
        User user = createExternalSecurityUser();

        SecurityRule rule = new SecurityRule();
        rule.setUser(null);
        rule.setUsername(user.getName());
        rule.setCanRead(true);
        resourceService.updateSecurityRules(resourceId, List.of(rule));

        favoriteService.addFavorite(user, resourceId);

        assertThrows(
                DuplicatedFavoriteServiceException.class,
                () -> favoriteService.addFavorite(user, resourceId));
    }

    public void testAddFavoriteWithExternalSecurityNotFoundResource() {
        User user = createExternalSecurityUser();
        assertThrows(NotFoundServiceEx.class, () -> favoriteService.addFavorite(user, 0L));
    }

    private static User createExternalSecurityUser() {
        User user = new User();
        user.setId(-1L);
        user.setName("user");
        user.setRole(Role.USER);
        return user;
    }

    public void testRemoveFavorite() throws Exception {

        long resourceId = createResource("resource", "description", "category");
        long userId = createUser("user", Role.USER, "password");

        User user = userService.get(userId);
        Resource resource = resourceService.get(resourceId);

        UserFavorite favorite = UserFavorite.withUser(user, resource);

        user.setFavorites(Collections.singleton(favorite));
        userService.update(user);

        userService.fetchFavorites(user);
        assertFalse(user.getFavorites().isEmpty());

        favoriteService.removeFavorite(user, resourceId);
        userService.fetchFavorites(user);

        assertTrue(user.getFavorites().isEmpty());
    }

    public void testRemoveFavoriteWhenNotFoundResource() throws Exception {

        long resourceId = createResource("resource", "description", "category");
        long userId = createUser("user", Role.USER, "password");

        User user = userService.get(userId);
        Resource resource = resourceService.get(resourceId);

        UserFavorite favorite = UserFavorite.withUser(user, resource);

        user.setFavorites(Collections.singleton(favorite));
        userService.update(user);

        userService.fetchFavorites(user);
        assertFalse(user.getFavorites().isEmpty());

        assertThrows(NotFoundServiceEx.class, () -> favoriteService.removeFavorite(user, 0L));
    }

    public void testRemoveFavoriteNotFoundUser() throws Exception {
        long resourceId = createResource("resource", "description", "category");
        long userId = createUser("user", Role.USER, "password");

        User user = userService.get(userId);
        Resource resource = resourceService.get(resourceId);

        UserFavorite favorite = UserFavorite.withUser(user, resource);

        user.setFavorites(Collections.singleton(favorite));
        userService.update(user);

        userService.fetchFavorites(user);
        assertFalse(user.getFavorites().isEmpty());

        User otherUser = new User();
        otherUser.setId(0L);

        assertThrows(
                NotFoundServiceEx.class,
                () -> favoriteService.removeFavorite(otherUser, resourceId));
    }

    public void testRemoveFavoriteWithExternalSecurity() throws Exception {

        long resourceId = createResource("resource", "description", "category");
        User user = createExternalSecurityUser();

        Resource resource = resourceService.get(resourceId);

        UserFavorite favorite = UserFavorite.withUsername(user.getName(), resource);

        resource.setFavorites(Collections.singleton(favorite));
        resourceService.update(resource);

        resourceService.fetchFavorites(resource);
        assertFalse(resource.getFavorites().isEmpty());

        favoriteService.removeFavorite(user, resourceId);

        resourceService.fetchFavorites(resource);
        assertTrue(resource.getFavorites().isEmpty());
    }

    public void testRemoveFavoriteWithExternalSecurityWhenNotFoundUser() throws Exception {

        long resourceId = createResource("resource", "description", "category");
        User user = createExternalSecurityUser();

        Resource resource = resourceService.get(resourceId);

        UserFavorite favorite = UserFavorite.withUsername(user.getName(), resource);

        resource.setFavorites(Collections.singleton(favorite));
        resourceService.update(resource);

        resourceService.fetchFavorites(resource);
        assertFalse(resource.getFavorites().isEmpty());

        User otherUser = createExternalSecurityUser();
        otherUser.setName("iamtheother");

        assertThrows(
                NotFoundServiceEx.class,
                () -> favoriteService.removeFavorite(otherUser, resourceId));
    }
}
