package it.geosolutions.geostore.services.rest.utils;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

import java.util.Map;

public class GeoStoreContext implements ApplicationContextAware {

    private static final Logger LOGGER = LogManager.getLogger(GeoStoreContext.class);

    /**
     * Static application context provided to {@link #setApplicationContext(ApplicationContext)}
     * during initialization.
     *
     * <p>This context is used by methods such as {@link #bean(String)}, {@link #bean(Class)}.
     */
    static ApplicationContext context;

    public static <T> Map<String, T> beans(Class<T> clazz) {
        Map<String, T> result = null;
        try {
            if (context != null) result = context.getBeansOfType(clazz);
        } catch (Exception e) {
            LOGGER.error("Error while retrieving the bean of type {}", clazz.getSimpleName(), e);
        }
        return result;
    }

    public static <T> T bean(Class<T> clazz) {
        T result = null;
        try {
            if (context != null) result = context.getBean(clazz);
        } catch (Exception e) {
            LOGGER.error("Error while retrieving the bean of type {}", clazz.getSimpleName(), e);
        }
        return result;
    }

    public static Object bean(String name) {
        Object result = null;
        try {
            if (context != null) result = context.getBean(name);
        } catch (BeansException e) {
            LOGGER.error("Error while retrieving the bean with name {}", name, e);
        }
        return result;
    }

    public static <T> T bean(String name, Class<T> clazz) {
        return clazz.cast(bean(name));
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        context = applicationContext;
    }
}
