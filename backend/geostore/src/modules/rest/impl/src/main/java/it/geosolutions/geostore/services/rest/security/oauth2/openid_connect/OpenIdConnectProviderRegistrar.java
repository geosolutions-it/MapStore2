/* ====================================================================
 *
 * Copyright (C) 2024 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.security.oauth2.openid_connect;

import static it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Configuration.CONFIG_NAME_SUFFIX;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.support.BeanDefinitionBuilder;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.beans.factory.support.BeanDefinitionRegistryPostProcessor;
import org.springframework.context.EnvironmentAware;
import org.springframework.core.env.Environment;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.PropertiesLoaderUtils;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

/**
 * Dynamically registers {@link OpenIdConnectConfiguration} beans for each provider declared in
 * {@code oidc.providers}. If the property is not set, defaults to {@code "oidc"} for backward
 * compatibility.
 *
 * <p>For each provider name {@code P}, registers:
 *
 * <ul>
 *   <li>{@code POAuth2Config} &rarr; {@link OpenIdConnectConfiguration} singleton
 * </ul>
 *
 * <p>The {@link org.springframework.beans.factory.config.PropertyOverrideConfigurer} fills
 * properties via {@code POAuth2Config.clientId=...} etc. Filters, validators, and rest templates
 * are created programmatically by the {@link CompositeOpenIdConnectFilter}.
 */
