/*
 *  Copyright (C) 2007 - 2016 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.dto.search;

import jakarta.xml.bind.annotation.XmlType;

/**
 * Enum SearchOperator.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
@XmlType
public enum SearchOperator {
    GREATER_THAN_OR_EQUAL_TO,
    GREATER_THAN,

    LESS_THAN,
    LESS_THAN_OR_EQUAL_TO,

    EQUAL_TO,

    LIKE,
    ILIKE,

    IS_NULL,
    IS_NOT_NULL,

    IN
}
