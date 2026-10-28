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
import org.apache.hc.core5.http.Header;

import java.io.IOException;
import java.net.URL;
import java.util.Locale;
import java.util.Set;

/**
 * MimeTypeChecker class for the mimetype check.
 *
 * @author Andrea Aime - GeoSolutions
 *
 */
public class MimeTypeChecker implements ProxyCallback {

    ProxyConfig config;

    /**
     * @param config
     */
    public MimeTypeChecker(ProxyConfig config) {
        this.config = config;
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.httpproxy.ProxyCallback#onRequest(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
     */
    public void onRequest(HttpServletRequest request, HttpServletResponse response, URL url) {
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.httpproxy.ProxyCallback#onRemoteResponse(org.apache.commons.httpclient.HttpMethod)
     */
    public void onRemoteResponse(HttpUriRequestBase method) {
        // The check needs the remote response, see onRemoteResponse(method, response).
    }

    /**
     * When {@code checkResponseContentType} is true, refuses a remote response whose Content-Type
     * is not in mimetypeWhitelist, before any of it reaches the client. Types are compared without
     * parameters, case or surrounding spaces; a response without a Content-Type is not refused.
     */
    @Override
    public void onRemoteResponse(HttpUriRequestBase method, ClassicHttpResponse response) throws IOException {
        if (!config.isCheckResponseContentType()) {
            return;
        }
        Set<String> mimeTypes = config.getMimetypeWhitelist();
        Header header = response.getFirstHeader("Content-Type");
        if (mimeTypes == null || mimeTypes.isEmpty() || header == null) {
            return;
        }

        String type = mediaType(header.getValue());
        boolean allowed = mimeTypes.stream().map(MimeTypeChecker::mediaType).anyMatch(type::equals);
        if (!allowed) {
            throw new HttpErrorException(403, "Content-type " + type
                    + " is not among the ones allowed for this proxy");
        }
    }

    /** The media type without parameters, lower-cased: {@code "Text/XML; charset=UTF-8"} gives {@code "text/xml"}. */
    static String mediaType(String contentType) {
        return contentType.split(";", 2)[0].trim().toLowerCase(Locale.ROOT);
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.httpproxy.ProxyCallback#onFinish()
     */
    public void onFinish() {
    }

}
