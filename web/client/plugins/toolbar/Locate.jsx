/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const LocateBtn = require('../../components/mapcontrols/locate/LocateBtn');
const Message = require('../../components/I18N/Message');

const Locate = React.createClass({
    propTypes: {
        isPanel: React.PropTypes.bool,
        help: React.PropTypes.object,
        changeHelpText: React.PropTypes.func,
        changeHelpwinVisibility: React.PropTypes.func
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    render() {
        return (
            <LocateBtn {...this.props} tooltip={<Message msgId="locate.tooltip"/>}/>
        );
    }
});
module.exports = Locate;
