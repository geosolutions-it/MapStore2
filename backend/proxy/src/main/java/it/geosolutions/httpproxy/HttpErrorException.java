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

import java.io.IOException;

/**
 * Used to force the proxy response to contain a certain status code and error message
 * 
 * @author Andrea Aime - GeoSolutions
 */
public class HttpErrorException extends IOException {

    /**
     * Serialization UID.
     */
    private static final long serialVersionUID = 2802909311238947185L;

    private int code;

    private String message;

    public HttpErrorException(int code, String message) {
        this.code = code;
        this.message = message;
    }

    /**
     * The response status code
     * 
     * @return
     */
    public int getCode() {
        return code;
    }

    /**
     * The response message
     */
    public String getMessage() {
        return message;
    }
}
