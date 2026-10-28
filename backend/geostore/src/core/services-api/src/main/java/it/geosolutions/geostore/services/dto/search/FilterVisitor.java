/*
 *  Copyright (C) 2007 - 2025 GeoSolutions S.A.S.
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

import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.InternalErrorServiceEx;

/**
 * Interface FilterVisitor.
 *
 * @author ETj (etj at geo-solutions.it)
 */
public interface FilterVisitor {

    void visit(AndFilter filter) throws BadRequestServiceEx, InternalErrorServiceEx;

    void visit(AttributeFilter filter) throws BadRequestServiceEx, InternalErrorServiceEx;

    void visit(CategoryFilter filter) throws InternalErrorServiceEx;

    void visit(AssociatedEntityFilter filter);

    void visit(GroupFilter filter);

    void visit(FieldFilter filter) throws InternalErrorServiceEx;

    void visit(NotFilter filter) throws BadRequestServiceEx, InternalErrorServiceEx;

    void visit(OrFilter filter) throws BadRequestServiceEx, InternalErrorServiceEx;
}
