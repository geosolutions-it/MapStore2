/*
 * Copyright (C) 2026 GeoSolutions S.r.l.
 * http://www.geo-solutions.it
 *
 * GPLv3 + Classpath exception
 */
package it.geosolutions.geostore.services.rest.impl;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.services.ResourcePermissionService;
import it.geosolutions.geostore.services.ResourceService;
import it.geosolutions.geostore.services.TagService;
import it.geosolutions.geostore.services.rest.exception.ForbiddenErrorWebEx;
import it.geosolutions.geostore.services.rest.exception.NotFoundWebEx;

import jakarta.ws.rs.core.SecurityContext;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RESTTagServiceAuthorizationTest {

    private static final long TAG_ID = 12L;
    private static final long RESOURCE_ID = 42L;

    private final ResourceService resources = mock(ResourceService.class);
    private final ResourcePermissionService permissions = mock(ResourcePermissionService.class);
    private final TagService tags = mock(TagService.class);
    private final SecurityContext context = mock(SecurityContext.class);
    private final User caller = new User();
    private final RESTTagServiceImpl service =
            new RESTTagServiceImpl() {
                @Override
                protected User extractAuthUser(SecurityContext sc) {
                    return caller;
                }
            };

    @BeforeEach
    void setUp() {
        service.setResourceService(resources);
        service.setResourcePermissionService(permissions);
        service.setTagService(tags);
    }

    private Resource resource(boolean canWrite) {
        Resource resource = new Resource();
        resource.setId(RESOURCE_ID);
        when(resources.getResource(RESOURCE_ID, false, true, false)).thenReturn(resource);
        when(permissions.canResourceBeWrittenByUser(resource, caller)).thenReturn(canWrite);
        return resource;
    }

    @Test
    void addingTagRequiresWritePermission() throws Exception {
        resource(false);

        assertThrows(
                ForbiddenErrorWebEx.class,
                () -> service.addToResource(context, TAG_ID, RESOURCE_ID));
        verify(tags, never()).addToResource(TAG_ID, RESOURCE_ID);
    }

    @Test
    void removingTagRequiresWritePermission() throws Exception {
        resource(false);

        assertThrows(
                ForbiddenErrorWebEx.class,
                () -> service.removeFromResource(context, TAG_ID, RESOURCE_ID));
        verify(tags, never()).removeFromResource(TAG_ID, RESOURCE_ID);
    }

    @Test
    void writableResourceAllowsTagChanges() throws Exception {
        resource(true);

        service.addToResource(context, TAG_ID, RESOURCE_ID);
        service.removeFromResource(context, TAG_ID, RESOURCE_ID);

        verify(tags).addToResource(TAG_ID, RESOURCE_ID);
        verify(tags).removeFromResource(TAG_ID, RESOURCE_ID);
    }

    @Test
    void missingResourceCannotBeTagged() throws Exception {
        assertThrows(
                NotFoundWebEx.class, () -> service.addToResource(context, TAG_ID, RESOURCE_ID));
        verify(tags, never()).addToResource(TAG_ID, RESOURCE_ID);
    }
}
