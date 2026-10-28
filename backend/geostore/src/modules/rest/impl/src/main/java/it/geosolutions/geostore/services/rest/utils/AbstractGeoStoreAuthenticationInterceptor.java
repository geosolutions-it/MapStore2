/*
 *  Copyright (C) 2007 - 2011 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.utils;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.security.password.PwEncoder;
import it.geosolutions.geostore.services.rest.security.FormerDefaultPasswordCheck;

import org.apache.cxf.configuration.security.AuthorizationPolicy;
import org.apache.cxf.interceptor.Fault;
import org.apache.cxf.interceptor.security.AccessDeniedException;
import org.apache.cxf.message.Message;
import org.apache.cxf.phase.AbstractPhaseInterceptor;
import org.apache.cxf.phase.Phase;
import org.apache.cxf.security.SecurityContext;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * Class AbstractGeoStoreAuthenticationInterceptor. Envelop for different authentication provider
 * interceptors.
 *
 * @author adiaz (alejandro.diaz at geo-solutions.it)
 */
@SuppressWarnings("PMD.UnusedPrivateField")
public abstract class AbstractGeoStoreAuthenticationInterceptor
        extends AbstractPhaseInterceptor<Message> {

    protected static final Logger LOGGER =
            LogManager.getLogger(AbstractGeoStoreAuthenticationInterceptor.class);

    public AbstractGeoStoreAuthenticationInterceptor() {
        super(Phase.UNMARSHAL);
    }

    /*
     * (non-Javadoc)
     *
     * @see org.apache.cxf.interceptor.Interceptor#handleMessage(org.apache.cxf.message.Message)
     */
    @Override
    public void handleMessage(Message message) throws Fault {
        if (LOGGER.isInfoEnabled()) {
            LOGGER.info("In handleMessage");
            LOGGER.info("Message --> " + message);
        }

        String username = null;
        String password = null;

        User user = null;

        AuthorizationPolicy policy = message.get(AuthorizationPolicy.class);
        if (policy != null) {
            username = policy.getUserName();
            password = policy.getPassword();
            if (password == null) password = "";

            if (LOGGER.isInfoEnabled()) LOGGER.info("Requesting user: " + username);

            // //////////////////////////////////////////////////////////////////
            // read user from the interceptor: If user and PW do not match,
            // throw new AuthenticationException("Unauthorized");
            // ///////////////////////////////////////////////////////////////////
            try {
                user = getUser(username, message);
            } catch (Exception e) {
                LOGGER.error("Exception while checking pw: {}", username, e);
                throw new AccessDeniedException("Authorization error");
            }

            if (!PwEncoder.isPasswordValid(user.getPassword(), password)) {
                if (LOGGER.isInfoEnabled()) LOGGER.info("Bad pw for user {}", username);
                throw new AccessDeniedException("Not authorized");
            }
            if (FormerDefaultPasswordCheck.refusesLogin(user.getName(), password)) {
                throw new AccessDeniedException("Not authorized");
            }

        } else {
            if (LOGGER.isInfoEnabled()) LOGGER.info("No requesting user -- GUEST access");
        }

        GeoStoreSecurityContext securityContext = new GeoStoreSecurityContext();
        GeoStorePrincipal principal =
                user != null ? new GeoStorePrincipal(user) : GeoStorePrincipal.createGuest();
        securityContext.setPrincipal(principal);

        message.put(SecurityContext.class, securityContext);
    }

    /**
     * Obtain an user from his username
     *
     * @param username of the user
     * @param message intercepted
     * @return user identified with the username
     */
    protected abstract User getUser(String username, Message message);
}
