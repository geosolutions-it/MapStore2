/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Spinner = require('react-spinkit');

const GlobalSpinner = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        loading: React.PropTypes.bool,
        className: React.PropTypes.string,
        spinner: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            id: "mapstore-globalspinner",
            loading: false,
            className: "mapstore-globalspinner",
            spinner: "circle"
        };
    },
    render() {
        if (this.props.loading) {
            return (
                <div className={this.props.className} id={this.props.id}><Spinner noFadeIn spinnerName={this.props.spinner}/></div>
            );
        }
        return null;
    }
});

module.exports = GlobalSpinner;
