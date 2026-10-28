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

package it.geosolutions.geostore.core.dao;

import com.googlecode.genericdao.search.ISearch;

import java.util.List;

/**
 * Public interface to define a restricted set of operation wrt to ones defined in GenericDAO. This
 * may be useful if some constraints are implemented in the DAO, so that fewer point of access are
 * allowed.
 *
 * @author Emanuele Tajariol (etj at geo-solutions.it)
 */
public interface RestrictedGenericDAO<ENTITY> {

    public List<ENTITY> findAll();

    public ENTITY find(Long id);

    public void persist(ENTITY... entities);

    public ENTITY[] save(ENTITY... entities);

    public ENTITY merge(ENTITY entity);

    public boolean remove(ENTITY entity);

    public boolean removeById(Long id);

    public List<ENTITY> search(ISearch search);

    public int count(ISearch search);
}
