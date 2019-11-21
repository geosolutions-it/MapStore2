/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { DropdownButton, FormControl, Glyphicon } from 'react-bootstrap';

export const ToolbarDropdownWithInputButton = ({
    value,
    onChange,
    glyph = '',
    pullRight = false,
    placeholder
}) => (
    <DropdownButton>
        <FormControl
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            pullRight={pullRight}
            title={<Glyphicon glyph={glyph}/>}
        />
    </DropdownButton>
);
