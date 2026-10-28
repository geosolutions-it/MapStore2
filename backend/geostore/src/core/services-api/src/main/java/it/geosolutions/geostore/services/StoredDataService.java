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
package it.geosolutions.geostore.services;

import it.geosolutions.geostore.core.model.StoredData;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;

import java.util.List;

/**
 * Interafce StoredDataService. Operations on {@link StoredData StoredData}s.
 *
 * @author Emanuele Tajariol (etj at geo-solutions.it)
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public interface StoredDataService extends SecurityService {

    /**
     * @param id
     * @param data
     * @return long
     * @throws NotFoundServiceEx
     */
    long update(long id, String data) throws NotFoundServiceEx;

    /**
     * @param id
     * @return boolean
     */
    boolean delete(long id);

    /**
     * @param id
     * @return StoredData
     * @throws NotFoundServiceEx
     */
    StoredData get(long id) throws NotFoundServiceEx;

    /**
     * @return List<StoredData>
     */
    List<StoredData> getAll();
}
