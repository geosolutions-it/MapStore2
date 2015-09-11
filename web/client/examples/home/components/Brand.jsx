/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

var Brand = React.createClass({
    render() {
        return (<div>
            <a href="http://www.geo-solutions.it">
                <img src="examples/home/img/geosolutions-brand.png" className="mapstore-logo"/>
            </a>
        </div>);
    }
});

module.exports = Brand;
