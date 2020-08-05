
/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from "react";
import { DropdownButton as DropdownButtonRB, Glyphicon, MenuItem } from 'react-bootstrap';
import tooltip from '../../misc/enhancers/buttonTooltip';
import find from 'lodash/find';
import isNil from 'lodash/isNil';
import isFunction from 'lodash/isFunction';
import isEqual from 'lodash/isEqual';

const DropdownButton = tooltip(DropdownButtonRB);

/**
 * Dropdown button for Toolbar component
 */
export default function ToolbarDropdownButton({
    value,
    options = [],
    onSelect = () => {},
    glyph = '',
    tooltipId,
    pullRight = false,
    className = 'square-button-md no-border',
    disabled,
    noTooltipWhenDisabled = false,
    hideMenuItem = () => false,
    shouldClose
}) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(false);
    const currentOption = (find(options, (option) => isEqual(option.value, value)) || { });
    const {
        glyph: glyphOption
    } = currentOption;

    // hide dropdown when disabled
    useEffect(() => {
        if (disabled) {
            setOpen(false);
        }
    }, [ disabled ]);

    return (
        <DropdownButton
            noCaret
            open={open}
            noTooltipWhenDisabled={noTooltipWhenDisabled}
            tooltipId={tooltipId}
            pullRight={pullRight}
            className={className}
            disabled={disabled}
            title={<Glyphicon glyph={glyphOption || glyph}/>}
            onToggle={(isOpen, event, eventDetails) => {
                if (active
                || eventDetails?.source === 'select'
                || shouldClose && !shouldClose(value, event)) {
                    return null;
                }
                return setOpen(isOpen);
            }}>
            {options.map((option = {}) => {
                const Component = option?.Component || MenuItem;
                return hideMenuItem(value, option)
                    ? null
                    : (
                        <Component
                            key={option.value}
                            selected={value}
                            value={option.value}
                            active={isFunction(option?.isActive) && option.isActive(value)
                            || !isNil(value) && value === option.value}
                            onClick={option?.Component ? onSelect : () => onSelect(option.value)}
                            onActive={(isActive) => setActive(isActive)}>
                            {option.label}
                        </Component>
                    );
            })}
        </DropdownButton>
    );
}
