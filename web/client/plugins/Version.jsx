/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { versionSelector } from '../selectors/version';
import Message from '../components/I18N/Message';

/**
  * Version Plugin. Shows current MapStore2 version in settings panel
  * @class  Version
  * @memberof plugins
  * @static
  *
  */
const Version = connect((state) => ({
    version: versionSelector(state)
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

import assign from 'object-assign';

class Empty extends React.Component {
    render() {
        return null;
    }
}

export default {
    VersionPlugin: assign(Empty, {
        Settings: {
            tool: <Version key="version"/>,
            position: 4
        }
    }),
    reducers: {
        version: require('../reducers/version').default
    }
};
