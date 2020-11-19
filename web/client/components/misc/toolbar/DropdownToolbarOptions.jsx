/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { Glyphicon, DropdownButton, MenuItem } from 'react-bootstrap';

import tooltip from '../enhancers/tooltip';
import React from 'react';
import uuidv1 from 'uuid/v1';

const DropdownButtonT = tooltip(DropdownButton);

/**
 * options for buttonConfig = {
 *        disabled: false,
 *        tooltipId,
 *        className: "square-button-md",
 *        glyph,
 *        noCaret: true,
 *        title: <Glyphicon glyph={glyph}/>,
 *        bsStyle: "primary",
 *        idDropDown: uuidv1()
 *    }
*/

const defaultButtonConfig = {
    disabled: false,
    className: "square-button-md",
    noCaret: true,
    idDropDown: uuidv1()
};

const DropdownFeatureType = ({
    menuOptions = [],
    buttonConfig = {}
} = {}) => (
    <DropdownButtonT {...defaultButtonConfig} {...buttonConfig}>
        {menuOptions.length ? menuOptions.map(({glyph, text, onClick, active = false}, i) => (
            <MenuItem active={active} eventKey={i} onClick={onClick} key={i}>
                {glyph && <Glyphicon glyph={glyph}/>} {text}
            </MenuItem>)) : null}
    </DropdownButtonT>
);
export default DropdownFeatureType;
