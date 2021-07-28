/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import ReactSelect from 'react-select';
import {ControlLabel, Glyphicon} from 'react-bootstrap';
import Message from '../I18N/Message';
import localizedProps from '../misc/enhancers/localizedProps';
const Select = localizedProps("noResultsText")(ReactSelect);
import { getMessageById } from '../../utils/LocaleUtils';

const ConfigureThemes = ({
    themes = [],
    setSelectedTheme = () => {},
    selectedTheme = {},
    disabled = false,
    context = {}
}) => {
    return (
        <div className="configure-themes-step">
            <div className="choose-theme">
                <div className="text-center">
                    <Glyphicon glyph="dropper" style={{ fontSize: 128 }}/>
                </div>
                <h1 className="text-center"><Message msgId="contextCreator.configureThemes.title"/></h1>
                <ControlLabel><Message msgId="contextCreator.configureThemes.themes"/></ControlLabel>
                <Select
                    clearable
                    onChange={(option)  => setSelectedTheme(option?.theme)}
                    value={selectedTheme?.id}
                    options={themes.map(theme => ({ value: theme.id, label: theme?.label && getMessageById(context, theme?.label) || theme?.id, theme }))}
                    disabled={disabled}
                    noResultsText="contextCreator.configureThemes.noThemes"
                />
            </div>
        </div>);
};
export default ConfigureThemes;
