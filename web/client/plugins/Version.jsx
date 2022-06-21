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
// import Message from '../components/I18N/Message';
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
let show = false;
const onShow = (value) => {
    show = value;
};

const Version = connect((state) => ({
    version: versionSelector(state),
    onClose: toggleControl.bind(null, 'version', null),
    show
}
))(
    VersionDialog
);

export default {
    VersionPlugin: assign(Version, {
        SidebarMenu: {
            name: 'version',
            position: 7,
            priority: 1,
            doNotHide: true,
            tooltip: "version.label",
            text: "",
            icon: <Glyphicon glyph="share-alt" onClick={() => onShow(true)} />,
            action: toggleControl.bind(null, 'version', null),
            toggle: true
        }
    }),
    reducers: {
        version: require('../reducers/version').default
    }
};
