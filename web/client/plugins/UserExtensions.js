/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';
import { createPlugin } from '../utils/PluginsUtils';
import { Glyphicon } from 'react-bootstrap';

import Message from '../components/I18N/Message';

import { setControlProperty, toggleControl } from '../actions/controls';

import { createSelector } from 'reselect';
import get from 'lodash/get';
import DockPanel from '../components/misc/panels/DockPanel';
import ExtensionsPanel from './userExtensions/ExtensionsPanel';


const Extensions = ({
    active,
    onClose = () => { }
}) => (
    <DockPanel
        open={active}
        size={660}
        position="right"
        bsStyle="primary"
        title={<Message msgId="userExtensions.title" />}
        onClose={() => onClose()}
        glyph="plug"
        style={{ height: 'calc(100% - 30px)' }}>
        <ExtensionsPanel />
    </DockPanel>);

const ExtensionsPlugin = connect(
    createSelector([
        state => get(state, 'controls.userExtensions.enabled')
    ],
    (active, extensions) => ({ active, extensions })),
    {
        onClose: toggleControl.bind(null, 'userExtensions', 'enabled')
    }
)(Extensions);

export default createPlugin('UserExtensions', {
    component: ExtensionsPlugin,
    containers: {
        BurgerMenu: {
            name: 'userExtensions',
            position: 999,
            text: <Message msgId="userExtensions.title" />,
            icon: <Glyphicon glyph="plug" />,
            action: setControlProperty.bind(null, "userExtensions", "enabled", true, true),
            priority: 2,
            doNotHide: true
        }
    }
});
