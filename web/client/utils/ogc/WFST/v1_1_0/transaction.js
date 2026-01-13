/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


export const transaction = (operations, schemaLocation) => '<wfs:Transaction '
    + 'service="WFS" '
    + 'version="1.1.0" '
    + 'xmlns:wfs="http://www.opengis.net/wfs" '
    + 'xmlns:gml="http://www.opengis.net/gml" '
    + 'xmlns:ogc="http://www.opengis.net/ogc" '
    + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
    + 'xsi:schemaLocation="http://www.opengis.net/wfs" '
    + `${schemaLocation}>`
    + `${operations.join("")}`
    + '</wfs:Transaction>';
