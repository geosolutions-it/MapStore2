/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var Map = require('../../components/leaflet/map');

React.render(<Map center={{lat: 43.9,lng: 10.3}} zoom={11}/>, document.body);