public class OpenIdConnectProviderRegistrar
        implements BeanDefinitionRegistryPostProcessor, EnvironmentAware {

    private static final Logger LOGGER = LogManager.getLogger(OpenIdConnectProviderRegistrar.class);

    /** Primary property name — uses underscore to avoid PropertyOverrideConfigurer parsing. */
    public static final String PROVIDERS_PROPERTY = "oidc_providers";

    /** Legacy property name (dot-separated) — checked as fallback for backward compat. */
    public static final String PROVIDERS_PROPERTY_LEGACY = "oidc.providers";

    private static final String DEFAULT_PROVIDER = "oidc";

    private Environment environment;

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry)
            throws BeansException {
        String providersValue = resolveProviders();

        String[] providers = providersValue.split(",");
        for (String raw : providers) {
            String provider = raw.trim();
            if (provider.isEmpty()) continue;

            String configBeanName = provider + CONFIG_NAME_SUFFIX;

            if (!registry.containsBeanDefinition(configBeanName)) {
                BeanDefinitionBuilder configBuilder =
                        BeanDefinitionBuilder.genericBeanDefinition(
                                OpenIdConnectConfiguration.class);
                registry.registerBeanDefinition(configBeanName, configBuilder.getBeanDefinition());
                LOGGER.info("Registered OpenIdConnectConfiguration bean: {}", configBeanName);
            }
        }
    }

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory)
            throws BeansException {
        // No post-processing needed on the bean factory itself
    }

    /** Returns the provider names as configured, defaulting to "oidc". */
    public String[] getProviderNames() {
        String providersValue = resolveProviders();
        String[] names = providersValue.split(",");
        for (int i = 0; i < names.length; i++) {
            names[i] = names[i].trim();
        }
        return names;
    }

    /**
     * Resolves the {@code oidc.providers} value. Checks, in order:
     *
     * <ol>
     *   <li>Spring Environment (system properties, env vars, servlet context)
     *   <li>Properties files on the classpath and in the data directory (same locations used by the
     *       {@link org.springframework.beans.factory.config.PropertyOverrideConfigurer} in {@code
     *       applicationContext.xml})
     *   <li>Falls back to {@value #DEFAULT_PROVIDER}
     * </ol>
     *
     * <p>This explicit scanning is required because {@code PropertyOverrideConfigurer} only
     * overrides bean properties — it does NOT contribute to the Spring Environment, and this
     * registrar runs as a {@code BeanDefinitionRegistryPostProcessor} before the override
     * configurer executes.
     */
    private String resolveProviders() {
        // Try both property names: underscore (preferred) and dot (legacy/backward compat).
        // The dot-separated form (oidc.providers) conflicts with PropertyOverrideConfigurer
        // which interprets it as bean "oidc", property "providers".  The underscore form
        // (oidc_providers) avoids this issue.  Both are supported for flexibility.
        String[] keys = {PROVIDERS_PROPERTY, PROVIDERS_PROPERTY_LEGACY};

        // 1) Try the Spring Environment first (system properties, env vars)
        for (String key : keys) {
            String value = environment != null ? environment.getProperty(key) : null;
            if (value != null && !value.trim().isEmpty()) {
                LOGGER.info("Resolved {} from Spring Environment: {}", key, value);
                return value.trim();
            }
        }

        // 2) Scan properties files — classpath + data directory
        for (String key : keys) {
            String value = loadFromPropertiesFiles(key);
            if (value != null && !value.trim().isEmpty()) {
                LOGGER.info("Resolved {} from properties files: {}", key, value);
                return value.trim();
            }
        }

        LOGGER.info(
                "{} not configured, using default provider: {}",
                PROVIDERS_PROPERTY,
                DEFAULT_PROVIDER);
        return DEFAULT_PROVIDER;
    }

    /**
     * Scans all known properties file locations for the given key. Mirrors the locations configured
     * in the {@code PropertyOverrideConfigurer}:
     *
     * <ul>
     *   <li>{@code classpath*:geostore-ovr.properties}
     *   <li>{@code classpath*:mapstore-ovr.properties}
     *   <li>{@code file:${datadir}/geostore-ovr.properties}
     *   <li>{@code file:${datadir}/mapstore-ovr.properties}
     * </ul>
     *
     * The data directory is resolved from the {@code MAPSTORE_DATA_DIR} environment variable or the
     * {@code datadir.location} system property.
     */
    private String loadFromPropertiesFiles(String key) {
        List<Resource> resources = new ArrayList<>();
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

        // Classpath resources
        String[] classpathLocations = {
            "classpath*:geostore-ovr.properties", "classpath*:mapstore-ovr.properties"
        };
        for (String location : classpathLocations) {
            try {
                for (Resource r : resolver.getResources(location)) {
                    resources.add(r);
                }
            } catch (IOException e) {
                LOGGER.debug("Could not resolve {}: {}", location, e.getMessage());
            }
        }

        // Data directory resources (from MAPSTORE_DATA_DIR env var or datadir.location sysprop)
        String dataDir = resolveDataDir();
        if (dataDir != null) {
            resources.add(new FileSystemResource(new File(dataDir, "geostore-ovr.properties")));
            resources.add(new FileSystemResource(new File(dataDir, "mapstore-ovr.properties")));
        }

        // Scan all collected resources (last match wins to mirror override ordering)
        String result = null;
        for (Resource resource : resources) {
            if (!resource.exists()) continue;
            try {
                Properties props = PropertiesLoaderUtils.loadProperties(resource);
                String val = props.getProperty(key);
                if (val != null && !val.trim().isEmpty()) {
                    LOGGER.info("Found {}={} in {}", key, val, resource);
                    result = val; // keep scanning — later files override earlier ones
                }
            } catch (IOException e) {
                LOGGER.debug("Could not load properties from {}: {}", resource, e.getMessage());
            }
        }
        return result;
    }

    /**
     * Resolves the data directory path from the {@code MAPSTORE_DATA_DIR} environment variable or
     * the {@code datadir.location} system property.
     */
    private String resolveDataDir() {
        // Check environment variable first
        String dir = System.getenv("MAPSTORE_DATA_DIR");
        if (dir != null && !dir.trim().isEmpty()) {
            LOGGER.info("Data directory from MAPSTORE_DATA_DIR env: {}", dir);
            return dir.trim();
        }
        // Fall back to system property (set by Maven Cargo from ${env.MAPSTORE_DATA_DIR})
        dir = System.getProperty("datadir.location");
        if (dir != null && !dir.trim().isEmpty()) {
            LOGGER.info("Data directory from datadir.location sysprop: {}", dir);
            return dir.trim();
        }
        // Try Spring Environment
        if (environment != null) {
            dir = environment.getProperty("datadir.location");
            if (dir != null && !dir.trim().isEmpty()) {
                LOGGER.info("Data directory from environment datadir.location: {}", dir);
                return dir.trim();
            }
            dir = environment.getProperty("MAPSTORE_DATA_DIR");
            if (dir != null && !dir.trim().isEmpty()) {
                LOGGER.info("Data directory from environment MAPSTORE_DATA_DIR: {}", dir);
                return dir.trim();
            }
        }
        LOGGER.warn(
                "No data directory configured (MAPSTORE_DATA_DIR env / datadir.location sysprop not set)");
        return null;
    }
}
