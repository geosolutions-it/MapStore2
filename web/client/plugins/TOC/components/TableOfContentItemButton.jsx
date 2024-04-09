/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon, MenuItem } from 'react-bootstrap';
import Message from '../../../components/I18N/Message';
import tooltip from '../../../components/misc/enhancers/tooltip';
import ButtonMS from '../../../components/misc/Button';
const Button = tooltip(ButtonMS);

/**
 * Item component to provide consistent interface for menu items, toolbar and context menu
 * @prop {boolean} contextMenu show the component for context menu
 * @prop {function} onClick return the click event
 * @prop {string} label label for the context menu item
 * @prop {string} labelId label id for the context menu item
 * @prop {string} glyph icon name
 * @prop {object} buttonProps default options for buttons
 * @prop {string} tooltip label for the toolbar tooltip item
 * @prop {string} tooltipId label id for the toolbar tooltip item
 * @prop {boolean} active show active style for the component
 * @prop {object} style custom style
 * @prop {string} className custom class name
 * @prop {boolean} disabled disable component
 */
function TableOfContentItemButton({
    contextMenu,
    onClick,
    label,
    labelId,
    glyph,
    buttonProps,
    tooltipId,
    tooltip: tooltipProp,
    active,
    style,
    className,
    disabled,
    menuItem
}) {

    if (menuItem) {
        return (
            <MenuItem active={active} disabled={disabled} onClick={onClick}>
                {glyph ? <><Glyphicon glyph={glyph} /></> : null}
                {(labelId || tooltipId)
                    ?  <Message msgId={labelId || tooltipId}/>
                    : label || tooltip }
            </MenuItem>
        );
    }
    if (contextMenu) {
        return (
            <button className={active ? 'active' : ''} disabled={disabled} onClick={onClick}>
                {glyph ? <><Glyphicon glyph={glyph} /></> : null}
                {labelId ?  <Message msgId={labelId}/> : label}
            </button>
        );
    }
    return (
        <Button
            {...buttonProps}
            style={{
                ...buttonProps?.style,
                ...style
            }}
            className={[
                buttonProps?.className,
                className
            ].join(' ')}
            disabled={disabled}
            active={active}
            tooltipId={tooltipId}
            tooltip={tooltipProp}
            onClick={onClick}>
            <Glyphicon glyph={glyph} />
        </Button>
    );
}

export default TableOfContentItemButton;
