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
package it.geosolutions.geostore.services.rest.exception;

import jakarta.ws.rs.core.Response;

/**
 * Class ForbiddenErrorWebEx.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public class ForbiddenErrorWebEx extends GeoStoreWebEx {

    /** The Constant serialVersionUID. */
    private static final long serialVersionUID = 1523832654674590775L;

    public ForbiddenErrorWebEx(String message) {
        super(Response.Status.FORBIDDEN, message);
    }
}
