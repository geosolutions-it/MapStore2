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
package it.geosolutions.geostore.services.rest.impl;

import static org.junit.jupiter.api.Assertions.assertThrows;

import it.geosolutions.geostore.core.model.SecurityRule;
import it.geosolutions.geostore.core.model.Tag;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.services.ServiceTestBase;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;
import it.geosolutions.geostore.services.rest.exception.ForbiddenErrorWebEx;
import it.geosolutions.geostore.services.rest.model.TagList;
import it.geosolutions.geostore.services.rest.utils.MockSecurityContext;

import jakarta.ws.rs.core.SecurityContext;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.springframework.web.context.request.RequestContextHolder;

import java.util.List;

public class RESTTagServiceImplTest extends ServiceTestBase {

    RESTTagServiceImpl restService;

    @Before
    public void setUp() throws BadRequestServiceEx, NotFoundServiceEx {
        restService = (RESTTagServiceImpl) ctx.getBean("restTagService");
        mockHttpRequestIPAddressAttribute();
    }

    @After
    public void tearDown() throws Exception {
        RequestContextHolder.resetRequestAttributes();
        removeAll();
    }

    @Test
    public void testGetAllWithPagination() throws Exception {

        final Tag tag_a = new Tag("tag-A", "#4561aa", "dusky");
        final Tag tag_b = new Tag("tag-B", "black", null);
        final Tag tag_c = new Tag("tag-C", "navy", "kind of blue");

        long userID = createUser("user", Role.USER, "user");
        SecurityContext sc = new MockSecurityContext(userService.get(userID));

        tagService.insert(tag_a);
        tagService.insert(tag_b);
        tagService.insert(tag_c);

        TagList firstPage = restService.getAll(sc, 0, 2, null);
        assertEquals(3, (long) firstPage.getCount());
        assertEquals(List.of(tag_a, tag_b), firstPage.getList());

        TagList secondPage = restService.getAll(sc, 1, 2, null);
        assertEquals(3, (long) firstPage.getCount());
        assertEquals(List.of(tag_c), secondPage.getList());
    }

    @Test
    public void testTagChangesRequireWriteAccessToResource() throws Exception {
        long ownerId = createUser("owner", Role.USER, "owner");
        long otherId = createUser("other", Role.USER, "other");

        SecurityRule ownerRule = new SecurityRule();
        ownerRule.setUser(userService.get(ownerId));
        ownerRule.setCanRead(true);
        ownerRule.setCanWrite(true);
        long resourceId = createResource("private-map", "canary", "MAP", List.of(ownerRule));
        long tagId = tagService.insert(new Tag("canary-tag", "black", null));

        SecurityContext owner = new MockSecurityContext(userService.get(ownerId));
        SecurityContext other = new MockSecurityContext(userService.get(otherId));

        assertThrows(
                ForbiddenErrorWebEx.class,
                () -> restService.addToResource(other, tagId, resourceId));
        restService.addToResource(owner, tagId, resourceId);

        assertThrows(
                ForbiddenErrorWebEx.class,
                () -> restService.removeFromResource(other, tagId, resourceId));
        restService.removeFromResource(owner, tagId, resourceId);
    }
}
