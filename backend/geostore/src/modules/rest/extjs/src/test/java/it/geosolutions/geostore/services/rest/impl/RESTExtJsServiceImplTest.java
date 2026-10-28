/*
 * Copyright (C) 2016-2025 GeoSolutions
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package it.geosolutions.geostore.services.rest.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;

import static java.lang.Thread.sleep;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.googlecode.genericdao.search.Search;

import it.geosolutions.geostore.core.model.IPRange;
import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.SecurityRule;
import it.geosolutions.geostore.core.model.StoredData;
import it.geosolutions.geostore.core.model.Tag;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.DataType;
import it.geosolutions.geostore.core.model.enums.GroupReservedNames;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.services.dto.ResourceSearchParameters;
import it.geosolutions.geostore.services.dto.ShortAttribute;
import it.geosolutions.geostore.services.dto.ShortResource;
import it.geosolutions.geostore.services.dto.search.AndFilter;
import it.geosolutions.geostore.services.dto.search.BaseField;
import it.geosolutions.geostore.services.dto.search.FieldFilter;
import it.geosolutions.geostore.services.dto.search.GroupFilter;
import it.geosolutions.geostore.services.dto.search.SearchOperator;
import it.geosolutions.geostore.services.dto.search.TagFilter;
import it.geosolutions.geostore.services.model.ExtGroupList;
import it.geosolutions.geostore.services.model.ExtResource;
import it.geosolutions.geostore.services.model.ExtResourceList;
import it.geosolutions.geostore.services.model.ExtShortResource;
import it.geosolutions.geostore.services.model.ExtUserList;
import it.geosolutions.geostore.services.rest.exception.ForbiddenErrorWebEx;
import it.geosolutions.geostore.services.rest.exception.NotFoundWebEx;
import it.geosolutions.geostore.services.rest.model.RESTCategory;
import it.geosolutions.geostore.services.rest.model.RESTResource;
import it.geosolutions.geostore.services.rest.model.RESTSecurityRule;
import it.geosolutions.geostore.services.rest.model.SecurityRuleList;
import it.geosolutions.geostore.services.rest.model.Sort;

import jakarta.persistence.EntityManagerFactory;
import jakarta.ws.rs.core.SecurityContext;

import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.springframework.web.context.request.RequestContextHolder;

import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * @author ETj (etj at geo-solutions.it)
 */
public class RESTExtJsServiceImplTest extends ServiceTestBase {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final RESTExtJsServiceImpl restExtJsService;

    public RESTExtJsServiceImplTest() {
        restExtJsService = ctx.getBean("restExtJsService", RESTExtJsServiceImpl.class);
        assertNotNull(restExtJsService);
    }

    @Before
    public void setUp() throws Exception {
        assertNotNull(restExtJsService);
        removeAll();
        mockHttpRequestIpAddressAttribute("127.0.0.1");
    }

    @After
    public void cleanup() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    public void testGetAllResources_auth_base() throws Exception {
        final String CAT_NAME = "CAT000";

        assertEquals(
                0,
                resourceService
                        .getAll(
                                ResourceSearchParameters.builder()
                                        .authUser(buildFakeAdminUser())
                                        .build())
                        .size());

        long u0 = restCreateUser("u0", Role.USER, null, "p0");
        long u1 = restCreateUser("u1", Role.USER, null, "p1");

        createCategory(CAT_NAME);

        restCreateResource("r_u0_0", "x", CAT_NAME, u0, true);

        restCreateResource("r_u1_0", "x", CAT_NAME, u1, true);
        restCreateResource("r_u1_1", "x", CAT_NAME, u1, true);

        {
            SecurityContext sc = new SimpleSecurityContext(u0);
            String response = restExtJsService.getAllResources(sc, "*", 0, 1000);

            System.out.println("JSON " + response);

            JSONResult result = parse(response);
            assertEquals(1, result.total);
            assertEquals(1, result.returnedCount);

            assertTrue(result.names.contains("r_u0_0"));
        }

        {
            SecurityContext sc = new SimpleSecurityContext(u1);
            String response = restExtJsService.getAllResources(sc, "*", 0, 1000);

            System.out.println("JSON " + response);

            JSONResult result = parse(response);
            assertEquals(2, result.total);
            assertEquals(2, result.returnedCount);

            assertTrue(result.names.contains("r_u1_0"));
            assertTrue(result.names.contains("r_u1_1"));

            assertFalse(result.names.contains("r_u0_0"));
        }
    }

    @Test
    public void testGetAllResources_auth_many() throws Exception {
        final String CAT_NAME = "CAT009";

        assertEquals(
                0,
                resourceService
                        .getAll(
                                ResourceSearchParameters.builder()
                                        .authUser(buildFakeAdminUser())
                                        .build())
                        .size());

        long u0 = restCreateUser("u0", Role.USER, null, "p0");
        long u1 = restCreateUser("u1", Role.USER, null, "p1");

        createCategory(CAT_NAME);

        int RESNUM0 = 20;
        int RESNUM1 = RESNUM0 * 2;

        for (int i = 1000; i < 1000 + RESNUM0; i++) {
            restCreateResource("r_u0_" + i, "x", CAT_NAME, u0, true);

            restCreateResource("r_u1_" + i + "a", "x", CAT_NAME, u1, true);
            restCreateResource("r_u1_" + i + "b", "x", CAT_NAME, u1, true);
        }

        int cnt = resourceDAO.count(new Search(Resource.class));
        assertEquals(RESNUM0 + RESNUM1, cnt);

        {
            SecurityContext sc = new SimpleSecurityContext(u0);
            String response = restExtJsService.getAllResources(sc, "*", 0, 10);

            System.out.println("JSON for u0 " + response);

            JSONResult result = parse(response);
            assertEquals(RESNUM0, result.total);
            assertEquals(10, result.returnedCount);
        }

        {
            SecurityContext sc = new SimpleSecurityContext(u1);
            String response = restExtJsService.getAllResources(sc, "*", 0, 10);

            System.out.println("JSON for u1 " + response);

            JSONResult result = parse(response);
            assertEquals(RESNUM1, result.total);
            assertEquals(10, result.returnedCount);
        }
        {
            SecurityContext sc = new SimpleSecurityContext(u0);
            String response =
                    restExtJsService.getResourcesByCategory(sc, CAT_NAME, "*", 0, 10, false, false);

            System.out.println("JSON for u0 " + response);

            JSONResult result = parse(response);
            assertEquals(RESNUM0, result.total);
            assertEquals(10, result.returnedCount);
        }

        {
            SecurityContext sc = new SimpleSecurityContext(u1);
            String response =
                    restExtJsService.getResourcesByCategory(sc, CAT_NAME, "*", 0, 10, false, false);

            System.out.println("JSON for u1 " + response);

            JSONResult result = parse(response);
            assertEquals(RESNUM1, result.total);
            assertEquals(10, result.returnedCount);
        }
    }

    @Test
    public void testGetAllResources_iLike() throws Exception {
        final String CAT0_NAME = "CAT000";
        final String CAT1_NAME = "CAT111";
        final String RES_NAME = "a MiXeD cAsE sTrInG";

        assertEquals(
                0,
                resourceService
                        .getAll(
                                ResourceSearchParameters.builder()
                                        .authUser(buildFakeAdminUser())
                                        .build())
                        .size());

        long u0 = restCreateUser("u0", Role.USER, null, "p0");

        createCategory(CAT0_NAME);
        createCategory(CAT1_NAME);

        restCreateResource(RES_NAME, "x", CAT0_NAME, u0, true);
        restCreateResource(RES_NAME.toLowerCase(), "x", CAT0_NAME, u0, true);
        restCreateResource(RES_NAME.toUpperCase(), "x", CAT0_NAME, u0, true);

        restCreateResource(RES_NAME + " in another category", "x", CAT1_NAME, u0, true);

        restCreateResource(
                "just an extra resource we shouldn't care about", "x", CAT0_NAME, u0, true);

        {
            SecurityContext sc = new SimpleSecurityContext(u0);
            String response = restExtJsService.getAllResources(sc, "*mIxEd*", 0, 1000);

            System.out.println("JSON " + response);

            JSONResult result = parse(response);
            assertEquals(4, result.total);
            assertEquals(4, result.returnedCount);
        }

        {
            SecurityContext sc = new SimpleSecurityContext(u0);
            String response =
                    restExtJsService.getResourcesByCategory(
                            sc, CAT0_NAME, "*mIxEd*", null, 0, 1000, false, false);

            System.out.println("JSON " + response);

            JSONResult result = parse(response);
            assertEquals(3, result.total);
            assertEquals(3, result.returnedCount);
        }
    }

    @Test
    public void testGetAllResources_editorUpdate() throws Exception {
        final String CAT0_NAME = "CAT000";
        final String RES_NAME = "a MiXeD cAsE sTrInG";

        assertEquals(
                0,
                resourceService
                        .getAll(
                                ResourceSearchParameters.builder()
                                        .authUser(buildFakeAdminUser())
                                        .build())
                        .size());

        long a0 = restCreateUser("a0", Role.ADMIN, new HashSet<>(), "p0");
        long u0 = restCreateUser("u0", Role.USER, new HashSet<>(), "p0");

        createCategory(CAT0_NAME);
        long r0Id = restCreateResource(RES_NAME, "x", CAT0_NAME, u0, true);

        {
            SecurityContext sc = new SimpleSecurityContext(u0);
            String response = restExtJsService.getAllResources(sc, "*mIxEd*", 0, 1000);

            System.out.println("JSON " + response);

            JSONResult result = parse(response);
            assertEquals(1, result.total);
            assertEquals(1, result.returnedCount);

            ShortResource resource = restExtJsService.getExtResource(sc, r0Id, false, false, false);
            assertEquals(RES_NAME, resource.getName());
            assertEquals("u0", resource.getCreator());
            assertNull(resource.getEditor());
        }

        {
            SecurityContext sc = new SimpleSecurityContext(a0);
            Resource realResource = resourceService.get(r0Id);
            realResource.setName("new name");
            restResourceService.update(sc, r0Id, createRESTResource(realResource));

            ShortResource resource = restExtJsService.getExtResource(sc, r0Id, false, false, false);
            assertEquals(realResource.getName(), resource.getName());
            assertEquals("u0", resource.getCreator());
            assertEquals("a0", resource.getEditor());
        }
    }

