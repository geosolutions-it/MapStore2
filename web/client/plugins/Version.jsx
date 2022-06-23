/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Glyphicon } from 'react-bootstrap';
import { versionSelector } from '../selectors/version';
import { infoSelector } from '../selectors/controls';
import Message from '../components/I18N/Message';
import VersionDialog from '../components/Version/VersionDialog';
// import Button from '../../client/components/misc/Button';


import assign from 'object-assign';
import { toggleControl } from '../actions/controls';

/**
  * Version Plugin. Shows current MapStore2 version in settings panel
  * @class  Version
  * @memberof plugins
  * @static
  *
  */
const Version = connect((state) => ({
    version: versionSelector(state),
    show: infoSelector(state)
}
), {onClose: toggleControl.bind(null, 'info', null)})(
    VersionDialog
);

export default {
    VersionPlugin: assign(Version, {
        SidebarMenu: {
            name: 'info',
            position: 2,
            priority: 1,
            doNotHide: true,
            tooltip: "version.label",
            text: <Message msgId="version.label"/>,
            icon: <Glyphicon glyph="info-sign"/>,
            action: toggleControl.bind(null, 'info', null),
            toggle: true
        },
        BurgerMenu: {
            name: 'info',
            position: 1000,
            priority: 2,
            doNotHide: true,
            text: <Message msgId="version.label"/>,
            tooltip: "version.label",
            icon: <Glyphicon glyph="info-sign" />,
            action: toggleControl.bind(null, 'info', null)
        }
    }),
    reducers: {
        version: require('../reducers/version').default
    }
};
