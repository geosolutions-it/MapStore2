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
package it.geosolutions.httpproxy;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.hc.client5.http.classic.methods.HttpUriRequestBase;

import java.io.IOException;
import java.net.URL;
import java.util.Set;

/**
 * HostNameChecker class for hostname check.
 *
 * @author Tobia Di Pisa at tobia.dipisa@geo-solutions.it
 */
public class HostNameChecker implements ProxyCallback {

    ProxyConfig config;

    /**
     * @param config
     */
    public HostNameChecker(ProxyConfig config) {
        this.config = config;
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.httpproxy.ProxyCallback#onRequest(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
     */
    public void onRequest(HttpServletRequest request, HttpServletResponse response, URL url)
            throws IOException {
        Set<String> hostNames = config.getHostnameWhitelist();

        // ////////////////////////////////
        // Check the whitelist of hosts
        // ////////////////////////////////

        if (hostNames != null && !hostNames.isEmpty()) {
            String hostName = url.getHost();

            if (!hostNames.contains(hostName)) {
                throw new HttpErrorException(403, "Host Name " + hostName
                        + " is not among the ones allowed for this proxy");
            }
        }
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.httpproxy.ProxyCallback#onRemoteResponse(org.apache.commons.httpclient.HttpMethod)
     */
    public void onRemoteResponse(HttpUriRequestBase method) {
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.httpproxy.ProxyCallback#onFinish()
     */
    public void onFinish() {
    }

}
