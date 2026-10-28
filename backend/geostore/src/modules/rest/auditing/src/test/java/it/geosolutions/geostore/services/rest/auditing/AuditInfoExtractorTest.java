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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.Role;

import jakarta.servlet.http.HttpServletRequest;

import org.apache.cxf.io.CachedOutputStream;
import org.apache.cxf.message.Exchange;
import org.apache.cxf.message.Message;
import org.apache.cxf.transport.http.AbstractHTTPDestination;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.security.core.Authentication;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.Collections;
import java.util.Map;

public final class AuditInfoExtractorTest extends AuditingTestsBase {

    private static HttpServletRequest getHttpServletRequest() {
        HttpServletRequest httpServletRequest = Mockito.mock(HttpServletRequest.class);
        Mockito.when(httpServletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        Mockito.when(httpServletRequest.getRemoteHost()).thenReturn("127.0.0.1");
        Mockito.when(httpServletRequest.getRemoteUser())
                .thenReturn(
                        "User[id=2, name=admin, group=[UserGroup[id=1, groupName=everyone]], role=ADMIN]");
        Mockito.when(httpServletRequest.getServerName()).thenReturn("localhost");
        UserGroup userGroup = Mockito.mock(UserGroup.class);
        Mockito.when(userGroup.getGroupName()).thenReturn("everyone");
        User user = Mockito.mock(User.class);
        Mockito.when(user.getName()).thenReturn("admin");
        Mockito.when(user.getRole()).thenReturn(Role.ADMIN);
        Mockito.when(user.getGroups()).thenReturn(Collections.singleton(userGroup));
        Authentication authentication = Mockito.mock(Authentication.class);
        Mockito.when(authentication.getPrincipal()).thenReturn(user);
        Mockito.when(httpServletRequest.getUserPrincipal()).thenReturn(authentication);
        return httpServletRequest;
    }

    private static InputStream getInputStream(String content) {
        InputStream inputStream = Mockito.mock(InputStream.class);
        Mockito.when(inputStream.toString()).thenReturn(content);
        return inputStream;
    }

    private static Message getInMessage() {
        Message inMessage = Mockito.mock(Message.class);
        Mockito.when(inMessage.get(Message.HTTP_REQUEST_METHOD)).thenReturn("GET");
        Mockito.when(inMessage.get(Message.PATH_INFO)).thenReturn("/geostore/users/user/15");
        Mockito.when(inMessage.get(Message.BASE_PATH)).thenReturn("/geostore/users");
        Mockito.when(inMessage.get(Message.QUERY_STRING)).thenReturn(null);
        HttpServletRequest httpServletRequest = getHttpServletRequest();
        Mockito.when(inMessage.get(AbstractHTTPDestination.HTTP_REQUEST))
                .thenReturn(httpServletRequest);
        InputStream inputStream = getInputStream("body-content");
        Mockito.when(inMessage.getContent(InputStream.class)).thenReturn(inputStream);
        return inMessage;
    }

    private static Message getOutSuccessMessage() {
        Message outSuccessMessage = Mockito.mock(Message.class);
        Mockito.when(outSuccessMessage.get(Message.RESPONSE_CODE)).thenReturn("200");
        Mockito.when(outSuccessMessage.get(Message.CONTENT_TYPE))
                .thenReturn("application/octet-stream");
        Exchange exchange = Mockito.mock(Exchange.class);
        Mockito.when(exchange.get(AuditInfo.RESPONSE_LENGTH.getKey())).thenReturn(150);
        Mockito.when(outSuccessMessage.getExchange()).thenReturn(exchange);
        return outSuccessMessage;
    }

    private static CachedOutputStream getCacheOutputStream() {
        CachedOutputStream outputStream = Mockito.mock(CachedOutputStream.class);
        Mockito.when(outputStream.size()).thenReturn(100L);
        return outputStream;
    }

    private static Message getOutFaultMessage() {
        Message outFaultMessage = Mockito.mock(Message.class);
        Mockito.when(outFaultMessage.getContent(Exception.class))
                .thenReturn(new Exception("exception-message"));
        Mockito.when(outFaultMessage.get(Message.RESPONSE_CODE)).thenReturn("500");
        Mockito.when(outFaultMessage.get(Message.CONTENT_TYPE))
                .thenReturn("application/octet-stream");
        CachedOutputStream outputStream = getCacheOutputStream();
        Mockito.when(outFaultMessage.getContent(OutputStream.class)).thenReturn(outputStream);
        return outFaultMessage;
    }

    @Test
    public void testSuccessExecution() {
        Message message = Mockito.mock(Message.class);
        Exchange exchange = Mockito.mock(Exchange.class);
        Message inMessage = getInMessage();
        Mockito.when(message.getExchange()).thenReturn(exchange);
        Mockito.when(exchange.getInMessage()).thenReturn(inMessage);
        Message outSuccessMessage = getOutSuccessMessage();
        Mockito.when(exchange.getOutMessage()).thenReturn(outSuccessMessage);
        Mockito.when(exchange.get(AuditInfo.START_TIME.getKey())).thenReturn(1000l);
        Map<String, String> auditInfo = AuditInfoExtractor.extract(message);
        assertEquals(auditInfo.size(), 18);
        assertEquals(auditInfo.get(AuditInfo.HOST.getKey()), "localhost");
        assertEquals(
                auditInfo.get(AuditInfo.RESPONSE_CONTENT_TYPE.getKey()),
                "application/octet-stream");
        assertEquals(auditInfo.get(AuditInfo.HTTP_METHOD.getKey()), "GET");
        assertEquals(auditInfo.get(AuditInfo.BODY_AS_STRING.getKey()), "body-content");
        assertEquals(auditInfo.get(AuditInfo.USER_ROLE.getKey()), "ADMIN");
        assertEquals(auditInfo.get(AuditInfo.REMOTE_HOST.getKey()), "127.0.0.1");
        assertEquals(auditInfo.get(AuditInfo.START_TIME.getKey()), "1000");
        assertEquals(auditInfo.get(AuditInfo.RESPONSE_LENGTH.getKey()), "150");
        assertEquals(auditInfo.get(AuditInfo.BASE_PATH.getKey()), "users");
        assertEquals(auditInfo.get(AuditInfo.QUERY_STRING.getKey()), "");
        assertEquals(auditInfo.get(AuditInfo.USER_GROUPS.getKey()), "everyone");
        assertEquals(auditInfo.get(AuditInfo.RESPONSE_STATUS_CODE.getKey()), "200");
        assertEquals(auditInfo.get(AuditInfo.PATH.getKey()), "users/user/15");
        assertEquals(auditInfo.get(AuditInfo.USER_NAME.getKey()), "admin");
        assertEquals(auditInfo.get(AuditInfo.REMOTE_ADDR.getKey()), "127.0.0.1");
        assertEquals(
                auditInfo.get(AuditInfo.REMOTE_USER.getKey()),
                "User[id=2, name=admin, group=[UserGroup[id=1, groupName=everyone]], role=ADMIN]");
        assertNotNull(auditInfo.get(AuditInfo.END_TIME.getKey()));
        assertEquals(
                Long.parseLong(auditInfo.get(AuditInfo.TOTAL_TIME.getKey())),
                Long.parseLong(auditInfo.get(AuditInfo.END_TIME.getKey())) - 1000);
    }

    @Test
    public void testFaultExecution() {
        Message message = Mockito.mock(Message.class);
        Exchange exchange = Mockito.mock(Exchange.class);
        Message inMessage = getInMessage();
        Mockito.when(message.getExchange()).thenReturn(exchange);
        Mockito.when(exchange.getInMessage()).thenReturn(inMessage);
        Message outFaultMessage = getOutFaultMessage();
        Mockito.when(exchange.getOutFaultMessage()).thenReturn(outFaultMessage);
        Mockito.when(exchange.get(AuditInfo.START_TIME.getKey())).thenReturn(1000l);
        Map<String, String> auditInfo = AuditInfoExtractor.extract(message);
        assertEquals(auditInfo.size(), 20);
        assertEquals(auditInfo.get(AuditInfo.HOST.getKey()), "localhost");
        assertEquals(
                auditInfo.get(AuditInfo.RESPONSE_CONTENT_TYPE.getKey()),
                "application/octet-stream");
        assertEquals(auditInfo.get(AuditInfo.HTTP_METHOD.getKey()), "GET");
        assertEquals(auditInfo.get(AuditInfo.BODY_AS_STRING.getKey()), "body-content");
        assertEquals(auditInfo.get(AuditInfo.USER_ROLE.getKey()), "ADMIN");
        assertEquals(auditInfo.get(AuditInfo.REMOTE_HOST.getKey()), "127.0.0.1");
        assertEquals(auditInfo.get(AuditInfo.START_TIME.getKey()), "1000");
        assertEquals(auditInfo.get(AuditInfo.RESPONSE_LENGTH.getKey()), "100");
        assertEquals(auditInfo.get(AuditInfo.BASE_PATH.getKey()), "users");
        assertEquals(auditInfo.get(AuditInfo.QUERY_STRING.getKey()), "");
        assertEquals(auditInfo.get(AuditInfo.USER_GROUPS.getKey()), "everyone");
        assertEquals(auditInfo.get(AuditInfo.RESPONSE_STATUS_CODE.getKey()), "500");
        assertEquals(auditInfo.get(AuditInfo.PATH.getKey()), "users/user/15");
        assertEquals(auditInfo.get(AuditInfo.USER_NAME.getKey()), "admin");
        assertEquals(auditInfo.get(AuditInfo.REMOTE_ADDR.getKey()), "127.0.0.1");
        assertEquals(
                auditInfo.get(AuditInfo.REMOTE_USER.getKey()),
                "User[id=2, name=admin, group=[UserGroup[id=1, groupName=everyone]], role=ADMIN]");
        assertEquals(auditInfo.get(AuditInfo.ERROR_MESSAGE.getKey()), "exception-message");
        assertEquals(auditInfo.get(AuditInfo.FAILED.getKey()), "true");
        assertNotNull(auditInfo.get(AuditInfo.END_TIME.getKey()));
        assertEquals(
                Long.parseLong(auditInfo.get(AuditInfo.TOTAL_TIME.getKey())),
                Long.parseLong(auditInfo.get(AuditInfo.END_TIME.getKey())) - 1000);
    }
}
