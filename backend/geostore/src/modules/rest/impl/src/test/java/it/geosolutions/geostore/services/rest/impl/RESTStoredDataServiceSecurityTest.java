/*
 * Copyright (C) 2026 GeoSolutions S.r.l.
 * http://www.geo-solutions.it
 *
 * GPLv3 + Classpath exception
 */
package it.geosolutions.geostore.services.rest.impl;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import it.geosolutions.geostore.core.model.Category;
import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.StoredData;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.services.ResourcePermissionService;
import it.geosolutions.geostore.services.ResourceService;
import it.geosolutions.geostore.services.StoredDataService;
import it.geosolutions.geostore.services.rest.exception.ForbiddenErrorWebEx;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.PropertyOverrideConfigurer;
import org.springframework.beans.factory.config.PropertyPlaceholderConfigurer;
import org.springframework.beans.factory.config.TypedStringValue;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.beans.factory.support.RootBeanDefinition;
import org.springframework.beans.factory.xml.XmlBeanDefinitionReader;
import org.springframework.context.support.GenericApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;

import java.util.Properties;

class RESTStoredDataServiceSecurityTest {

    private static final long ID = 42L;

    private final ResourceService resources = mock(ResourceService.class);
    private final ResourcePermissionService permissions = mock(ResourcePermissionService.class);
    private final StoredDataService data = mock(StoredDataService.class);
    private final SecurityContext context = mock(SecurityContext.class);
    private final User caller = new User();
    private final RESTStoredDataServiceImpl service =
            new RESTStoredDataServiceImpl() {
                @Override
                protected User extractAuthUser(SecurityContext sc) {
                    return caller;
                }
            };

    @BeforeEach
    void setUp() {
        service.setResourceService(resources);
        service.setResourcePermissionService(permissions);
        service.setStoredDataService(data);
        service.setPublicRawCategories("THUMBNAIL");
    }

    private Resource resource(String categoryName) {
        Category category = new Category();
        category.setName(categoryName);
        Resource resource = new Resource();
        resource.setId(ID);
        resource.setCategory(category);
        when(resources.getResource(ID, false, true, false)).thenReturn(resource);
        return resource;
    }

    private void storedData(String payload) throws Exception {
        StoredData storedData = new StoredData();
        storedData.setId(ID);
        storedData.setData(payload);
        when(data.get(ID)).thenReturn(storedData);
    }

    @Test
    void privateDataIsDeniedBeforeItIsLoaded() throws Exception {
        Resource resource = resource("MAP");
        when(permissions.canResourceBeReadByUser(resource, caller)).thenReturn(false);

        assertThrows(ForbiddenErrorWebEx.class, () -> service.getRaw(context, null, ID, null));
        verify(data, never()).get(ID);
    }

    @Test
    void readableDataIsReturnedWithDefensiveHeaders() throws Exception {
        Resource resource = resource("MAP");
        when(permissions.canResourceBeReadByUser(resource, caller)).thenReturn(true);
        storedData("safe-marker");

        Response response = service.getRaw(context, null, ID, null);

        assertEquals(200, response.getStatus());
        assertEquals("safe-marker", response.getEntity());
        assertEquals("sandbox", response.getHeaderString("Content-Security-Policy"));
        assertEquals("nosniff", response.getHeaderString("X-Content-Type-Options"));
    }

    @Test
    void thumbnailImageRemainsAvailableWithoutObjectPermission() throws Exception {
        Resource resource = resource("THUMBNAIL");
        storedData("data:image/png;base64,aGVsbG8=");

        Response response = service.getRaw(context, null, ID, "datauri");

        assertEquals(200, response.getStatus());
        assertEquals("image/png", response.getMediaType().toString());
        assertArrayEquals("hello".getBytes(), (byte[]) response.getEntity());
        assertEquals("sandbox", response.getHeaderString("Content-Security-Policy"));
        assertEquals("nosniff", response.getHeaderString("X-Content-Type-Options"));
        verify(permissions, never()).canResourceBeReadByUser(resource, caller);
    }

    @Test
    void dataUriDecodingRejectsNonImages() throws Exception {
        Resource resource = resource("MAP");
        when(permissions.canResourceBeReadByUser(resource, caller)).thenReturn(true);
        storedData("data:text/html;,harmless-marker");

        Response response = service.getRaw(context, null, ID, "datauri");

        assertEquals(400, response.getStatus());
        assertEquals("nosniff", response.getHeaderString("X-Content-Type-Options"));
    }

