/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {Glyphicon} from 'react-bootstrap';
import {get} from 'lodash';

import { createPlugin } from '../utils/PluginsUtils';
import Message from '../components/I18N/Message';
import help from '../reducers/help';

/**
 *  HelpLink is a plugin that navigates the user to the online documentation.
 *  It gets displayed into the BurgerMenu plugin.
 *  @name HelpLink
 *  @memberof plugins
 *  @class
 *  @prop {string} docsUrl default https://mapstore.readthedocs.io/en/latest/. Link to the online documentation.
 *  @example
 *  // If you, as an admin, want to specify the link to the docs when creating or editing a context, you can configure the HelpLink plugin, as shown below:
 *  {
 *    "docsUrl": "https://your-path"
 *  }
 */

export default createPlugin('HelpLink', {
    component: () => null,
    reducers: { help },
    containers: {
        BurgerMenu: {
            name: 'helplink',
            position: 1100,
            text: <Message msgId="docs"/>,
            icon: <Glyphicon glyph="question-sign"/>,
            action: () => ({type: ''}),
            selector: (state, ownProps) => {
                const docsUrl = get(ownProps, 'docsUrl', 'https://mapstore.readthedocs.io/en/latest/');
                return {href: docsUrl, target: 'blank'};
            },
            priority: 2,
            doNotHide: true
        }
    }
});

