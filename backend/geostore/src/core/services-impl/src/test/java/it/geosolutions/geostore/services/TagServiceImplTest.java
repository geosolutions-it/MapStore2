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
import it.geosolutions.geostore.core.model.Tag;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.DuplicatedTagNameServiceException;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;

public class TagServiceImplTest extends ServiceTestBase {

    public TagServiceImplTest() {}

    public void testInsert() throws Exception {

        Tag tagA = new Tag("tag-A", "#4561aa", "dusky");
        Tag tagB = new Tag("tag-B", "black", null);

        tagService.insert(tagA);
        tagService.insert(tagB);

        List<Tag> foundTags = tagDAO.findAll();
        assertEquals(2, foundTags.size());
        List<Long> foundTagsIds = foundTags.stream().map(Tag::getId).toList();
        assertTrue(foundTagsIds.stream().noneMatch(Objects::isNull));
    }

    public void testInsertDuplicate() throws Exception {

        Tag tag = new Tag("tag-A", "#4561aa", "dusky");
        Tag duplicateTag = new Tag(tag.getName(), "black", null);

        tagService.insert(tag);

        DuplicatedTagNameServiceException ex =
                assertThrows(
                        DuplicatedTagNameServiceException.class,
                        () -> tagService.insert(duplicateTag));
        assertTrue(ex.getMessage().contains("create"));
    }

    public void testInsertNull() throws Exception {
        assertThrows(BadRequestServiceEx.class, () -> tagService.insert(null));
    }

    public void testGetAll() throws Exception {

        final Tag tag_a = new Tag("tag-A", "#4561aa", "dusky");
        final Tag tag_b = new Tag("tag-B", "black", null);

        tagDAO.persist(tag_a, tag_b);

        List<Tag> foundTags = tagService.getAll(0, 100, null);
        assertEquals(List.of(tag_a, tag_b), foundTags);
    }

    public void testGetAllPaginated() throws Exception {

        final Tag tag_a = new Tag("tag-A", "#4561aa", "dusky");
        final Tag tag_b = new Tag("tag-B", "black", null);
        final Tag tag_c = new Tag("tag-C", "navy", "kind of blue");

        tagDAO.persist(tag_a, tag_b, tag_c);

        List<Tag> firstPageTags = tagService.getAll(0, 2, null);
        assertEquals(List.of(tag_a, tag_b), firstPageTags);
        List<Tag> secondPageTags = tagService.getAll(1, 2, null);
        assertEquals(List.of(tag_c), secondPageTags);
    }

    public void testGetAllFiltered() throws Exception {

        final Tag tag_a = new Tag("tag-A", "#4561aa", "dusky");
        final Tag tag_b = new Tag("tag-B", "black", null);
        final Tag tag_c = new Tag("C", "navy", "kind of blue");

        tagDAO.persist(tag_a, tag_b, tag_c);

        List<Tag> foundTags = tagService.getAll(0, 100, "tag%");
        assertEquals(List.of(tag_a, tag_b), foundTags);
    }

    public void testGet() throws Exception {

        final Tag tag_a = new Tag("tag-A", "#4561aa", "dusky");
        final Tag tag_b = new Tag("tag-B", "black", null);

        tagDAO.persist(tag_a, tag_b);

        Tag foundTag = tagService.get(tag_a.getId());
        assertEquals(tag_a, foundTag);
    }

    public void testUpdate() throws Exception {

        final Tag expected_tag = new Tag("updated name", "black", null);

        Tag tag = new Tag("tag", "#4561aa", "dusky");
        tagDAO.persist(tag);

        tagService.update(tag.getId(), expected_tag);

        Tag updatedTag = tagDAO.find(tag.getId());
        assertEquals(expected_tag, updatedTag);
    }

    public void testUpdateDoesNotCreateDuplicate() throws Exception {

        final Tag tag = new Tag("tag", "black", null);

        tagDAO.persist(tag);

        tag.setColor("#4561aa");
        tag.setDescription("dusky");

        tagService.update(tag.getId(), tag);

        Tag updatedTag = tagDAO.find(tag.getId());
        assertEquals(tag, updatedTag);
    }

