/* ====================================================================
 *
 * Copyright (C) 2007 - 2015 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.auditing;

enum AuditInfo {
    HTTP_METHOD("httpMethod"),
    PATH("path"),
    BASE_PATH("basePath"),
    QUERY_STRING("queryString"),
    BODY_AS_STRING("bodyAsString"),
    REMOTE_ADDR("remoteAddr"),
    REMOTE_HOST("remoteHost"),
    REMOTE_USER("remoteUser"),
    USER_NAME("userName"),
    USER_ROLE("userRole"),
    USER_GROUPS("userGroups"),
    HOST("host"),
    RESPONSE_STATUS_CODE("responseStatus"),
    RESPONSE_CONTENT_TYPE("responseContentType"),
    RESPONSE_LENGTH("responseLength"),
    START_TIME("startTime"),
    END_TIME("endTime"),
    TOTAL_TIME("totalTime"),
    FAILED("failed"),
    ERROR_MESSAGE("errorMessage");

    private final String key;

    AuditInfo(String key) {
        this.key = key;
    }

    String getKey() {
        return key;
    }
}
