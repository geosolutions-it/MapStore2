/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const Message = require('../../components/I18N/Message');
const ToggleButton = require('../../components/buttons/ToggleButton');

const Info = React.createClass({
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
            <ToggleButton
                {...this.props}
                isButton={true}
                glyphicon="info-sign"
                helpText={<Message msgId="helptexts.infoButton"/>}/>
        );
    }
});
module.exports = Info;
