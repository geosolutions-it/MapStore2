/*
 *  Copyright (C) 2019 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.core.model;

import jakarta.xml.bind.JAXB;

import java.io.StringReader;
import java.io.StringWriter;

class Marshaler<T> {

    private final Class<T> _class;

    public Marshaler(Class<T> _class) {
        this._class = _class;
    }

    protected String marshal(T a) {
        StringWriter sw = new StringWriter();
        JAXB.marshal(a, sw);
        return sw.toString();
    }

    protected T unmarshal(String s) {
        StringReader sr = new StringReader(s);
        return JAXB.unmarshal(sr, _class);
    }
}
