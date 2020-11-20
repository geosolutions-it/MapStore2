/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import PropTypes from 'prop-types';

/**
 * Header of MapStore, rendered in the home page (big full-width image).
 * @name Header
 * @class
 * @memberof plugins
 * @prop {object} [style] the style for the main div.
 */
class Header extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        className: PropTypes.object
    };

    render() {
        return (
            <div style={this.props.style} className="mapstore-header" />
        );
    }
}

export default {
    HeaderPlugin: Header
};
