/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, {useState} from 'react';
import Select from 'react-select';
import {ControlLabel} from 'react-bootstrap';
import Message from '../I18N/Message';


const ConfigureThemes = ({
    themes,
    setSelectedTheme = () => {},
    selectedTheme = "default"
}) => {
    return (
        <div className="configure-themes-step">
            <div className="choose-theme">
                <ControlLabel><Message msgId="contextCreator.configureThemes.themes"/></ControlLabel>
                <Select
                    onChange={({value})  => setSelectedTheme(value)}
                    value={selectedTheme}
                    options={themes}
                    disabled={false}
                    noResultsText="contextCreator.configureThemes.noThemes"
                />
            </div>
        </div>);
};
export default ConfigureThemes;
