const PropTypes = require('prop-types');
/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');

const Message = require('../components/I18N/Message');

/**
  * Version Plugin. Shows current MapStore2 version
  * @class  Version
  * @memberof plugins
  * @static
  *
  */
const Version = connect((state) => ({
    version: state.version && state.version.current
}))(
class extends React.Component {
    static propTypes = {
        version: PropTypes.string
    };

    static defaultProps = {
        version: 'DEV'
    };

    render() {
        return <span className="application-version"><span className="application-version-label"><Message msgId="version.label"/></span>: {this.props.version}</span>;
    }
});

const assign = require('object-assign');

class Empty extends React.Component {
    render() {
        return null;
    }
}

module.exports = {
    VersionPlugin: assign(Empty, {
        Settings: {
            tool: <Version key="version"/>,
            position: 4
        }
    }),
    reducers: {
        version: require('../reducers/version')
    }
};
