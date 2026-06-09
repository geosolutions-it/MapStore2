/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';
import Spinner from '../../../layout/Spinner';

class GlobalSpinner extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        loading: PropTypes.bool,
        className: PropTypes.string,
        spinner: PropTypes.string
    };

    static defaultProps = {
        id: "mapstore-globalspinner",
        loading: false,
        className: "ms2-loading square-button btn-primary",
        spinner: "circle"
    };

    render() {
        if (this.props.loading) {
            return (
                <div className={this.props.className} id={this.props.id}>
                    <Spinner />
                </div>
            );
        }
        return null;
    }
}

export default GlobalSpinner;
