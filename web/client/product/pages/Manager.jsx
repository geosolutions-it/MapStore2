/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {resetControls} from '../../actions/controls';
import Page from '../../containers/Page';

import('../assets/css/manager.css');

/**
  * @name Manager
  * @memberof pages
  * @class
  * @classdesc
  * This is the main container page for user administration page.
  * it is a container for the Manager plugins.
  *
  */
class Manager extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        reset: PropTypes.func,
        plugins: PropTypes.object
    };

    static contextTypes = {
        router: PropTypes.object
    };

    static defaultProps = {
        mode: 'desktop',
        reset: () => {}
    };

    componentDidMount() {
        this.props.reset();
    }

    render() {
        return (<Page
            id="manager"
            className="manager"
            plugins={this.props.plugins}
            params={this.props.match.params}
        />);
    }
}

export default connect((state) => {
    return {
        mode: 'desktop',
        messages: state.locale && state.locale.messages || {}
    };
}, {
    reset: resetControls
})(Manager);
