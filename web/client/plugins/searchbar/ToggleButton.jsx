
/*
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Glyphicon } from 'react-bootstrap';

import { toggleControl } from '../../actions/controls';
import Button from '../../components/misc/Button';


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
        return <Button onClick={() => this.props.onToggle(this.props.pressed) } bsStyle={this.props.pressed ? "default" : "primary"} className={'square-button'}><Glyphicon glyph="search" /></Button>;
    }
}

export default connect((state) => ({
    pressed: state.controls && state.controls.search && state.controls.search.enabled || false
}), {
    onToggle: toggleControl.bind(null, 'search', null)
})(ToggleButton);
