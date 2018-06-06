/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
module.exports = () => (<div><h4>
    Drop your configuration or vector files here.</h4>
    <small>
        Supported configuration files: MapStore2 legacy format or JSON OWS context format<br />
        Supported vector layer files: shapefiles must be contained in zip archives, KML/KMZ or GPX
        </small>
    <hr />
    <small><i>
        current map will be overridden in case of configuration files
        </i></small></div>);
