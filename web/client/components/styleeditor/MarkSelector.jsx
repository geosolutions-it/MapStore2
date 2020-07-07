/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Button as ButtonRB  } from 'react-bootstrap';
import Popover from './Popover';
import SVGPreview from './SVGPreview';
import wellKnownName from './config/wellKnownName';
import tooltip from '../misc/enhancers/tooltip';

const Button = tooltip(ButtonRB);


function MarkSelector({
    value,
    config = {},
    onChange = () => {}
}) {
    const { options = wellKnownName } = config;
    const selected = options.find(option => option.value === value);
    return (
        <Popover
            content={
                <div className="ms-mark-list">
                    <ul>
                        {options.map((option) => {
                            return (
                                <li
                                    key={option.value}>
                                    <Button
                                        className="ms-mark-preview"
                                        active={option.value === value}
                                        onClick={() => onChange(option.value)}>
                                        <SVGPreview {...option.preview}/>
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            }>
            <Button className="ms-mark-preview">
                {selected && <SVGPreview {...selected.preview}/>}
            </Button>
        </Popover>
    );
}

export default MarkSelector;
