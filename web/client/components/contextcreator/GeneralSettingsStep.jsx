/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import Message from '../I18N/Message';
import {FormGroup, ControlLabel, FormControl, Glyphicon} from 'react-bootstrap';
import * as LocaleUtils from '../../utils/LocaleUtils';

export default ({contextName = "", windowTitle = "", onChange = () => {}, context = {}}) => (
    <div className="general-settings-step">
        <div style={{ margin: 'auto' }}>
            <div className="text-center">
                <Glyphicon glyph="wrench" style={{ fontSize: 128 }}/>
            </div>
            <h1 className="text-center"><Message msgId="contextCreator.generalSettings.title"/></h1>
            <FormGroup>
                <ControlLabel>
                    <Message msgId="contextCreator.generalSettings.name"/>
                </ControlLabel>
                <FormControl
                    type="text"
                    value={contextName}
                    placeholder={LocaleUtils.getMessageById(context.messages, "contextCreator.generalSettings.namePlaceholder")}
                    onChange={e => onChange('name', e.target.value && e.target.value.replace(/[^a-zA-Z0-9\-_]/, ''))}/>
            </FormGroup>
            <FormGroup>
                <ControlLabel>
                    <Message msgId="contextCreator.generalSettings.windowTitle"/>
                </ControlLabel>
                <FormControl
                    type="text"
                    value={windowTitle}
                    placeholder={LocaleUtils.getMessageById(context.messages, "contextCreator.generalSettings.windowTitlePlaceholder")}
                    onChange={e => onChange('windowTitle', e.target.value)}/>
            </FormGroup>
        </div>
    </div>
);
