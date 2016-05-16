/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const My = React.createClass({
    render() {
        return (<span>Hello!</span>);
    }
});

module.exports = {
    MyPlugin: My,
    reducers: {my: require('../reducers/my')}
};
