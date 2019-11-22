const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const Page = require('../../containers/Page');

const {resetControls} = require('../../actions/controls');


require('../assets/css/manager.css');

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

module.exports = connect((state) => {
    return {
        mode: 'desktop',
        messages: state.locale && state.locale.messages || {}
    };
}, {
    reset: resetControls
})(Manager);
