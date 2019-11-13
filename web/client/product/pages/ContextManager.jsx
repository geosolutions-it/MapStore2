/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Page from '../../containers/Page';
import {resetControls} from '../../actions/controls';

import '../assets/css/manager.css';

class ContextManager extends React.Component {
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
            id="context-manager"
            className="manager"
            plugins={this.props.plugins}
            params={this.props.match.params}
        />);
    }
}

export default connect(() => ({
    mode: 'desktop'
}), {
    reset: resetControls
})(ContextManager);
