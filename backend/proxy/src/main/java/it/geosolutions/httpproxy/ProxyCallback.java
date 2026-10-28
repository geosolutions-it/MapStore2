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
import org.apache.hc.core5.http.ClassicHttpResponse;

import java.io.IOException;
import java.net.URL;

/**
 * A pluggable callback that can perform checks or alter the request.
 *
 * @author Andrea Aime - GeoSolutions
 */
public interface ProxyCallback {

    /**
     * First to be called, can be used to initialize the callback status and disallow certain requests by throwing an {@link HttpErrorException}
     *
     * @throws IOException
     */
    void onRequest(HttpServletRequest request, HttpServletResponse response, URL url)
            throws IOException;

    /**
     * Second to be called, can be used to check the remote server response
     *
     * @param method
     * @throws IOException
     */
    void onRemoteResponse(HttpUriRequestBase method) throws IOException;

    /**
     * Second to be called, with the response received from the remote server, before any of it is
     * sent to the client. Throwing an {@link HttpErrorException} refuses the response. The default
     * calls {@link #onRemoteResponse(HttpUriRequestBase)}.
     *
     * @param method the request sent to the remote server
     * @param response the response received from it
     * @throws IOException
     */
    default void onRemoteResponse(HttpUriRequestBase method, ClassicHttpResponse response) throws IOException {
        onRemoteResponse(method);
    }

    /**
     * Called when the request is fully proxied, can be used for cleanup actions
     *
     * @throws IOException
     */
    void onFinish() throws IOException;
}
