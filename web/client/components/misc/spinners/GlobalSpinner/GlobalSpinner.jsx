const PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Spinner = require('react-spinkit');
require('./css/GlobalSpinner.css');

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
        className: "ms2-loading",
        spinner: "circle"
    };

    render() {
        if (this.props.loading) {
            return (
                <div className={this.props.className} id={this.props.id}><Spinner noFadeIn overrideSpinnerClassName="spinner" spinnerName={this.props.spinner}/></div>
            );
        }
        return null;
    }
}

module.exports = GlobalSpinner;
