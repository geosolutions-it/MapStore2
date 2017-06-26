const PropTypes = require('prop-types');
/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const {Button, Glyphicon} = require('react-bootstrap');
const {toggleControl} = require('../../actions/controls');

class ToggleButton extends React.Component {
    static propTypes = {
        pressed: PropTypes.bool,
        onToggle: PropTypes.func
    };

    static defaultProps = {
        pressed: false,
        onToggle: () => {}
    };

    render() {
        return <Button onClick={() => this.props.onToggle(this.props.pressed) } bsStyle={this.props.pressed ? "default" : "primary"} className="square-button search-toggle"><Glyphicon glyph="search" /></Button>;
    }
}

module.exports = connect((state) => ({
    pressed: state.controls && state.controls.search && state.controls.search.enabled || false
}), {
    onToggle: toggleControl.bind(null, 'search', null)
})(ToggleButton);
