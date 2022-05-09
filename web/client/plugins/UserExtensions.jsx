/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from "prop-types";
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import get from 'lodash/get';

import { Glyphicon } from 'react-bootstrap';

import Message from '../components/I18N/Message';
import ExtensionsPanel from './userExtensions/ExtensionsPanel';
import { createPlugin } from '../utils/PluginsUtils';

import { setControlProperty, toggleControl } from '../actions/controls';
import * as epics from '../epics/userextensions';
import {mapLayoutValuesSelector} from "../selectors/maplayout";
import ResponsivePanel from "../components/misc/panels/ResponsivePanel";


class Extensions extends React.Component {
    static propTypes = {
        active: PropTypes.bool,
        onClose: PropTypes.func,
        dockStyle: PropTypes.object,
        size: PropTypes.number
    }

    static defaultProps = {
        active: false,
        onClose: () => {},
        dockStyle: {},
        size: 550
    }

    render() {
        let {
            active,
            onClose,
            dockStyle,
            size
        } = this.props;
        return (
            <ResponsivePanel
                containerStyle={this.props.dockStyle}
                containerId="user-extensions-container"
                containerClassName="dock-container"
                open={active}
                size={size}
                position="right"
                bsStyle="primary"
                title={<Message msgId="userExtensions.title"/>}
                onClose={() => onClose()}
                glyph="plug"
                style={dockStyle}
            >
                <ExtensionsPanel/>
            </ResponsivePanel>
        );
    }
}

const ExtensionsPlugin = connect(
    createSelector(
        state => get(state, 'controls.userExtensions.enabled'),
        state => mapLayoutValuesSelector(state, { height: true, right: true }, true),
        (active, dockStyle) => ({
            active,
            dockStyle
        })),
    {
        onClose: toggleControl.bind(null, 'userExtensions', 'enabled')
    }
)(Extensions);

/**
 * Shows the optional plugins list to activate/deactivate.
 * It is made to be used in map contexts, where some plugins has been configured
 * as optional, selectable by the user.
 * The list of plugins to activate/deactivate is accessible from the {@link #plugins.BurgerMenu|BurgerMenu}
 * @name UserExtensions
 * @class
 * @memberof plugins
 */
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
        },
        SidebarMenu: {
            name: 'userExtensions',
            position: 999,
            tooltip: "userExtensions.title",
            icon: <Glyphicon glyph="plug" />,
            text: <Message msgId="userExtensions.title" />,
            action: setControlProperty.bind(null, "userExtensions", "enabled", true, true),
            priority: 1,
            doNotHide: true,
            toggle: true
        }
    },
    epics
});