    @Test
    public void testGetAllResources_unadvertised() throws Exception {
        final String CAT0_NAME = "CAT000";
        final String CAT1_NAME = "CAT111";
        final String RES_NAME = "a MiXeD cAsE sTrInG";

        assertEquals(
                0,
                resourceService
                        .getAll(
                                ResourceSearchParameters.builder()
                                        .authUser(buildFakeAdminUser())
                                        .build())
                        .size());

        long g0Id = createGroup("g0");
        UserGroup g0 = new UserGroup();
        g0.setId(g0Id);
        g0.setGroupName("g0");
        Set<UserGroup> groups = new HashSet<>();
        groups.add(g0);

        long a0 = restCreateUser("a0", Role.ADMIN, groups, "p0");
        long u0 = restCreateUser("u0", Role.USER, groups, "p0");
        long u1 = restCreateUser("u1", Role.USER, groups, "p1");

        createCategory(CAT0_NAME);
        createCategory(CAT1_NAME);

        SecurityRule sr0 = new SecurityRule();
        sr0.setUser(userDAO.find(u0));
        sr0.setCanRead(true);
        sr0.setCanWrite(true);

        SecurityRule sr1 = new SecurityRule();
        sr1.setGroup(g0);
        sr1.setCanRead(true);
        sr1.setCanWrite(false);

        SecurityRuleList rules = new SecurityRuleList(Arrays.asList(sr0, sr1));

        restCreateResource(RES_NAME, "x", CAT0_NAME, u0, rules, true);
        restCreateResource(RES_NAME.toLowerCase(), "x", CAT0_NAME, u0, rules, false);
        restCreateResource(RES_NAME.toUpperCase(), "x", CAT0_NAME, u0, rules, true);

        restCreateResource(RES_NAME + " in another category", "x", CAT1_NAME, u0, rules, false);

        restCreateResource(
                "just an extra resource we shouldn't care about", "x", CAT0_NAME, u0, rules, true);

        {
            // ADMIN
            SecurityContext sc = new SimpleSecurityContext(a0);
            String response = restExtJsService.getAllResources(sc, "*mIxEd*", 0, 1000);

            System.out.println("JSON " + response);

            JSONResult result = parse(response);
            assertEquals(4, result.total);
            assertEquals(4, result.returnedCount);

            // OWNER
            sc = new SimpleSecurityContext(u0);
            response = restExtJsService.getAllResources(sc, "*mIxEd*", 0, 1000);

            System.out.println("JSON " + response);

            result = parse(response);
            assertEquals(4, result.total);
            assertEquals(4, result.returnedCount);

            // READER
            sc = new SimpleSecurityContext(u1);
            response = restExtJsService.getAllResources(sc, "*mIxEd*", 0, 1000);

            System.out.println("JSON " + response);

            result = parse(response);
            assertEquals(2, result.total);
            assertEquals(2, result.returnedCount);
        }

        {
            // OWNER
            SecurityContext sc = new SimpleSecurityContext(u0);
            String response =
                    restExtJsService.getResourcesByCategory(
                            sc, CAT0_NAME, "*mIxEd*", null, 0, 1000, false, false);

            System.out.println("JSON " + response);

            JSONResult result = parse(response);
            assertEquals(3, result.total);
            assertEquals(3, result.returnedCount);

            // READER
            sc = new SimpleSecurityContext(u1);
            response =
                    restExtJsService.getResourcesByCategory(
                            sc, CAT0_NAME, "*mIxEd*", null, 0, 1000, false, false);

            System.out.println("JSON " + response);

            result = parse(response);
            assertEquals(2, result.total);
            assertEquals(2, result.returnedCount);
        }
    }

    @Test
    public void testExtResourcesList_sorted() throws Exception {
        final String CAT0_NAME = "CAT000";
        final String RES_ATTRIBUTE_A = "A";
        final String RES_ATTRIBUTE_B = "B";
        final String RES_ATTRIBUTE_C = "C";

        assertEquals(
                0,
                resourceService
                        .getShortResources(
                                ResourceSearchParameters.builder()
                                        .authUser(buildFakeAdminUser())
                                        .build())
                        .size());

        long u0 = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext sc = new SimpleSecurityContext(u0);

        createCategory(CAT0_NAME);

        restCreateResource(RES_ATTRIBUTE_A, RES_ATTRIBUTE_A, CAT0_NAME, u0, true);
        sleep(10);
        restCreateResource(RES_ATTRIBUTE_B, RES_ATTRIBUTE_B, CAT0_NAME, u0, true);
        sleep(10);
        restCreateResource(RES_ATTRIBUTE_C, RES_ATTRIBUTE_C, CAT0_NAME, u0, true);

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc,
                            0,
                            100,
                            new Sort("description", "asc"),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());

