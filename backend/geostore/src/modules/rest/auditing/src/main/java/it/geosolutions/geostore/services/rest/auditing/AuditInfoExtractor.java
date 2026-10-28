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

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;

import jakarta.servlet.http.HttpServletRequest;

import org.apache.cxf.io.CachedOutputStream;
import org.apache.cxf.message.Message;
import org.apache.cxf.transport.http.AbstractHTTPDestination;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.security.core.Authentication;

import java.io.InputStream;
import java.io.OutputStream;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

final class AuditInfoExtractor {

    private static final Logger LOGGER = LogManager.getLogger(AuditInfoExtractor.class);

    private static final Pattern geoStorePath = Pattern.compile("/geostore/(.*)");

    private AuditInfoExtractor() {}

    static Map<String, String> extract(Message message) {
        Map<String, String> auditInfo = new HashMap<String, String>();
        try {
            handleInMessage(auditInfo, message.getExchange().getInMessage());
            handleOutSuccessMessage(auditInfo, message.getExchange().getOutMessage());
            handleOutFaultMessage(auditInfo, message.getExchange().getOutFaultMessage());
            handleTime(auditInfo, message.getExchange().get(AuditInfo.START_TIME.getKey()));
        } catch (Exception exception) {
            LogUtils.error(LOGGER, exception, "Error obtaining auditing information.");
        }
        return auditInfo;
    }

    static Long getResponseLength(Message message) {
        try (CachedOutputStream outputStream =
                (CachedOutputStream) message.getContent(OutputStream.class)) {
            if (outputStream != null) return outputStream.size();
        } catch (Exception exception) {
            LogUtils.error(LOGGER, exception, "Error obtaining response length.");
        }
        return null;
    }

    private static void handleInMessage(Map<String, String> auditInfo, Message message) {
        if (message == null) {
            LogUtils.info(LOGGER, "Input message is NULL.");
            return;
        }
        try {
            auditInfo.put(
                    AuditInfo.HTTP_METHOD.getKey(),
                    safeToString(message.get(Message.HTTP_REQUEST_METHOD)));
            auditInfo.put(
                    AuditInfo.PATH.getKey(),
                    removeGeoStore((String) message.get(Message.PATH_INFO)));
            auditInfo.put(
                    AuditInfo.BASE_PATH.getKey(),
                    removeGeoStore((String) message.get(Message.BASE_PATH)));
            auditInfo.put(
                    AuditInfo.QUERY_STRING.getKey(),
                    safeToString(message.get(Message.QUERY_STRING)));
            HttpServletRequest httpServletRequest =
                    (HttpServletRequest) message.get(AbstractHTTPDestination.HTTP_REQUEST);
            auditInfo.put(
                    AuditInfo.REMOTE_ADDR.getKey(),
                    safeToString(httpServletRequest.getRemoteAddr()));
            auditInfo.put(
                    AuditInfo.REMOTE_HOST.getKey(),
                    safeToString(httpServletRequest.getRemoteHost()));
            auditInfo.put(
                    AuditInfo.REMOTE_USER.getKey(),
                    safeToString(httpServletRequest.getRemoteUser()));
            auditInfo.put(
                    AuditInfo.HOST.getKey(), safeToString(httpServletRequest.getServerName()));
            fillAuthInfo(auditInfo, httpServletRequest);
            auditInfo.put(AuditInfo.BODY_AS_STRING.getKey(), getPayload(message));
        } catch (Exception exception) {
            LogUtils.error(
                    LOGGER, exception, "Error obtaining auditing information for input message.");
        }
    }

    private static void handleOutSuccessMessage(Map<String, String> auditInfo, Message message) {
        if (message == null) {
            return;
        }
        auditInfo.put(
                AuditInfo.RESPONSE_STATUS_CODE.getKey(),
                safeToString(message.get(Message.RESPONSE_CODE)));
        auditInfo.put(
                AuditInfo.RESPONSE_CONTENT_TYPE.getKey(),
                safeToString(message.get(Message.CONTENT_TYPE)));
        auditInfo.put(
                AuditInfo.RESPONSE_LENGTH.getKey(),
                safeToString(message.getExchange().get(AuditInfo.RESPONSE_LENGTH.getKey())));
    }

    private static void handleOutFaultMessage(Map<String, String> auditInfo, Message message) {
        if (message == null) {
            return;
        }
        auditInfo.put(AuditInfo.FAILED.getKey(), "true");
        Exception exception = message.getContent(Exception.class);
        if (exception != null) {
            auditInfo.put(AuditInfo.ERROR_MESSAGE.getKey(), exception.getMessage());
        } else {
            auditInfo.put(AuditInfo.ERROR_MESSAGE.getKey(), "");
        }
        auditInfo.put(
                AuditInfo.RESPONSE_CONTENT_TYPE.getKey(),
                safeToString(message.get(Message.CONTENT_TYPE)));
        auditInfo.put(AuditInfo.RESPONSE_LENGTH.getKey(), safeToString(getResponseLength(message)));
        auditInfo.put(
                AuditInfo.RESPONSE_STATUS_CODE.getKey(),
                safeToString(safeToString(message.get(Message.RESPONSE_CODE))));
    }

    private static void handleTime(Map<String, String> auditInfo, Object startTimeObject) {
        if (startTimeObject == null) {
            return;
        }
        long startTime = (Long) startTimeObject;
        long endTime = System.currentTimeMillis();
        auditInfo.put(AuditInfo.START_TIME.getKey(), String.valueOf(startTime));
        auditInfo.put(AuditInfo.END_TIME.getKey(), String.valueOf(endTime));
        auditInfo.put(AuditInfo.TOTAL_TIME.getKey(), String.valueOf(endTime - startTime));
    }

    private static String safeToString(Object value) {
        if (value == null) {
            return "";
        }
        return value.toString();
    }

    private static String getPayload(Message message) {
        try (InputStream inputStream = message.getContent(InputStream.class)) {
            if (inputStream == null) {
                return "";
            }
            return inputStream.toString();
        } catch (Exception exception) {
            LogUtils.error(LOGGER, exception, "Error reading payload.");
        }
        return "";
    }

    private static void fillAuthInfo(
            Map<String, String> info, HttpServletRequest httpServletRequest) {
        Principal userPrincipal = httpServletRequest.getUserPrincipal();
        String userName = "";
        String userRole = "";
        String userGroups = "";
        if (userPrincipal != null && userPrincipal instanceof Authentication) {
            Authentication authentication = (Authentication) userPrincipal;
            Object principal = authentication.getPrincipal();
            if (principal != null && principal instanceof User) {
                User user = (User) principal;
                userName = user.getName();
                userRole = user.getRole().name();
                userGroups = groupsToString(user.getGroups());
            }
        }
        info.put(AuditInfo.USER_NAME.getKey(), userName);
        info.put(AuditInfo.USER_ROLE.getKey(), userRole);
        info.put(AuditInfo.USER_GROUPS.getKey(), userGroups);
    }

    private static String groupsToString(Set<UserGroup> groups) {
        if (groups.isEmpty()) {
            return null;
        }
        StringBuilder groupsString = new StringBuilder();
        for (UserGroup userGroup : groups) {
            groupsString.append(userGroup.getGroupName()).append(",");
        }
        groupsString.deleteCharAt(groupsString.length() - 1);
        return groupsString.toString();
    }

    private static String removeGeoStore(String path) {
        if (path == null) {
            return "";
        }
        Matcher matcher = geoStorePath.matcher(path);
        if (matcher.matches()) {
            return matcher.group(1);
        }
        return path;
    }
}