    @Test
    void missingResourceDoesNotLoadStoredData() throws Exception {
        Response response = service.getRaw(context, null, ID, null);

        assertEquals(404, response.getStatus());
        verify(data, never()).get(ID);
    }

    @Test
    void configuredPublicCategoriesReplaceTheDefault() throws Exception {
        service.setPublicRawCategories(" ICON , ");
        Resource icon = resource("ICON");
        storedData("icon-marker");

        Response response = service.getRaw(context, null, ID, null);

        assertEquals(200, response.getStatus());
        verify(permissions, never()).canResourceBeReadByUser(icon, caller);
    }

    @Test
    void thumbnailNeedsReadPermissionWhenNoCategoryIsPublic() throws Exception {
        service.setPublicRawCategories("");
        Resource thumbnail = resource("THUMBNAIL");
        when(permissions.canResourceBeReadByUser(thumbnail, caller)).thenReturn(false);

        assertThrows(ForbiddenErrorWebEx.class, () -> service.getRaw(context, null, ID, null));
        verify(data, never()).get(ID);
    }

    @Test
    void publicCategoryNamesMatchExactly() throws Exception {
        Resource thumbnail = resource("thumbnail");
        when(permissions.canResourceBeReadByUser(thumbnail, caller)).thenReturn(false);

        assertThrows(ForbiddenErrorWebEx.class, () -> service.getRaw(context, null, ID, null));
    }

    @Test
    void noCategoryIsPublicWithoutConfiguration() throws Exception {
        RESTStoredDataServiceImpl unconfigured = new FixedCallerService();
        unconfigured.setResourceService(resources);
        unconfigured.setResourcePermissionService(permissions);
        unconfigured.setStoredDataService(data);
        resource("THUMBNAIL");

        assertThrows(ForbiddenErrorWebEx.class, () -> unconfigured.getRaw(context, null, ID, null));
        verify(data, never()).get(ID);
    }

    @Test
    void shippedConfigurationMakesThumbnailsPublic() {
        DefaultListableBeanFactory factory = new DefaultListableBeanFactory();
        new XmlBeanDefinitionReader(factory)
                .loadBeanDefinitions(
                        new FileSystemResource("src/main/resources/applicationContext.xml"));
        PropertyPlaceholderConfigurer placeholders = new PropertyPlaceholderConfigurer();
        placeholders.setLocation(new ClassPathResource("geostore.properties"));
        placeholders.setIgnoreUnresolvablePlaceholders(true);
        placeholders.postProcessBeanFactory(factory);

        Object configured =
                factory.getBeanDefinition("restStoredDataService")
                        .getPropertyValues()
                        .get("publicRawCategories");

        assertEquals("THUMBNAIL", ((TypedStringValue) configured).getValue());
    }

    @Test
    void publicCategoriesCanBeSetThroughPropertyOverride() throws Exception {
        Properties overrides = new Properties();
        overrides.setProperty("restStoredDataService.publicRawCategories", "THUMBNAIL");
        PropertyOverrideConfigurer configurer = new PropertyOverrideConfigurer();
        configurer.setProperties(overrides);

        try (GenericApplicationContext spring = new GenericApplicationContext()) {
            spring.registerBeanDefinition(
                    "restStoredDataService", new RootBeanDefinition(FixedCallerService.class));
            spring.addBeanFactoryPostProcessor(configurer);
            spring.refresh();
            RESTStoredDataServiceImpl configured = spring.getBean(RESTStoredDataServiceImpl.class);
            configured.setResourceService(resources);
            configured.setResourcePermissionService(permissions);
            configured.setStoredDataService(data);
            resource("THUMBNAIL");
            storedData("thumbnail-marker");

            Response response = configured.getRaw(context, null, ID, null);

            assertEquals(200, response.getStatus());
        }
    }

    /** A service with a fixed caller, for instances the tests create without the subclass above. */
    static class FixedCallerService extends RESTStoredDataServiceImpl {
        @Override
        protected User extractAuthUser(SecurityContext sc) {
            return new User();
        }
    }
}
