/*
 *  Copyright (C) 2016 GeoSolutions S.A.S.
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

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author Emanuele Tajariol (etj at geo-solutions.it)
 */
public class DataURIDecoder {
    public static final String DEFAULT_MEDIA_TYPE = "text/plain";
    public static final String DEFAULT_CHARSET = "US-ASCII";
    final String DATA_URI_REGEX =
            "data:((?<mediatype>(?<mime>\\w+)/(?<extension>\\w+));)?(charset=(?<charset>[\\w\\s]+);)?(?<encoding>\\w+)?";
    private final boolean valid;

    private String mediatype;
    private String charset;
    private String encoding;

    private boolean base64Encoded;

    public DataURIDecoder(String header) {
        Matcher matcher = Pattern.compile(DATA_URI_REGEX).matcher(header);

        if (matcher.matches()) {
            valid = true;

            mediatype = matcher.group("mediatype");
            charset = matcher.group("charset");
            encoding = matcher.group("encoding");

            base64Encoded = "base64".equals(encoding);
        } else {
            valid = false;
        }
    }

    public boolean isValid() {
        return valid;
    }

    public String getMediatype() {
        return mediatype;
    }

    public String getCharset() {
        return charset;
    }

    public String getEncoding() {
        return encoding;
    }

    public boolean isBase64Encoded() {
        return base64Encoded;
    }

    public String getNormalizedMediatype() {
        return mediatype != null ? mediatype : DEFAULT_MEDIA_TYPE;
    }
}