            List<ExtResource> resources = response.getList();
            assertEquals(3, resources.size());
            List<String> resourcesDescriptions =
                    resources.stream().map(Resource::getDescription).toList();
            assertEquals(
                    List.of(RES_ATTRIBUTE_A, RES_ATTRIBUTE_B, RES_ATTRIBUTE_C),
                    resourcesDescriptions);
        }

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc,
                            0,
                            100,
                            new Sort("creation", "desc"),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());

            List<ExtResource> resources = response.getList();
            assertEquals(3, resources.size());
            List<Date> resourcesCreationDates =
                    resources.stream().map(Resource::getCreation).toList();
            assertTrue(resourcesCreationDates.get(0).after(resourcesCreationDates.get(1)));
            assertTrue(resourcesCreationDates.get(1).after(resourcesCreationDates.get(2)));
        }

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc,
                            0,
                            1000,
                            new Sort(null, null),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());

            List<ExtResource> resources = response.getList();
            assertEquals(3, resources.size());
            List<String> resourcesNames = resources.stream().map(Resource::getName).toList();
            assertEquals(
                    List.of(RES_ATTRIBUTE_A, RES_ATTRIBUTE_B, RES_ATTRIBUTE_C), resourcesNames);
        }

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc,
                            0,
                            1000,
                            new Sort("unknownfield", "desc"),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());

            assertNull(response);
        }
    }

    /**
     * With {@code includeData=false}, {@code StoredData} must never be loaded from the DB while
     * hydrating the resource list.
     */
    @Test
    public void testExtResourcesList_excludeData() throws Exception {
        final String CAT0_NAME = "CAT000";

        long u0 = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext sc = new SimpleSecurityContext(u0);

        createCategory(CAT0_NAME);

        int resourceCount = 5;
        for (int i = 0; i < resourceCount; i++) {
            RESTResource resource = new RESTResource();
            resource.setName("res_" + i);
            resource.setDescription("d");
            resource.setCategory(new RESTCategory(CAT0_NAME));
            resource.setAdvertised(true);
            resource.setData("stored data payload " + i);
            restResourceService.insert(sc, resource);
        }

        EntityManagerFactory emf =
                ctx.getBean("geostoreEntityManagerFactory", EntityManagerFactory.class);
        SessionFactory sessionFactory = emf.unwrap(SessionFactory.class);
        Statistics statistics = sessionFactory.getStatistics();
        statistics.setStatisticsEnabled(true);
        statistics.clear();

        ExtResourceList response =
                restExtJsService.getExtResourcesList(
                        sc,
                        0,
                        12,
                        new Sort("name", "asc"),
                        true,
                        false,
                        true,
                        false,
                        new AndFilter());

        assertEquals(resourceCount, response.getList().size());

        long storedDataLoadCount =
                statistics.getEntityStatistics(StoredData.class.getName()).getLoadCount();

        // With includeData=false, no StoredData should ever be loaded from the DB
        assertEquals(
                "Expected zero StoredData loads when includeData=false", 0, storedDataLoadCount);

        statistics.setStatisticsEnabled(false);
    }

    /**
     * {@code Resource.data} is a lazy proxy, so {@code includeData=true} has to force its
     * initialization while the session is still open, otherwise consumers hit {@code
     * LazyInitializationException: could not initialize proxy - no session} once the resource is
     * detached.
     */
    @Test
    public void testExtResourcesList_includeData() throws Exception {
        final String CAT0_NAME = "CAT001";

        long u0 = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext sc = new SimpleSecurityContext(u0);

        createCategory(CAT0_NAME);

        int resourceCount = 3;
        for (int i = 0; i < resourceCount; i++) {
            RESTResource resource = new RESTResource();
            resource.setName("resd_" + i);
            resource.setDescription("d");
            resource.setCategory(new RESTCategory(CAT0_NAME));
            resource.setAdvertised(true);
            resource.setData("payload_" + i);
            restResourceService.insert(sc, resource);
        }

        ExtResourceList response =
                restExtJsService.getExtResourcesList(
                        sc,
                        0,
                        12,
                        new Sort("name", "asc"),
                        false,
                        true,
                        false,
                        false,
                        new AndFilter());

        assertEquals(resourceCount, response.getList().size());
        for (ExtResource resource : response.getList()) {
            assertNotNull(
                    "Expected StoredData to be loaded when includeData=true", resource.getData());
            assertNotNull(resource.getData().getData());
        }
    }

    @Test
    public void testExtResourcesList_creatorFiltered() throws Exception {
        final String CAT0_NAME = "CAT000";
        final String CREATOR_A = "creatorA";
        final String CREATOR_B = "creatorB";

        long u0 = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext sc = new SimpleSecurityContext(u0);

        createCategory(CAT0_NAME);

        long resourceAId = restCreateResource("name_A", "description_A", CAT0_NAME, u0, true);
        long resourceBId = restCreateResource("name_B", "description_B", CAT0_NAME, u0, true);

        Resource resourceA = resourceService.get(resourceAId);
        resourceA.setCreator(CREATOR_A);
        resourceService.update(resourceA);

        Resource resourceB = resourceService.get(resourceBId);
        resourceB.setCreator(CREATOR_B);
        resourceService.update(resourceB);

        {
            FieldFilter editorFieldFilter =
                    new FieldFilter(BaseField.CREATOR, "creatorB", SearchOperator.EQUAL_TO);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc,
                            0,
                            100,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            editorFieldFilter);

            List<ExtResource> resources = response.getList();
            assertEquals(1, resources.size());
            ExtResource resource = resources.get(0);
            assertEquals(CREATOR_B, resource.getCreator());
        }

        {
            FieldFilter editorFieldFilter =
                    new FieldFilter(BaseField.CREATOR, "CREATOR_", SearchOperator.ILIKE);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc,
                            0,
                            100,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            editorFieldFilter);

            List<ExtResource> resources = response.getList();
            assertEquals(2, resources.size());
        }

        {
            FieldFilter editorFieldFilter =
                    new FieldFilter(BaseField.CREATOR, "unknown creator", SearchOperator.EQUAL_TO);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc,
                            0,
                            100,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            editorFieldFilter);

            assertTrue(response.isEmpty());
        }
    }

    @Test
    public void testExtResourcesList_editorFiltered() throws Exception {
        final String CAT0_NAME = "CAT000";
        final String EDITOR_A = "editorA";
        final String EDITOR_B = "editorB";

        long u0 = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext sc = new SimpleSecurityContext(u0);

        createCategory(CAT0_NAME);

        long resourceAId = restCreateResource("name_A", "description_A", CAT0_NAME, u0, true);
        long resourceBId = restCreateResource("name_B", "description_B", CAT0_NAME, u0, true);

        Resource resourceA = resourceService.get(resourceAId);
        resourceA.setEditor(EDITOR_A);
        resourceService.update(resourceA);

        Resource resourceB = resourceService.get(resourceBId);
        resourceB.setEditor(EDITOR_B);
        resourceService.update(resourceB);

        {
            FieldFilter editorFieldFilter =
                    new FieldFilter(BaseField.EDITOR, "editorA", SearchOperator.EQUAL_TO);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc,
                            0,
                            100,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            editorFieldFilter);

            List<ExtResource> resources = response.getList();
            assertEquals(1, resources.size());
            Resource resource = resources.get(0);
            assertEquals(EDITOR_A, resource.getEditor());
        }

        {
            FieldFilter editorFieldFilter =
                    new FieldFilter(BaseField.EDITOR, "EDITOR_", SearchOperator.ILIKE);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc,
                            0,
                            100,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            editorFieldFilter);

            List<ExtResource> resources = response.getList();
            assertEquals(2, resources.size());
        }

        {
            FieldFilter editorFieldFilter =
                    new FieldFilter(BaseField.CREATOR, "unknown editor", SearchOperator.EQUAL_TO);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc,
                            0,
                            100,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            editorFieldFilter);

            assertTrue(response.isEmpty());
        }
    }

    @Test
    public void testExtResourcesList_groupFiltered() throws Exception {
        final String CAT0_NAME = "CAT000";
        final String RESOURCE_A_NAME = "resourceA";
        final String RESOURCE_B_NAME = "resourceB";
        final String GROUP_A_NAME = "groupA";
        final String GROUP_B_NAME = "groupB";

        long user0Id = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext sc = new SimpleSecurityContext(user0Id);

        createCategory(CAT0_NAME);

        long resourceAId =
                restCreateResource(RESOURCE_A_NAME, "description_A", CAT0_NAME, user0Id, true);
        long resourceBId =
                restCreateResource(RESOURCE_B_NAME, "description_B", CAT0_NAME, user0Id, true);

        SecurityRule securityRuleGroupA = new SecurityRule();
        securityRuleGroupA.setGroup(userGroupService.get(createGroup(GROUP_A_NAME)));
        securityRuleGroupA.setCanWrite(true);

        List<SecurityRule> securityRulesResourceA = resourceService.getSecurityRules(resourceAId);
        securityRulesResourceA.add(securityRuleGroupA);
        restResourceService.updateSecurityRules(
                sc, resourceAId, new SecurityRuleList(securityRulesResourceA));

        SecurityRule securityRuleGroupB = new SecurityRule();
        securityRuleGroupB.setGroup(userGroupService.get(createGroup(GROUP_B_NAME)));
        securityRuleGroupB.setCanRead(true);

        List<SecurityRule> securityRulesResourceB = resourceService.getSecurityRules(resourceBId);
        securityRulesResourceB.add(securityRuleGroupB);
        restResourceService.updateSecurityRules(
                sc, resourceBId, new SecurityRuleList(securityRulesResourceB));

        {
            /* search for name equality of a single group */
            GroupFilter groupFilter = new GroupFilter("groupA", SearchOperator.EQUAL_TO);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc, 0, 100, new Sort("", ""), false, false, false, false, groupFilter);

            List<ExtResource> resources = response.getList();
            assertEquals(1, resources.size());
            Resource resource = resources.get(0);
            assertEquals(RESOURCE_A_NAME, resource.getName());
        }

        {
            /* search for name similarity (ignoring case) of multiple groups */
            GroupFilter groupFilter = new GroupFilter("GROUP_", SearchOperator.ILIKE);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc, 0, 100, new Sort("", ""), false, false, false, false, groupFilter);

            List<ExtResource> resources = response.getList();
            assertEquals(2, resources.size());
        }

        {
            /* search for name equality of multiple groups */
            GroupFilter groupFilter = new GroupFilter("groupA,groupB,groupC", SearchOperator.IN);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc, 0, 100, new Sort("", ""), false, false, false, false, groupFilter);

            List<ExtResource> resources = response.getList();
            assertEquals(2, resources.size());
        }

        {
            /* search for equality in empty group list */
            GroupFilter groupFilter = new GroupFilter("", SearchOperator.EQUAL_TO);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc, 0, 100, new Sort("", ""), false, false, false, false, groupFilter);
            assertTrue(response.getList().isEmpty());
        }

        {
            /* unknown group */
            GroupFilter groupFilter = new GroupFilter("unknown group", SearchOperator.EQUAL_TO);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc, 0, 100, new Sort("", ""), false, false, false, false, groupFilter);

            assertTrue(response.getList().isEmpty());
        }

        {
            /* invalid filter */
            assertThrows(
                    IllegalArgumentException.class, () -> new GroupFilter(null, SearchOperator.IN));
        }
    }

    @Test
    public void testExtResourcesList_filteredForGroupNameWithCommas() throws Exception {
        final String CAT0_NAME = "CAT000";
        final String RESOURCE_A_NAME = "resourceA";
        final String RESOURCE_B_NAME = "resourceB";
        final String GROUP_NAME_WITH_COMMAS = ",groupA,B,C,";
        final String OTHER_GROUP_NAME = "group";

        long user0Id = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext sc = new SimpleSecurityContext(user0Id);

        createCategory(CAT0_NAME);

        long resourceAId = restCreateResource(RESOURCE_A_NAME, "", CAT0_NAME, user0Id, true);
        long resourceBId = restCreateResource(RESOURCE_B_NAME, "", CAT0_NAME, user0Id, true);

        SecurityRule securityRuleGroupA = new SecurityRule();
        securityRuleGroupA.setGroup(userGroupService.get(createGroup(GROUP_NAME_WITH_COMMAS)));
        securityRuleGroupA.setCanWrite(true);

        List<SecurityRule> securityRulesResourceA = resourceService.getSecurityRules(resourceAId);
        securityRulesResourceA.add(securityRuleGroupA);
        restResourceService.updateSecurityRules(
                sc, resourceAId, new SecurityRuleList(securityRulesResourceA));

        SecurityRule securityRuleGroupB = new SecurityRule();
        securityRuleGroupB.setGroup(userGroupService.get(createGroup(OTHER_GROUP_NAME)));
        securityRuleGroupB.setCanRead(true);

        List<SecurityRule> securityRulesResourceB = resourceService.getSecurityRules(resourceBId);
        securityRulesResourceB.add(securityRuleGroupB);
        restResourceService.updateSecurityRules(
                sc, resourceBId, new SecurityRuleList(securityRulesResourceB));

        {
            /* search for name equality */
            GroupFilter groupFilter = new GroupFilter(",groupA,B,C,", SearchOperator.EQUAL_TO);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc, 0, 100, new Sort("", ""), false, false, false, false, groupFilter);

            List<ExtResource> resources = response.getList();
            assertEquals(1, resources.size());
            Resource resource = resources.get(0);
            assertEquals(RESOURCE_A_NAME, resource.getName());
        }

        {
            /* search for name similarity */
            GroupFilter groupFilter = new GroupFilter(",%,", SearchOperator.ILIKE);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc, 0, 100, new Sort("", ""), false, false, false, false, groupFilter);

            List<ExtResource> resources = response.getList();
            assertEquals(1, resources.size());
            Resource resource = resources.get(0);
            assertEquals(RESOURCE_A_NAME, resource.getName());
        }

        {
            /* search for name equality of multiple groups */
            GroupFilter groupFilter = new GroupFilter("group,\",groupA,B,C,\"", SearchOperator.IN);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc, 0, 100, new Sort("", ""), false, false, false, false, groupFilter);

            List<ExtResource> resources = response.getList();
            assertEquals(2, resources.size());
        }
    }

    @Test
    public void testExtResourcesList_tagFiltered() throws Exception {
        final String CAT0_NAME = "CAT000";
        final String RESOURCE_A_NAME = "resourceA";
        final String RESOURCE_B_NAME = "resourceB";
        final String TAG_A_NAME = "tagA";
        final String TAG_B_NAME = "tagB";

        long user0Id = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext sc = new SimpleSecurityContext(user0Id);

        long tagAId = tagService.insert(new Tag(TAG_A_NAME, "", null));
        long tagBId = tagService.insert(new Tag(TAG_B_NAME, "", null));

        createCategory(CAT0_NAME);

        long resourceAId =
                restCreateResource(RESOURCE_A_NAME, "description_A", CAT0_NAME, user0Id, true);
        long resourceBId =
                restCreateResource(RESOURCE_B_NAME, "description_B", CAT0_NAME, user0Id, true);

        tagService.addToResource(tagAId, resourceAId);
        tagService.addToResource(tagBId, resourceAId);

        tagService.addToResource(tagBId, resourceBId);

        {
            /* search for name equality of a single tag */
            TagFilter tagFilter = new TagFilter("tagA", SearchOperator.EQUAL_TO);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc, 0, 100, new Sort("", ""), false, false, false, false, tagFilter);

            List<ExtResource> resources = response.getList();
            assertEquals(1, resources.size());
            Resource resource = resources.get(0);
            assertEquals(RESOURCE_A_NAME, resource.getName());
        }

        {
            /* search for name similarity (ignoring case) of multiple tags */
            TagFilter tagFilter = new TagFilter("TAG_", SearchOperator.ILIKE);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc, 0, 100, new Sort("", ""), false, false, false, false, tagFilter);

            List<ExtResource> resources = response.getList();
            assertEquals(2, resources.size());
        }

        {
            /* search for name equality of multiple tags */
            TagFilter tagFilter = new TagFilter("tagA,tagB,TagC", SearchOperator.IN);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc, 0, 100, new Sort("", ""), false, false, false, false, tagFilter);

            List<ExtResource> resources = response.getList();
            assertEquals(2, resources.size());
        }

        {
            /* search for equality in empty tag list */
            TagFilter tagFilter = new TagFilter("", SearchOperator.EQUAL_TO);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc, 0, 100, new Sort("", ""), false, false, false, false, tagFilter);
            assertTrue(response.getList().isEmpty());
        }

        {
            /* unknown tag */
            TagFilter tagFilter = new TagFilter("unknown tag", SearchOperator.EQUAL_TO);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc, 0, 100, new Sort("", ""), false, false, false, false, tagFilter);

            assertTrue(response.getList().isEmpty());
        }

        {
            /* invalid filter */
            assertThrows(
                    IllegalArgumentException.class, () -> new TagFilter(null, SearchOperator.IN));
        }
    }

    @Test
    public void testExtResourcesList_filteredForTagNameWithCommas() throws Exception {
        final String CAT0_NAME = "CAT000";
        final String RESOURCE_A_NAME = "resourceA";
        final String RESOURCE_B_NAME = "resourceB";

        long user0Id = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext sc = new SimpleSecurityContext(user0Id);

        long tagWithCommas = tagService.insert(new Tag(",a,b,c,d,", "", null));
        long tag = tagService.insert(new Tag("tag", "", null));

        createCategory(CAT0_NAME);

        long resourceAId = restCreateResource(RESOURCE_A_NAME, "", CAT0_NAME, user0Id, true);
        long resourceBId = restCreateResource(RESOURCE_B_NAME, "", CAT0_NAME, user0Id, true);

        tagService.addToResource(tagWithCommas, resourceAId);
        tagService.addToResource(tag, resourceAId);

        tagService.addToResource(tag, resourceBId);

        {
            /* search for name equality */
            TagFilter tagFilter = new TagFilter(",a,b,c,d,", SearchOperator.EQUAL_TO);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc, 0, 100, new Sort("", ""), false, false, false, false, tagFilter);

            List<ExtResource> resources = response.getList();
            assertEquals(1, resources.size());
            Resource resource = resources.get(0);
            assertEquals(RESOURCE_A_NAME, resource.getName());
        }

        {
            /* search for name similarity */
            TagFilter tagFilter = new TagFilter(",%,", SearchOperator.ILIKE);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc, 0, 100, new Sort("", ""), false, false, false, false, tagFilter);

            List<ExtResource> resources = response.getList();
            assertEquals(1, resources.size());
            Resource resource = resources.get(0);
            assertEquals(RESOURCE_A_NAME, resource.getName());
        }

        {
            /* search for name equality of multiple tags */
            TagFilter tagFilter = new TagFilter("tag,\",a,b,c,d,\"", SearchOperator.IN);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc, 0, 100, new Sort("", ""), false, false, false, false, tagFilter);

            List<ExtResource> resources = response.getList();
            assertEquals(2, resources.size());
        }
    }

    @Test
    public void testExtResourcesList_timeAttributesFiltered() throws Exception {
        final String CAT0_NAME = "CAT000";

        long u0 = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext sc = new SimpleSecurityContext(u0);

        createCategory(CAT0_NAME);

        long resourceAId = restCreateResource("name_A", "", CAT0_NAME, u0, true);
        sleep(1000);
        long resourceBId = restCreateResource("name_B", "", CAT0_NAME, u0, true);

        Resource resourceA = resourceService.get(resourceAId);
        Resource resourceB = resourceService.get(resourceBId);
        resourceB.setDescription("posticipated");
        resourceService.update(resourceB);

        {
            FieldFilter ltDateFilter =
                    new FieldFilter(
                            BaseField.CREATION,
                            new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS")
                                    .format(resourceB.getCreation()),
                            SearchOperator.LESS_THAN);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc, 0, 100, new Sort("", ""), false, false, false, false, ltDateFilter);

            List<ExtResource> resources = response.getList();
            assertEquals(1, resources.size());
            Resource resource = resources.get(0);
            assertEquals(resourceAId, resource.getId().longValue());
        }

        {
            FieldFilter gteDateFilter =
                    new FieldFilter(
                            BaseField.CREATION,
                            new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")
                                    .format(resourceA.getCreation()),
                            SearchOperator.GREATER_THAN_OR_EQUAL_TO);
            FieldFilter lteDateFilter =
                    new FieldFilter(
                            BaseField.CREATION,
                            new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS")
                                    .format(resourceB.getLastUpdate()),
                            SearchOperator.LESS_THAN_OR_EQUAL_TO);
            AndFilter betweenDatesFieldFilter = new AndFilter(gteDateFilter, lteDateFilter);

            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc,
                            0,
                            100,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            betweenDatesFieldFilter);

            List<ExtResource> resources = response.getList();
            assertEquals(2, resources.size());
        }
    }

    @Test
    public void testExtResourcesList_userOwnedWithPermissionsInformation() throws Exception {
        final String CAT0_NAME = "CAT000";
        final String OWNED_RESOURCE_NAME = "ownedResource";
        final String READ_ONLY_RESOURCE_NAME = "readOnlyResource";

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        long userId = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext userSecurityContext = new SimpleSecurityContext(userId);

        createCategory(CAT0_NAME);

        /* admin owned resource */
        restCreateResource("adminResource", "", CAT0_NAME, adminId, false);

        /* user owned resource */
        restCreateResource(OWNED_RESOURCE_NAME, "", CAT0_NAME, userId, false);

        /* user owned resource - read only */
        long readOnlyResourceId =
                restCreateResource(READ_ONLY_RESOURCE_NAME, "", CAT0_NAME, userId, false);
        SecurityRule readOnlyRule = new SecurityRule();
        readOnlyRule.setUser(userService.get(userId));
        readOnlyRule.setCanRead(true);
        restResourceService.updateSecurityRules(
                adminSecurityContext,
                readOnlyResourceId,
                new SecurityRuleList(Collections.singletonList(readOnlyRule)));

        /* advertised resource */
        restCreateResource("advertisedResource", "", CAT0_NAME, adminId, true);

        /* resource without security rules */
        restCreateResource(
                "unruledResource",
                "",
                CAT0_NAME,
                adminId,
                new SecurityRuleList(Collections.emptyList()),
                false);

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            adminSecurityContext,
                            0,
                            1000,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());
            List<ExtResource> resources = response.getList();
            assertEquals(5, resources.size());
            assertTrue(
                    resources.stream()
                            .allMatch(r -> r.isCanEdit() && r.isCanDelete() && r.isCanCopy()));
        }

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            userSecurityContext,
                            0,
                            1000,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());
            List<ExtResource> resources = response.getList();
            assertEquals(2, resources.size());

            ExtResource ownerResource =
                    resources.stream()
                            .filter(r -> r.getName().equals(OWNED_RESOURCE_NAME))
                            .findFirst()
                            .orElseThrow();
            assertTrue(ownerResource.isCanEdit());
            assertTrue(ownerResource.isCanDelete());
            assertTrue(ownerResource.isCanCopy());

            ExtResource readOnlyResource =
                    resources.stream()
                            .filter(r -> r.getName().equals(READ_ONLY_RESOURCE_NAME))
                            .findFirst()
                            .orElseThrow();
            assertFalse(readOnlyResource.isCanEdit());
            assertFalse(readOnlyResource.isCanDelete());
            assertTrue(readOnlyResource.isCanCopy());
        }
    }

    @Test
    public void testExtResourcesList_groupOwnedResourceWithPermissionsInformation()
            throws Exception {
        final String CAT0_NAME = "CAT000";
        final String GROUP_RESOURCE_NAME = "advertisedGroupResource";
        final String READ_ONLY_RESOURCE_NAME = "readOnlyResource";

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        long groupId = createGroup("group");
        UserGroup group = userGroupService.get(groupId);

        long userId = restCreateUser("u0", Role.USER, Collections.singleton(group), "p0");
        SecurityContext userSecurityContext = new SimpleSecurityContext(userId);

        createCategory(CAT0_NAME);

        /* group owned resource - advertised */
        SecurityRule editorGroupRule = new SecurityRule();
        editorGroupRule.setGroup(group);
        editorGroupRule.setCanRead(true);
        editorGroupRule.setCanWrite(true);

        long advertisedGroupResourceId =
                restCreateResource(GROUP_RESOURCE_NAME, "", CAT0_NAME, adminId, true);
        List<SecurityRule> securityRulesAdvertisedGroupResource =
                resourceService.getSecurityRules(advertisedGroupResourceId);
        securityRulesAdvertisedGroupResource.add(editorGroupRule);
        restResourceService.updateSecurityRules(
                adminSecurityContext,
                advertisedGroupResourceId,
                new SecurityRuleList(securityRulesAdvertisedGroupResource));

        /* group owned resource - read only, advertised */
        SecurityRule readOnlyGroupRule = new SecurityRule();
        readOnlyGroupRule.setGroup(group);
        readOnlyGroupRule.setCanRead(true);

        long readOnlyGroupResourceId =
                restCreateResource(READ_ONLY_RESOURCE_NAME, "", CAT0_NAME, adminId, true);
        List<SecurityRule> securityRulesReadOnlyGroupResource =
                resourceService.getSecurityRules(readOnlyGroupResourceId);
        securityRulesReadOnlyGroupResource.add(readOnlyGroupRule);
        restResourceService.updateSecurityRules(
                adminSecurityContext,
                readOnlyGroupResourceId,
                new SecurityRuleList(securityRulesReadOnlyGroupResource));

        /* group owned resource - unadvertised */
        long unadvertisedGroupResourceId =
                restCreateResource("unadvertisedGroupResource", "", CAT0_NAME, adminId, false);
        List<SecurityRule> securityRulesUnadvertisedGroupResource =
                resourceService.getSecurityRules(unadvertisedGroupResourceId);
        securityRulesUnadvertisedGroupResource.add(readOnlyGroupRule);
        restResourceService.updateSecurityRules(
                adminSecurityContext,
                unadvertisedGroupResourceId,
                new SecurityRuleList(securityRulesUnadvertisedGroupResource));

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            adminSecurityContext,
                            0,
                            1000,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());
            List<ExtResource> resources = response.getList();
            assertEquals(3, resources.size());
            assertTrue(
                    resources.stream()
                            .allMatch(r -> r.isCanEdit() && r.isCanDelete() && r.isCanCopy()));
        }

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            userSecurityContext,
                            0,
                            1000,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());
            List<ExtResource> resources = response.getList();
            assertEquals(2, resources.size());

            ExtResource groupResource =
                    resources.stream()
                            .filter(r -> r.getName().equals(GROUP_RESOURCE_NAME))
                            .findFirst()
                            .orElseThrow();
            assertTrue(groupResource.isCanEdit());
            assertTrue(groupResource.isCanDelete());
            assertTrue(groupResource.isCanCopy());

            ExtResource readOnlyResource =
                    resources.stream()
                            .filter(r -> r.getName().equals(READ_ONLY_RESOURCE_NAME))
                            .findFirst()
                            .orElseThrow();
            assertFalse(readOnlyResource.isCanEdit());
            assertFalse(readOnlyResource.isCanDelete());
            assertTrue(readOnlyResource.isCanCopy());
        }
    }

    @Test
    public void testExtResourcesList_groupOwnedResourceWithLdapDirectPermissionInformation()
            throws Exception {
        final String CAT0_NAME = "CAT000";
        final String GROUP_RESOURCE_NAME = "advertisedGroupResource";
        final String READ_ONLY_RESOURCE_NAME = "readOnlyResource";

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        User ldapUser = new User();
        ldapUser.setId(-1L);
        ldapUser.setName("user");
        ldapUser.setRole(Role.USER);

        /* with LDAP direct, groups are created from user roles */
        String ldapGroupName = ldapUser.getRole().toString();

        createCategory(CAT0_NAME);
        SecurityContext userSecurityContext = new LdapSecurityContext(ldapUser);

        /* LDAP group owned resource - advertised */
        long advertisedGroupResourceId =
                restCreateResource(GROUP_RESOURCE_NAME, "", CAT0_NAME, adminId, true);

        SecurityRule editorGroupRule = new SecurityRule();
        editorGroupRule.setResource(resourceService.get(advertisedGroupResourceId));
        editorGroupRule.setGroupname(ldapGroupName);
        editorGroupRule.setCanRead(true);
        editorGroupRule.setCanWrite(true);

        securityDAO.persist(editorGroupRule);

        /* LDAP group owned resource - read only, advertised */
        long readOnlyGroupResourceId =
                restCreateResource(READ_ONLY_RESOURCE_NAME, "", CAT0_NAME, adminId, true);

        SecurityRule readOnlyGroupRule = new SecurityRule();
        readOnlyGroupRule.setResource(resourceService.get(readOnlyGroupResourceId));
        readOnlyGroupRule.setGroupname(ldapGroupName);
        readOnlyGroupRule.setCanRead(true);

        securityDAO.persist(readOnlyGroupRule);

        /* LDAP group owned resource - unadvertised */
        long unadvertisedGroupResourceId =
                restCreateResource("unadvertisedGroupResource", "", CAT0_NAME, adminId, false);

        SecurityRule unadvertisedGroupRule = new SecurityRule();
        unadvertisedGroupRule.setResource(resourceService.get(unadvertisedGroupResourceId));
        unadvertisedGroupRule.setGroupname(ldapGroupName);
        unadvertisedGroupRule.setCanRead(true);

        securityDAO.persist(unadvertisedGroupRule);

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            adminSecurityContext,
                            0,
                            1000,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());
            List<ExtResource> resources = response.getList();
            assertEquals(3, resources.size());
            assertTrue(
                    resources.stream()
                            .allMatch(r -> r.isCanEdit() && r.isCanDelete() && r.isCanCopy()));
        }

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            userSecurityContext,
                            0,
                            1000,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());
            List<ExtResource> resources = response.getList();
            assertEquals(2, resources.size());

            ExtResource groupResource =
                    resources.stream()
                            .filter(r -> r.getName().equals(GROUP_RESOURCE_NAME))
                            .findFirst()
                            .orElseThrow();
            assertTrue(groupResource.isCanEdit());
            assertTrue(groupResource.isCanDelete());
            assertTrue(groupResource.isCanCopy());

            ExtResource readOnlyResource =
                    resources.stream()
                            .filter(r -> r.getName().equals(READ_ONLY_RESOURCE_NAME))
                            .findFirst()
                            .orElseThrow();
            assertFalse(readOnlyResource.isCanEdit());
            assertFalse(readOnlyResource.isCanDelete());
            assertTrue(readOnlyResource.isCanCopy());
        }
    }

    @Test
    public void testExtResourcesList_withIPRangeRestriction() throws Exception {
        final String CAT0_NAME = "CAT000";

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        long userId = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext userSecurityContext = new SimpleSecurityContext(userId);

        createCategory(CAT0_NAME);

        mockHttpRequestIpAddressAttribute("127.0.0.128");

        /* visible resource */
        long visibleResourceId = restCreateResource("ownedResource", "", CAT0_NAME, adminId, false);

        SecurityRule inclusiveSecurityRule = new SecurityRule();
        inclusiveSecurityRule.setCanRead(true);
        inclusiveSecurityRule.setCanWrite(true);

        IPRange inclusiveIPRange = new IPRange();
        inclusiveIPRange.setCidr("127.0.0.0/24");
        ipRangeService.insert(inclusiveIPRange);

        inclusiveSecurityRule.setIpRanges(Set.of(inclusiveIPRange));

        restResourceService.updateSecurityRules(
                adminSecurityContext,
                visibleResourceId,
                new SecurityRuleList(List.of(inclusiveSecurityRule)));

        /* not visible resource */
        long notVisibleResourceId =
                restCreateResource("notVisibleResource", "", CAT0_NAME, adminId, false);

        SecurityRule exclusiveSecurityRule = new SecurityRule();
        exclusiveSecurityRule.setCanRead(true);

        IPRange exclusiveIPRange = new IPRange();
        exclusiveIPRange.setCidr("192.168.1.1/32");
        ipRangeService.insert(exclusiveIPRange);

        exclusiveSecurityRule.setIpRanges(Set.of(exclusiveIPRange));

        restResourceService.updateSecurityRules(
                adminSecurityContext,
                notVisibleResourceId,
                new SecurityRuleList(List.of(exclusiveSecurityRule)));

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            adminSecurityContext,
                            0,
                            1000,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());
            List<ExtResource> resources = response.getList();
            assertEquals(2, resources.size());
            assertTrue(
                    resources.stream()
                            .allMatch(r -> r.isCanEdit() && r.isCanDelete() && r.isCanCopy()));
        }

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            userSecurityContext,
                            0,
                            1000,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());
            List<ExtResource> resources = response.getList();
            assertEquals(1, resources.size());

            ExtResource visibleResource = resources.get(0);
            assertEquals(visibleResourceId, visibleResource.getId().longValue());
            assertTrue(visibleResource.isCanEdit());
            assertTrue(visibleResource.isCanDelete());
            assertTrue(visibleResource.isCanCopy());
        }
    }

    @Test
    public void testExtResourcesList_ownedResourcesWithIPRangeRestriction() throws Exception {
        final String CAT0_NAME = "CAT000";
        final String USER_OWNED_RESOURCE_NAME = "userOwnedResource";
        final String GROUP_OWNED_RESOURCE_NAME = "groupOwnedResource";

        long groupId = createGroup("group");
        UserGroup group = userGroupService.get(groupId);

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        long userId = restCreateUser("u0", Role.USER, Collections.singleton(group), "p0");
        SecurityContext userSecurityContext = new SimpleSecurityContext(userId);

        createCategory(CAT0_NAME);

        mockHttpRequestIpAddressAttribute("127.0.0.128");

        SecurityRule exclusiveSecurityRule = new SecurityRule();
        exclusiveSecurityRule.setCanRead(true);

        IPRange exclusiveIPRange = new IPRange();
        exclusiveIPRange.setCidr("192.168.1.1/32");
        ipRangeService.insert(exclusiveIPRange);

        exclusiveSecurityRule.setIpRanges(Set.of(exclusiveIPRange));

        /* user owned resource */
        long userOwnedResourceId =
                restCreateResource(USER_OWNED_RESOURCE_NAME, "", CAT0_NAME, adminId, false);

        SecurityRule userSecurityRule = new SecurityRule();
        userSecurityRule.setUser(userService.get(userId));
        userSecurityRule.setCanRead(true);
        userSecurityRule.setCanWrite(true);

        restResourceService.updateSecurityRules(
                adminSecurityContext,
                userOwnedResourceId,
                new SecurityRuleList(List.of(userSecurityRule, exclusiveSecurityRule)));

        /* group owned resource */
        long groupOwnedResourceId =
                restCreateResource(GROUP_OWNED_RESOURCE_NAME, "", CAT0_NAME, adminId, true);

        SecurityRule groupSecurityRule = new SecurityRule();
        groupSecurityRule.setGroup(group);
        groupSecurityRule.setCanRead(true);
        groupSecurityRule.setCanWrite(true);

        restResourceService.updateSecurityRules(
                adminSecurityContext,
                groupOwnedResourceId,
                new SecurityRuleList(List.of(groupSecurityRule, exclusiveSecurityRule)));

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            adminSecurityContext,
                            0,
                            1000,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());
            List<ExtResource> resources = response.getList();
            assertEquals(2, resources.size());
            assertTrue(
                    resources.stream()
                            .allMatch(r -> r.isCanEdit() && r.isCanDelete() && r.isCanCopy()));
        }

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            userSecurityContext,
                            0,
                            1000,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());
            List<ExtResource> resources = response.getList();
            assertEquals(2, resources.size());

            ExtResource userOwnedResource =
                    resources.stream()
                            .filter(r -> r.getName().equals(USER_OWNED_RESOURCE_NAME))
                            .findFirst()
                            .orElseThrow();
            assertTrue(userOwnedResource.isCanEdit());
            assertTrue(userOwnedResource.isCanDelete());
            assertTrue(userOwnedResource.isCanCopy());

            ExtResource groupOwnedResource =
                    resources.stream()
                            .filter(r -> r.getName().equals(GROUP_OWNED_RESOURCE_NAME))
                            .findFirst()
                            .orElseThrow();
            assertTrue(groupOwnedResource.isCanEdit());
            assertTrue(groupOwnedResource.isCanDelete());
            assertTrue(groupOwnedResource.isCanCopy());
        }
    }

    @Test
    public void testExtResourcesList_withTags() throws Exception {
        final String CAT0_NAME = "CAT000";
        Tag tagA = new Tag("tagA", "#4561aa", "dusky");
        Tag tagB = new Tag("tagB", "magenta", null);

        long userId = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext userSecurityContext = new SimpleSecurityContext(userId);

        createCategory(CAT0_NAME);

        long resourceId = restCreateResource("ownedResource", "", CAT0_NAME, userId, false);
        long tagAId = tagService.insert(tagA);
        long tagBId = tagService.insert(tagB);

        tagService.addToResource(tagAId, resourceId);
        tagService.addToResource(tagBId, resourceId);

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            userSecurityContext,
                            0,
                            1000,
                            new Sort("", ""),
                            false,
                            false,
                            true,
                            false,
                            new AndFilter());
            List<ExtResource> resources = response.getList();
            assertEquals(1, resources.size());
            ExtResource extResource = resources.get(0);
            Collection<Tag> tags = extResource.getTags();
            assertEquals(2, tags.size());
        }

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            userSecurityContext,
                            0,
                            1000,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());
            List<ExtResource> resources = response.getList();
            assertEquals(1, resources.size());
            ExtResource extResource = resources.get(0);
            assertNull(extResource.getTags());
        }
    }

    @Test
    public void testExtResourcesList_favoritesOnly() throws Exception {
        final String CAT0_NAME = "CAT000";

        long userId = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext sc = new SimpleSecurityContext(userId);

        createCategory(CAT0_NAME);

        long favoriteResourceId =
                restCreateResource("favourite_resource", "", CAT0_NAME, userId, true);
        restCreateResource("other_resource", "", CAT0_NAME, userId, true);

        favoriteService.addFavorite(userService.get(userId), favoriteResourceId);

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc,
                            0,
                            100,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            true,
                            new AndFilter());

            List<ExtResource> resources = response.getList();
            assertEquals(1, resources.size());
            ExtResource resource = resources.get(0);
            assertEquals(favoriteResourceId, resource.getId().longValue());
            assertEquals(1, response.getCount());
        }

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc,
                            0,
                            100,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());

            List<ExtResource> resources = response.getList();
            assertEquals(2, resources.size());
            assertEquals(2, response.getCount());
        }
    }

    @Test
    public void testExtResourcesList_withFavoriteInformation() throws Exception {
        final String CAT0_NAME = "CAT000";

        long userId = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext sc = new SimpleSecurityContext(userId);

        createCategory(CAT0_NAME);

        long favoriteResourceId =
                restCreateResource("favourite_resource", "", CAT0_NAME, userId, true);
        long nonFavoriteResourceId =
                restCreateResource("other_resource", "", CAT0_NAME, userId, true);

        favoriteService.addFavorite(userService.get(userId), favoriteResourceId);

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            sc,
                            0,
                            100,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());

            List<ExtResource> resources = response.getList();
            ExtResource favoriteResource =
                    resources.stream()
                            .filter(r -> r.getId().equals(favoriteResourceId))
                            .findFirst()
                            .orElseThrow();
            assertTrue(favoriteResource.isFavorite());
            ExtResource nonFavoriteResource =
                    resources.stream()
                            .filter(r -> r.getId().equals(nonFavoriteResourceId))
                            .findFirst()
                            .orElseThrow();
            assertFalse(nonFavoriteResource.isFavorite());
        }
    }

    @Test
    public void testExtResourcesList_canCopyWhenGuest() throws Exception {
        final String CAT0_NAME = "CAT000";

        long groupId = createGroup("group");
        UserGroup group = userGroupService.get(groupId);

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        long userId = restCreateUser("_guest", Role.GUEST, Collections.singleton(group), "guest");
        SecurityContext guestSecurityContext = new SimpleSecurityContext(userId);

        createCategory(CAT0_NAME);

        long resourceId = restCreateResource("everyone_resource", "", CAT0_NAME, adminId, true);

        SecurityRule everyoneGroupSecurityRule = new SecurityRule();
        everyoneGroupSecurityRule.setCanRead(true);
        everyoneGroupSecurityRule.setCanWrite(true);
        everyoneGroupSecurityRule.setGroup(group);
        restResourceService.updateSecurityRules(
                adminSecurityContext,
                resourceId,
                new SecurityRuleList(Collections.singletonList(everyoneGroupSecurityRule)));

        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            adminSecurityContext,
                            0,
                            100,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());

            List<ExtResource> resources = response.getList();
            assertEquals(1, resources.size());
            ExtResource resource = resources.get(0);
            assertTrue(resource.isCanCopy());
        }
        {
            ExtResourceList response =
                    restExtJsService.getExtResourcesList(
                            guestSecurityContext,
                            0,
                            100,
                            new Sort("", ""),
                            false,
                            false,
                            false,
                            false,
                            new AndFilter());

            List<ExtResource> resources = response.getList();
            assertEquals(1, resources.size());
            ExtResource resource = resources.get(0);
            assertFalse(resource.isCanCopy());
        }
    }

    @Test
    public void testGetExtResource_withoutSecurityInformation() throws Exception {
        final String CAT0_NAME = "CAT000";

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        long userId = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext userSecurityContext = new SimpleSecurityContext(userId);

        createCategory(CAT0_NAME);

        /* resource without security rules */
        long noRulesResource = restCreateResource("noRulesResource", "", CAT0_NAME, userId, false);

        restResourceService.updateSecurityRules(
                adminSecurityContext, noRulesResource, new SecurityRuleList(List.of()));

        /* resource with an empty security rule */
        long emptyRuleResource =
                restCreateResource("emptyRuleResource", "", CAT0_NAME, userId, false);

        SecurityRule emptyRule = new SecurityRule();
        emptyRule.setCanRead(true);
        emptyRule.setCanWrite(true);

        restResourceService.updateSecurityRules(
                adminSecurityContext,
                emptyRuleResource,
                new SecurityRuleList(Collections.singletonList(emptyRule)));

        {
            assertThrows(
                    ForbiddenErrorWebEx.class,
                    () ->
                            restExtJsService.getExtResource(
                                    userSecurityContext, noRulesResource, true, true, false));
        }

        {
            assertThrows(
                    ForbiddenErrorWebEx.class,
                    () ->
                            restExtJsService.getExtResource(
                                    userSecurityContext, emptyRuleResource, true, true, false));
        }
    }

    @Test
    public void testGetExtResource_userOwnedWithAttributesInformation() throws Exception {
        final String CAT0_NAME = "CAT000";

        ShortAttribute attributeA = new ShortAttribute("attributeA", "ABC", DataType.STRING);
        ShortAttribute attributeB = new ShortAttribute("attributeB", "123.0", DataType.NUMBER);

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        long userId = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext user0SecurityContext = new SimpleSecurityContext(userId);

        createCategory(CAT0_NAME);

        /* user owned resource */
        long userOwnedResourceId =
                restCreateResource("ownedResource", "", CAT0_NAME, userId, false);
        restResourceService.updateAttribute(
                adminSecurityContext,
                userOwnedResourceId,
                attributeA.getName(),
                attributeA.getValue(),
                attributeA.getType());

        /* user owned resource - read only */
        long readOnlyResourceId =
                restCreateResource("readOnlyResource", "", CAT0_NAME, userId, false);
        SecurityRule readOnlyRule = new SecurityRule();
        readOnlyRule.setUser(userService.get(userId));
        readOnlyRule.setCanRead(true);
        restResourceService.updateSecurityRules(
                adminSecurityContext,
                readOnlyResourceId,
                new SecurityRuleList(Collections.singletonList(readOnlyRule)));
        restResourceService.updateAttribute(
                adminSecurityContext,
                readOnlyResourceId,
                attributeB.getName(),
                attributeB.getValue(),
                attributeB.getType());

        /* user owned resource - no attributes */
        long noAttributesResourceId =
                restCreateResource("noAttributesResource", "", CAT0_NAME, userId, false);

        /* user owned resource - protected */
        long protectedResourceId =
                restCreateResource("protectedResource", "", CAT0_NAME, userId, false);
        SecurityRule protectedRule = new SecurityRule();
        protectedRule.setUser(userService.get(userId));
        restResourceService.updateSecurityRules(
                adminSecurityContext,
                protectedResourceId,
                new SecurityRuleList(Collections.singletonList(protectedRule)));

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            adminSecurityContext, userOwnedResourceId, true, true, false);
            assertTrue(response.isCanEdit());
            assertTrue(response.isCanDelete());
            assertTrue(response.isCanCopy());
            List<ShortAttribute> attributes = response.getAttributeList().getList();
            assertEquals(1, attributes.size());
            ShortAttribute attribute = attributes.get(0);
            assertEquals(attributeA.getName(), attribute.getName());
            assertEquals(attributeA.getValue(), attribute.getValue());
            assertEquals(attributeA.getType(), attribute.getType());
        }

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            adminSecurityContext, userOwnedResourceId, false, false, false);
            List<ShortAttribute> attributes = response.getAttributeList().getList();
            assertNull(attributes);
        }

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            user0SecurityContext, userOwnedResourceId, true, true, false);
            assertTrue(response.isCanEdit());
            assertTrue(response.isCanDelete());
            assertTrue(response.isCanCopy());
            List<ShortAttribute> attributes = response.getAttributeList().getList();
            assertEquals(1, attributes.size());
            ShortAttribute attribute = attributes.get(0);
            assertEquals(attributeA.getName(), attribute.getName());
            assertEquals(attributeA.getValue(), attribute.getValue());
            assertEquals(attributeA.getType(), attribute.getType());
        }

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            user0SecurityContext, readOnlyResourceId, true, true, false);
            assertFalse(response.isCanEdit());
            assertFalse(response.isCanDelete());
            assertTrue(response.isCanCopy());
            List<ShortAttribute> attributes = response.getAttributeList().getList();
            assertEquals(1, attributes.size());
            ShortAttribute attribute = attributes.get(0);
            assertEquals(attributeB.getName(), attribute.getName());
            assertEquals(attributeB.getValue(), attribute.getValue());
            assertEquals(attributeB.getType(), attribute.getType());
        }

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            user0SecurityContext, noAttributesResourceId, true, true, false);
            List<ShortAttribute> attributes = response.getAttributeList().getList();
            assertTrue(attributes.isEmpty());
        }

        {
            assertThrows(
                    ForbiddenErrorWebEx.class,
                    () ->
                            restExtJsService.getExtResource(
                                    user0SecurityContext, protectedResourceId, true, true, false));
        }

        {
            assertThrows(
                    NotFoundWebEx.class,
                    () ->
                            restExtJsService.getExtResource(
                                    user0SecurityContext, Long.MAX_VALUE, true, true, false));
        }
    }

    @Test
    public void testGetExtResource_groupOwnedWithAttributesInformation() throws Exception {
        final String CAT0_NAME = "CAT000";

        ShortAttribute attributeA = new ShortAttribute("attributeA", "ABC", DataType.STRING);
        ShortAttribute attributeB =
                new ShortAttribute("attributeB", "2024-08-31 16:22:45.654", DataType.DATE);

        long groupId = createGroup("group");
        UserGroup group = userGroupService.get(groupId);

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        long userId = restCreateUser("u0", Role.USER, Collections.singleton(group), "p0");
        SecurityContext user0SecurityContext = new SimpleSecurityContext(userId);

        createCategory(CAT0_NAME);

        /* group owned resource */
        SecurityRule ownerGroupRule = new SecurityRule();
        ownerGroupRule.setGroup(group);
        ownerGroupRule.setCanRead(true);
        ownerGroupRule.setCanWrite(true);

        long groupOwnedResourceId =
                restCreateResource("ownedResource", "", CAT0_NAME, adminId, false);
        List<SecurityRule> securityRulesGroupOwnedResource =
                resourceService.getSecurityRules(groupOwnedResourceId);
        securityRulesGroupOwnedResource.add(ownerGroupRule);
        restResourceService.updateSecurityRules(
                adminSecurityContext,
                groupOwnedResourceId,
                new SecurityRuleList(securityRulesGroupOwnedResource));
        restResourceService.updateAttribute(
                adminSecurityContext,
                groupOwnedResourceId,
                attributeA.getName(),
                attributeA.getValue(),
                attributeA.getType());

        /* group owned resource - read only */
        SecurityRule readOnlyGroupRule = new SecurityRule();
        readOnlyGroupRule.setGroup(group);
        readOnlyGroupRule.setCanRead(true);

        long readOnlyGroupResourceId =
                restCreateResource("readOnlyResource", "", CAT0_NAME, adminId, false);
        List<SecurityRule> securityRulesReadOnlyGroupResource =
                resourceService.getSecurityRules(readOnlyGroupResourceId);
        securityRulesReadOnlyGroupResource.add(readOnlyGroupRule);
        restResourceService.updateSecurityRules(
                adminSecurityContext,
                readOnlyGroupResourceId,
                new SecurityRuleList(securityRulesReadOnlyGroupResource));
        restResourceService.updateAttribute(
                adminSecurityContext,
                readOnlyGroupResourceId,
                attributeB.getName(),
                attributeB.getValue(),
                attributeB.getType());

        /* group owned resource - protected */
        SecurityRule protectedRule = new SecurityRule();
        protectedRule.setGroup(group);

        long protectedGroupResourceId =
                restCreateResource("protectedResource", "", CAT0_NAME, adminId, false);
        restResourceService.updateSecurityRules(
                adminSecurityContext,
                protectedGroupResourceId,
                new SecurityRuleList(Collections.singletonList(protectedRule)));

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            adminSecurityContext, groupOwnedResourceId, true, true, false);
            List<ShortAttribute> attributes = response.getAttributeList().getList();
            assertEquals(1, attributes.size());
            ShortAttribute attribute = attributes.get(0);
            assertEquals(attributeA.getName(), attribute.getName());
            assertEquals(attributeA.getValue(), attribute.getValue());
            assertEquals(attributeA.getType(), attribute.getType());
        }

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            user0SecurityContext, groupOwnedResourceId, true, true, false);
            List<ShortAttribute> attributes = response.getAttributeList().getList();
            assertEquals(1, attributes.size());
            ShortAttribute attribute = attributes.get(0);
            assertEquals(attributeA.getName(), attribute.getName());
            assertEquals(attributeA.getValue(), attribute.getValue());
            assertEquals(attributeA.getType(), attribute.getType());
        }

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            user0SecurityContext, readOnlyGroupResourceId, true, true, false);
            assertFalse(response.isCanEdit());
            assertFalse(response.isCanDelete());
            List<ShortAttribute> attributes = response.getAttributeList().getList();
            assertEquals(1, attributes.size());
            ShortAttribute attribute = attributes.get(0);
            assertEquals(attributeB.getName(), attribute.getName());
            assertTrue(attribute.getValue().matches("2024-08-31T16:22:45.654\\+\\d+"));
            assertEquals(attributeB.getType(), attribute.getType());
        }

        {
            assertThrows(
                    ForbiddenErrorWebEx.class,
                    () ->
                            restExtJsService.getExtResource(
                                    user0SecurityContext,
                                    protectedGroupResourceId,
                                    true,
                                    true,
                                    false));
        }
    }

    @Test
    public void testGetExtResource_userOwnedWithPermissionsInformation() throws Exception {
        final String CAT0_NAME = "CAT000";

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        long userId = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext user0SecurityContext = new SimpleSecurityContext(userId);

        createCategory(CAT0_NAME);

        /* empty permissions resource */
        long noPermissionsResourceId =
                restCreateResource("noPermissionsResource", "", CAT0_NAME, adminId, false);
        restResourceService.updateSecurityRules(
                adminSecurityContext,
                noPermissionsResourceId,
                new SecurityRuleList(Collections.emptyList()));

        /* user owned resource */
        long userOwnedResourceId =
                restCreateResource("ownedResource", "", CAT0_NAME, userId, false);

        /* user owned resource - read only */
        long readOnlyResourceId =
                restCreateResource("readOnlyResource", "", CAT0_NAME, userId, false);
        SecurityRule readOnlyRule = new SecurityRule();
        readOnlyRule.setUser(userService.get(userId));
        readOnlyRule.setCanRead(true);
        restResourceService.updateSecurityRules(
                adminSecurityContext,
                readOnlyResourceId,
                new SecurityRuleList(Collections.singletonList(readOnlyRule)));

        /* user owned resource - protected */
        long protectedResourceId =
                restCreateResource("protectedResource", "", CAT0_NAME, userId, false);
        SecurityRule protectedRule = new SecurityRule();
        protectedRule.setUser(userService.get(userId));
        restResourceService.updateSecurityRules(
                adminSecurityContext,
                protectedResourceId,
                new SecurityRuleList(Collections.singletonList(protectedRule)));

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            adminSecurityContext, noPermissionsResourceId, true, true, false);
            List<RESTSecurityRule> securityRules = response.getSecurityRuleList().getList();
            assertTrue(securityRules.isEmpty());
        }

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            adminSecurityContext, userOwnedResourceId, true, true, false);
            assertTrue(response.isCanEdit());
            assertTrue(response.isCanDelete());
            List<RESTSecurityRule> securityRules = response.getSecurityRuleList().getList();
            assertEquals(1, securityRules.size());
        }

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            adminSecurityContext, userOwnedResourceId, false, false, false);
            List<RESTSecurityRule> securityRules = response.getSecurityRuleList().getList();
            assertNull(securityRules);
        }

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            user0SecurityContext, userOwnedResourceId, true, true, false);
            assertTrue(response.isCanEdit());
            assertTrue(response.isCanDelete());
            assertTrue(response.isCanCopy());
            List<RESTSecurityRule> securityRules = response.getSecurityRuleList().getList();
            assertEquals(1, securityRules.size());
            RESTSecurityRule securityRule = securityRules.get(0);
            assertEquals(userId, securityRule.getUser().getId().longValue());
            assertTrue(securityRule.isCanRead());
            assertTrue(securityRule.isCanWrite());
        }

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            user0SecurityContext, readOnlyResourceId, true, true, false);
            assertFalse(response.isCanEdit());
            assertFalse(response.isCanDelete());
            assertTrue(response.isCanCopy());
            List<RESTSecurityRule> securityRules = response.getSecurityRuleList().getList();
            assertEquals(1, securityRules.size());
            RESTSecurityRule securityRule = securityRules.get(0);
            assertEquals(userId, securityRule.getUser().getId().longValue());
            assertTrue(securityRule.isCanRead());
            assertFalse(securityRule.isCanWrite());
        }

        {
            assertThrows(
                    ForbiddenErrorWebEx.class,
                    () ->
                            restExtJsService.getExtResource(
                                    user0SecurityContext, protectedResourceId, true, true, false));
        }

        {
            assertThrows(
                    NotFoundWebEx.class,
                    () ->
                            restExtJsService.getExtResource(
                                    user0SecurityContext, Long.MAX_VALUE, true, true, false));
        }
    }

    @Test
    public void testGetExtResource_groupOwnedWithPermissionsInformation() throws Exception {
        final String CAT0_NAME = "CAT000";

        long groupId = createGroup("group");
        UserGroup group = userGroupService.get(groupId);

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        long userId = restCreateUser("u0", Role.USER, Collections.singleton(group), "p0");
        SecurityContext userSecurityContext = new SimpleSecurityContext(userId);

        createCategory(CAT0_NAME);

        /* group owned resource */
        SecurityRule ownerGroupRule = new SecurityRule();
        ownerGroupRule.setGroup(group);
        ownerGroupRule.setCanRead(true);
        ownerGroupRule.setCanWrite(true);

        long groupOwnedResourceId =
                restCreateResource("ownedResource", "", CAT0_NAME, adminId, false);
        restResourceService.updateSecurityRules(
                adminSecurityContext,
                groupOwnedResourceId,
                new SecurityRuleList(Collections.singletonList(ownerGroupRule)));

        /* group owned resource - read only */
        SecurityRule readOnlyGroupRule = new SecurityRule();
        readOnlyGroupRule.setGroup(group);
        readOnlyGroupRule.setCanRead(true);

        long readOnlyGroupResourceId =
                restCreateResource("readOnlyResource", "", CAT0_NAME, adminId, false);
        restResourceService.updateSecurityRules(
                adminSecurityContext,
                readOnlyGroupResourceId,
                new SecurityRuleList(Collections.singletonList(readOnlyGroupRule)));

        /* group owned resource - protected */
        SecurityRule protectedRule = new SecurityRule();
        protectedRule.setGroup(group);

        long protectedGroupResourceId =
                restCreateResource("protectedResource", "", CAT0_NAME, adminId, false);
        restResourceService.updateSecurityRules(
                adminSecurityContext,
                protectedGroupResourceId,
                new SecurityRuleList(Collections.singletonList(protectedRule)));

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            adminSecurityContext, groupOwnedResourceId, true, true, false);
            assertTrue(response.isCanEdit());
            assertTrue(response.isCanDelete());
            assertTrue(response.isCanCopy());
            List<RESTSecurityRule> securityRules = response.getSecurityRuleList().getList();
            assertEquals(1, securityRules.size());
        }

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            userSecurityContext, groupOwnedResourceId, true, true, false);
            assertTrue(response.isCanEdit());
            assertTrue(response.isCanDelete());
            assertTrue(response.isCanCopy());
            List<RESTSecurityRule> securityRules = response.getSecurityRuleList().getList();
            assertEquals(1, securityRules.size());
            RESTSecurityRule securityRule = securityRules.get(0);
            assertEquals(groupId, securityRule.getGroup().getId().longValue());
            assertTrue(securityRule.isCanRead());
            assertTrue(securityRule.isCanWrite());
        }

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            userSecurityContext, readOnlyGroupResourceId, true, true, false);
            assertFalse(response.isCanEdit());
            assertFalse(response.isCanDelete());
            assertTrue(response.isCanCopy());
            List<RESTSecurityRule> securityRules = response.getSecurityRuleList().getList();
            assertEquals(1, securityRules.size());
            RESTSecurityRule securityRule = securityRules.get(0);
            assertEquals(groupId, securityRule.getGroup().getId().longValue());
            assertTrue(securityRule.isCanRead());
            assertFalse(securityRule.isCanWrite());
        }

        {
            assertThrows(
                    ForbiddenErrorWebEx.class,
                    () ->
                            restExtJsService.getExtResource(
                                    userSecurityContext,
                                    protectedGroupResourceId,
                                    true,
                                    true,
                                    false));
        }
    }

    @Test
    public void testGetExtResource_withIPRangeRestriction() throws Exception {
        final String CAT0_NAME = "CAT000";

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        long userId = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext userSecurityContext = new SimpleSecurityContext(userId);

        createCategory(CAT0_NAME);

        mockHttpRequestIpAddressAttribute("152.124.12.10");

        /* accessible resource */
        long accessibleResourceId = restCreateResource("accessible", "", CAT0_NAME, adminId, false);

        SecurityRule inclusiveSecurityRule = new SecurityRule();
        inclusiveSecurityRule.setCanRead(true);
        inclusiveSecurityRule.setCanWrite(true);

        IPRange inclusiveIPRange = new IPRange();
        inclusiveIPRange.setCidr("152.124.12.0/24");
        ipRangeService.insert(inclusiveIPRange);
        inclusiveSecurityRule.setIpRanges(Set.of(inclusiveIPRange));

        restResourceService.updateSecurityRules(
                adminSecurityContext,
                accessibleResourceId,
                new SecurityRuleList(List.of(inclusiveSecurityRule)));

        /* not accessible resource */
        long inaccessibleResourceId =
                restCreateResource("inaccessible", "", CAT0_NAME, userId, false);

        SecurityRule exclusiveSecurityRule = new SecurityRule();

        IPRange exclusiveIPRange = new IPRange();
        exclusiveIPRange.setCidr("192.168.1.1/32");
        ipRangeService.insert(exclusiveIPRange);
        exclusiveSecurityRule.setIpRanges(Set.of(exclusiveIPRange));

        restResourceService.updateSecurityRules(
                adminSecurityContext,
                inaccessibleResourceId,
                new SecurityRuleList(Collections.singletonList(exclusiveSecurityRule)));

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            userSecurityContext, accessibleResourceId, true, true, false);

            assertTrue(response.isCanEdit());
            assertTrue(response.isCanDelete());
            assertTrue(response.isCanCopy());
        }

        {
            assertThrows(
                    ForbiddenErrorWebEx.class,
                    () ->
                            restExtJsService.getExtResource(
                                    userSecurityContext,
                                    inaccessibleResourceId,
                                    true,
                                    true,
                                    false));
        }
    }

    @Test
    public void testGetExtResource_ipRangeRestrictionBehindProxy() throws Exception {
        final String CAT0_NAME = "CAT000";

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        long userId = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext userSecurityContext = new SimpleSecurityContext(userId);

        createCategory(CAT0_NAME);

        mockHttpRequestIpAddressAttribute("localhost", "12.12.12.12");

        /* accessible resource */
        long accessibleResourceId = restCreateResource("accessible", "", CAT0_NAME, userId, false);

        SecurityRule inclusiveSecurityRule = new SecurityRule();
        inclusiveSecurityRule.setCanRead(true);
        inclusiveSecurityRule.setCanWrite(true);

        IPRange inclusiveIPRange = new IPRange();
        inclusiveIPRange.setCidr("12.0.0.0/8");
        ipRangeService.insert(inclusiveIPRange);
        inclusiveSecurityRule.setIpRanges(Set.of(inclusiveIPRange));

        restResourceService.updateSecurityRules(
                adminSecurityContext,
                accessibleResourceId,
                new SecurityRuleList(List.of(inclusiveSecurityRule)));

        /* not accessible resource */
        long inaccessibleResourceId =
                restCreateResource("inaccessible", "", CAT0_NAME, userId, false);

        SecurityRule exclusiveSecurityRule = new SecurityRule();
        exclusiveSecurityRule.setCanRead(true);
        exclusiveSecurityRule.setCanWrite(true);

        IPRange exclusiveIPRange = new IPRange();
        exclusiveIPRange.setCidr("192.168.1.1/32");
        ipRangeService.insert(exclusiveIPRange);
        exclusiveSecurityRule.setIpRanges(Set.of(exclusiveIPRange));

        restResourceService.updateSecurityRules(
                adminSecurityContext,
                inaccessibleResourceId,
                new SecurityRuleList(Collections.singletonList(exclusiveSecurityRule)));

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            userSecurityContext, accessibleResourceId, true, true, false);

            assertTrue(response.isCanEdit());
            assertTrue(response.isCanDelete());
            assertTrue(response.isCanCopy());
        }

        {
            assertThrows(
                    ForbiddenErrorWebEx.class,
                    () ->
                            restExtJsService.getExtResource(
                                    userSecurityContext,
                                    inaccessibleResourceId,
                                    true,
                                    true,
                                    false));
        }
    }

    @Test
    public void testGetExtResource_withTags() throws Exception {
        final String CAT0_NAME = "CAT000";
        Tag tagA = new Tag("tagA", "#4561aa", "dusky");
        Tag tagB = new Tag("tagB", "magenta", null);

        long userId = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext userSecurityContext = new SimpleSecurityContext(userId);

        createCategory(CAT0_NAME);

        long resourceId = restCreateResource("ownedResource", "", CAT0_NAME, userId, false);
        long tagAId = tagService.insert(tagA);
        long tagBId = tagService.insert(tagB);

        tagService.addToResource(tagAId, resourceId);
        tagService.addToResource(tagBId, resourceId);

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            userSecurityContext, resourceId, false, false, true);
            Collection<Tag> tags = response.getTagList().getList();
            assertEquals(2, tags.size());
        }

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            userSecurityContext, resourceId, false, false, false);
            assertNull(response.getTagList().getList());
        }
    }

    @Test
    public void testGetExtResource_withFavoriteInformation() throws Exception {
        final String CAT0_NAME = "CAT000";

        long userId = restCreateUser("u0", Role.USER, null, "p0");
        SecurityContext userSecurityContext = new SimpleSecurityContext(userId);

        createCategory(CAT0_NAME);

        long favoriteResourceId =
                restCreateResource("favourite_resource", "", CAT0_NAME, userId, true);
        long nonFavoriteResourceId =
                restCreateResource("other_resource", "", CAT0_NAME, userId, true);

        favoriteService.addFavorite(userService.get(userId), favoriteResourceId);

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            userSecurityContext, favoriteResourceId, false, false, true);
            assertTrue(response.isFavorite());
        }

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            userSecurityContext, nonFavoriteResourceId, false, false, true);
            assertFalse(response.isFavorite());
        }
    }

    @Test
    public void testGetExtResource_canCopyWhenGuest() throws Exception {
        final String CAT0_NAME = "CAT000";

        long groupId = createGroup("group");
        UserGroup group = userGroupService.get(groupId);

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        long userId = restCreateUser("_guest", Role.GUEST, Collections.singleton(group), "guest");
        SecurityContext guestSecurityContext = new SimpleSecurityContext(userId);

        createCategory(CAT0_NAME);

        long resourceId = restCreateResource("everyone_resource", "", CAT0_NAME, adminId, true);

        SecurityRule everyoneGroupSecurityRule = new SecurityRule();
        everyoneGroupSecurityRule.setCanRead(true);
        everyoneGroupSecurityRule.setCanWrite(true);
        everyoneGroupSecurityRule.setGroup(group);
        restResourceService.updateSecurityRules(
                adminSecurityContext,
                resourceId,
                new SecurityRuleList(Collections.singletonList(everyoneGroupSecurityRule)));

        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            adminSecurityContext, resourceId, false, false, true);
            assertTrue(response.isCanCopy());
        }
        {
            ExtShortResource response =
                    restExtJsService.getExtResource(
                            guestSecurityContext, resourceId, false, false, true);
            assertFalse(response.isCanCopy());
        }
    }

    @Test
    public void testGetGroupsList() throws Exception {
        final String groupAName = "groupA";

        long groupAId = createGroup(groupAName);
        UserGroup groupA = userGroupService.get(groupAId);

        createGroup("groupB");

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        long userId = restCreateUser("u0", Role.USER, Collections.singleton(groupA), "p0");
        SecurityContext userSecurityContext = new SimpleSecurityContext(userId);

        {
            ExtGroupList response =
                    restExtJsService.getGroupsList(adminSecurityContext, null, 0, 1000, true);
            List<UserGroup> resources = response.getList();
            assertEquals(2, resources.size());
        }

        {
            ExtGroupList response =
                    restExtJsService.getGroupsList(userSecurityContext, null, 0, 1000, true);
            List<UserGroup> userGroups = response.getList();
            assertEquals(1, userGroups.size());
            UserGroup userGroup = userGroups.get(0);
            assertEquals(groupAName, userGroup.getGroupName());
        }
    }

    @Test
    public void testGetUsersListWithNameLike() throws Exception {

        final String userAName = "userA";
        final String userBName = "usuarioB";

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        restCreateUser(userAName, Role.USER, null, "p0");
        restCreateUser(userBName, Role.USER, null, "p0");

        {
            ExtUserList response =
                    restExtJsService.getUsersList(adminSecurityContext, "*", 0, 1000, true);
            /* 2 users, 1 admin */
            assertEquals(3, response.getCount());
            assertEquals(3, response.getList().size());
        }
        {
            ExtUserList response =
                    restExtJsService.getUsersList(adminSecurityContext, "us*", 0, 1000, true);
            assertEquals(2, response.getCount());
            assertEquals(2, response.getList().size());
        }
        {
            ExtUserList response =
                    restExtJsService.getUsersList(adminSecurityContext, "user*", 0, 1000, true);
            assertEquals(1, response.getCount());
            List<User> users = response.getList();
            assertEquals(1, users.size());
            User user = users.get(0);
            assertEquals(userAName, user.getName());
        }
    }

    @Test
    public void testGetUsersListWithNameLikeAndPagination() throws Exception {
        final String prefix = "paginated_user_";

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        restCreateUser(prefix + "E", Role.USER, null, "p0");
        restCreateUser(prefix + "C", Role.USER, null, "p0");
        restCreateUser(prefix + "A", Role.USER, null, "p0");
        restCreateUser(prefix + "D", Role.USER, null, "p0");
        restCreateUser(prefix + "B", Role.USER, null, "p0");

        {
            ExtUserList response =
                    restExtJsService.getUsersList(
                            adminSecurityContext, "*" + prefix + "*", 0, 2, true);
            assertEquals(5, response.getCount());
            List<User> users = response.getList();
            assertEquals(2, users.size());
            assertEquals(prefix + "A", users.get(0).getName());
            assertEquals(prefix + "B", users.get(1).getName());
        }
        {
            ExtUserList response =
                    restExtJsService.getUsersList(
                            adminSecurityContext, "*" + prefix + "*", 2, 2, true);
            assertEquals(5, response.getCount());
            List<User> users = response.getList();
            assertEquals(2, users.size());
            assertEquals(prefix + "C", users.get(0).getName());
            assertEquals(prefix + "D", users.get(1).getName());
        }
        {
            ExtUserList response =
                    restExtJsService.getUsersList(
                            adminSecurityContext, "*" + prefix + "*", 4, 2, true);
            assertEquals(5, response.getCount());
            List<User> users = response.getList();
            assertEquals(1, users.size());
            assertEquals(prefix + "E", users.get(0).getName());
        }
    }

    @Test
    public void testGetGroupsListWithNameLike() throws Exception {
        final String groupAName = "groupA";
        final String groupBName = "gruppoB";

        createGroup(groupAName);
        createGroup(groupBName);

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        {
            ExtGroupList response =
                    restExtJsService.getGroupsList(adminSecurityContext, "*", 0, 1000, true);
            assertEquals(2, response.getCount());
            assertEquals(2, response.getList().size());
        }
        {
            ExtGroupList response =
                    restExtJsService.getGroupsList(adminSecurityContext, "gr*", 0, 1000, true);
            assertEquals(2, response.getCount());
            assertEquals(2, response.getList().size());
        }
        {
            ExtGroupList response =
                    restExtJsService.getGroupsList(adminSecurityContext, "group*", 0, 1000, true);
            assertEquals(1, response.getCount());
            List<UserGroup> userGroups = response.getList();
            assertEquals(1, userGroups.size());
            UserGroup userGroup = userGroups.get(0);
            assertEquals(groupAName, userGroup.getGroupName());
        }
    }

    @Test
    public void testGetGroupsListWithNameLikeAndPagination() throws Exception {
        final String prefix = "paggroup";

        createGroup(prefix + "E");
        createGroup(prefix + "C");
        createGroup(prefix + "A");
        createGroup(prefix + "D");
        createGroup(prefix + "B");

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        {
            ExtGroupList response =
                    restExtJsService.getGroupsList(
                            adminSecurityContext, "*" + prefix + "*", 0, 2, true);
            assertEquals(5, response.getCount());
            List<UserGroup> groups = response.getList();
            assertEquals(2, groups.size());
            assertEquals(prefix + "A", groups.get(0).getGroupName());
            assertEquals(prefix + "B", groups.get(1).getGroupName());
        }
        {
            ExtGroupList response =
                    restExtJsService.getGroupsList(
                            adminSecurityContext, "*" + prefix + "*", 2, 2, true);
            assertEquals(5, response.getCount());
            List<UserGroup> groups = response.getList();
            assertEquals(2, groups.size());
            assertEquals(prefix + "C", groups.get(0).getGroupName());
            assertEquals(prefix + "D", groups.get(1).getGroupName());
        }
        {
            ExtGroupList response =
                    restExtJsService.getGroupsList(
                            adminSecurityContext, "*" + prefix + "*", 4, 2, true);
            assertEquals(5, response.getCount());
            List<UserGroup> groups = response.getList();
            assertEquals(1, groups.size());
            assertEquals(prefix + "E", groups.get(0).getGroupName());
        }
    }

    @Test
    public void testGetGroupsListWithReserved() throws Exception {
        final String groupName = "group";
        createGroup(groupName);

        UserGroup reservedGroup = new UserGroup();
        reservedGroup.setGroupName(GroupReservedNames.EVERYONE.groupName());
        userGroupDAO.persist(reservedGroup);

        long adminId = restCreateUser("admin", Role.ADMIN, null, "admin-test-pw");
        SecurityContext adminSecurityContext = new SimpleSecurityContext(adminId);

        {
            ExtGroupList response =
                    restExtJsService.getGroupsList(adminSecurityContext, null, 0, 1000, true);
            assertEquals(2, response.getCount());
            assertEquals(2, response.getList().size());
        }
        {
            ExtGroupList response =
                    restExtJsService.getGroupsList(adminSecurityContext, null, 0, 1000, false);
            assertEquals(1, response.getCount());
            List<UserGroup> userGroups = response.getList();
            assertEquals(1, userGroups.size());
            UserGroup userGroup = userGroups.get(0);
            assertEquals(groupName, userGroup.getGroupName());
        }
    }

    private JSONResult parse(String jsonString) throws JsonProcessingException {
        JSONResult ret = new JSONResult();

        ObjectNode jo = (ObjectNode) OBJECT_MAPPER.readTree(jsonString);
        ret.total = jo.get("totalCount").asInt();

        Set<String> names;

        JsonNode arrResults = jo.get("results");
        if (arrResults != null && arrResults.isArray()) {
            names = getArray(arrResults);
        } else if (arrResults != null && arrResults.isObject()) {
            names = Collections.singleton(getSingle((ObjectNode) arrResults));
        } else {
            LOGGER.warn("No results found");
            names = Collections.emptySet();
        }

        ret.names = names;
        ret.returnedCount = names.size();

        return ret;
    }

    Set<String> getArray(JsonNode jsonArray) {
        Set<String> ret = new HashSet<>();

        for (JsonNode jsonNode : jsonArray) {
            ret.add(getSingle((ObjectNode) jsonNode));
        }

        return ret;
    }

    String getSingle(ObjectNode jsonNode) {
        return jsonNode.get("name").asText();
    }

    static class JSONResult {
        int total;
        int returnedCount;
        Set<String> names;
    }
}
