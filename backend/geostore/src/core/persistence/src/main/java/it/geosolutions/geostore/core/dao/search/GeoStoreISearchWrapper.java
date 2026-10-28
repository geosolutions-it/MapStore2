/*
 *  Copyright (C) 2007 - 2022 GeoSolutions S.A.S.
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

package it.geosolutions.geostore.core.dao.search;

import com.googlecode.genericdao.search.Field;
import com.googlecode.genericdao.search.Filter;
import com.googlecode.genericdao.search.ISearch;
import com.googlecode.genericdao.search.Sort;

import java.util.List;

/** A wrapper for an ISearch. It is meant to provide the callerContext as a Class. */
public class GeoStoreISearchWrapper implements ISearch {

    private ISearch delegate;

    private Class<?> callerContext;

    public GeoStoreISearchWrapper(ISearch delegate, Class<?> callerContext) {
        this.delegate = delegate;
        this.callerContext = callerContext;
    }

    @Override
    public int getFirstResult() {
        return delegate.getFirstResult();
    }

    @Override
    public int getMaxResults() {
        return delegate.getMaxResults();
    }

    @Override
    public int getPage() {
        return delegate.getPage();
    }

    @Override
    public Class<?> getSearchClass() {
        return delegate.getSearchClass();
    }

    @Override
    public List<Filter> getFilters() {
        return delegate.getFilters();
    }

    @Override
    public boolean isDisjunction() {
        return delegate.isDisjunction();
    }

    @Override
    public List<Sort> getSorts() {
        return delegate.getSorts();
    }

    @Override
    public List<Field> getFields() {
        return delegate.getFields();
    }

    @Override
    public boolean isDistinct() {
        return delegate.isDistinct();
    }

    @Override
    public List<String> getFetches() {
        return delegate.getFetches();
    }

    @Override
    public int getResultMode() {
        return delegate.getResultMode();
    }

    /**
     * @return the caller context if present, null otherwise.
     */
    public Class<?> getCallerContext() {
        return callerContext;
    }
}