    public void testUpdateDoesCreateDuplicate() {

        final Tag existing_tag = new Tag("existing", "#4561aa", "dusky");
        final Tag another_tag = new Tag("another", "black", null);

        tagDAO.persist(existing_tag, another_tag);

        another_tag.setName(existing_tag.getName());

        DuplicatedTagNameServiceException ex =
                assertThrows(
                        DuplicatedTagNameServiceException.class,
                        () -> tagService.update(another_tag.getId(), another_tag));
        assertTrue(ex.getMessage().contains("update"));
    }

    public void testUpdateWithResource() throws Exception {

        Tag update_tag = new Tag("updated name", "black", null);

        Tag tag = new Tag("tag", "#4561aa", "dusky");

        long resourceId = createResource("resource", "description", "category");
        Resource resource = resourceService.get(resourceId);

        tag.setResources(Collections.singleton(resource));
        tagDAO.persist(tag);

        tagService.update(tag.getId(), update_tag);

        Tag updatedTag = tagDAO.find(tag.getId());

        /* check if resource is still tagged */
        Resource updatedTagResource = resourceService.get(resourceId);
        Set<Tag> updatedTagResourceTags = updatedTagResource.getTags();
        assertEquals(1, updatedTagResourceTags.size());
        Tag resourceTag = updatedTagResourceTags.stream().findFirst().orElseThrow();
        assertEquals(updatedTag, resourceTag);
    }

    public void testUpdateNotFoundTag() throws Exception {
        assertThrows(NotFoundServiceEx.class, () -> tagService.update(0L, new Tag()));
    }

    public void testDelete() throws Exception {

        Tag tag = new Tag("tag", "#4561aa", "dusky");
        tagDAO.persist(tag);

        tagService.delete(tag.getId());

        Tag foundTag = tagDAO.find(tag.getId());
        assertNull(foundTag);
    }

    public void testDeleteNotFoundTag() throws Exception {
        assertThrows(NotFoundServiceEx.class, () -> tagService.delete(0L));
    }

    public void testAddToResource() throws Exception {

        final Tag tag = new Tag("tag", "#4561aa", "dusky");

        long resourceId = createResource("resource", "description", "category");

        tagDAO.persist(tag);

        tagService.addToResource(tag.getId(), resourceId);

        Resource resource = resourceDAO.find(resourceId);
        Set<Tag> resourceTags = resource.getTags();
        assertEquals(1, resourceTags.size());
        Tag resourceTag = resourceTags.stream().findFirst().orElseThrow();
        assertEquals(tag, resourceTag);
    }

    public void testAddToResourceNotFoundTag() throws Exception {
        long resourceId = createResource("resource", "description", "category");
        assertThrows(NotFoundServiceEx.class, () -> tagService.addToResource(0L, resourceId));
    }

    public void testAddToResourceNotFoundResource() throws Exception {
        Tag tag = new Tag("tag", "#4561aa", "dusky");
        tagDAO.persist(tag);
        assertThrows(NotFoundServiceEx.class, () -> tagService.addToResource(tag.getId(), 0L));
    }

    public void testRemoveFromResource() throws Exception {

        Tag tag = new Tag("tag", "#4561aa", "dusky");
        long resourceId = createResource("resource", "description", "category");

        tagDAO.persist(tag);

        Resource resource = resourceDAO.find(resourceId);
        resource.setTags(Collections.singleton(tag));
        resourceService.update(resource);

        tagService.removeFromResource(tag.getId(), resourceId);

        resource = resourceDAO.find(resourceId);
        Set<Tag> resourceTags = resource.getTags();
        assertTrue(resourceTags.isEmpty());
    }

    public void testRemoveFromResourceNotFoundTag() throws Exception {
        long resourceId = createResource("resource", "description", "category");
        assertThrows(NotFoundServiceEx.class, () -> tagService.removeFromResource(0L, resourceId));
    }

    public void testRemoveFromResourceNotFoundResource() throws Exception {
        Tag tag = new Tag("tag", "#4561aa", "dusky");
        tagDAO.persist(tag);
        assertThrows(NotFoundServiceEx.class, () -> tagService.removeFromResource(tag.getId(), 0L));
    }
}
