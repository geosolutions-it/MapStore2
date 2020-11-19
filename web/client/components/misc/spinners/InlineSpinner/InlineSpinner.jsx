/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {isFunction} from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import defaultIcon from './img/spinner.gif';

class InlineSpinner extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        loading: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
        icon: PropTypes.string
    };

    static defaultProps = {
        loading: false,
        icon: defaultIcon,
        className: "inline-spinner"
    };

    getDisplayStyle = () => {
        let loading;
        if (isFunction(this.props.loading)) {
            loading = this.props.loading(this.props);
        } else {
            loading = this.props.loading;
        }
        return loading ? 'inline-block' : 'none';
    };

    render() {
        return (
            <img className={this.props.className} src={this.props.icon} style={{
                display: this.getDisplayStyle(),
                margin: '4px',
                padding: 0,
                background: 'transparent',
                border: 0
            }} alt="..." />
        );
    }
}

export default InlineSpinner;
