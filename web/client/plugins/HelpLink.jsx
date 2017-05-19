/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const assign = require('object-assign');
const {Glyphicon} = require('react-bootstrap');

const Message = require('../components/I18N/Message');

module.exports = {
    HelpLinkPlugin: assign(class extends React.Component {
        render() {
            return null;
        }
    }, {
        BurgerMenu: {
            name: 'helplink',
            position: 1000,
            text: <Message msgId="help"/>,
            icon: <Glyphicon glyph="question-sign"/>,
            action: () => ({type: ''}),
            selector: () => ({href: 'docs', target: 'blank'}),
            priority: 2,
            doNotHide: true
        }
    }),
    reducers: {help: require('../reducers/help')}
};
