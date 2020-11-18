import PropTypes from 'prop-types';

/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';


class Feature extends React.Component {
    static propTypes = {
        type: PropTypes.string,
        container: PropTypes.object, // TODO it must be a L.GeoJSON
        geometry: PropTypes.object
    };

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        return null;
    }
}

export default Feature;
