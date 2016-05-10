/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require('react');

const {goToPage} = require('../../actions/router');

const Message = require('../locale/Message');

const {Glyphicon} = require('react-bootstrap');

const HelpTextPanel = require('../help/HelpTextPanel');

module.exports = (context) => ([{
    name: 'home',
    position: 1,
    tooltip: "gohome",
    icon: <Glyphicon glyph="home"/>,
    help: <Message msgId="helptexts.gohome"/>,
    action: goToPage.bind(null, '/', context.router)
}, {
    name: 'help',
    position: 1000,
    icon: <Glyphicon glyph="question-sign"/>,
    tooltip: "help",
    toggle: true,
    panel: HelpTextPanel
}]);
