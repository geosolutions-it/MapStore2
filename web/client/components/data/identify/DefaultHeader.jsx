/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';

class DefaultHeader extends React.Component {
    static propTypes = {
        title: PropTypes.string
    };

    render() {
        return <span> <span>{this.props.title}</span> </span>;
    }
}

export default DefaultHeader;
