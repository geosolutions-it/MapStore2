package it.geosolutions.geostore.services.rest.utils;

/**
 * Strategy for new user's password generation
 *
 * @see GeoStoreAuthenticationInterceptor
 */
public enum NewPasswordStrategy {
    NONE,
    USERNAME,
    FROMHEADER
}
