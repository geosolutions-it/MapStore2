/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

var Logo = React.createClass({
    render() {
        return (<div>
            <img src="examples/home/img/mapstorelogo.png" className="mapstore-logo" />
            <img src="examples/home/img/MapStore2.png" className="mapstore-logo" />
        </div>);
    }
});

module.exports = Logo;
