/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {
    ButtonToolbar,
    DropdownButton,
    Glyphicon,
    MenuItem as MenuItemBS
} from 'react-bootstrap';
import {withProps} from 'recompose';

import  Message from '../../../I18N/Message';
import  tooltip from '../../../misc/enhancers/tooltip';

const isMenuItem = ({target, visible = true}) => visible && target === "menu";
const hasMenuItems = (tt = []) => tt.filter(isMenuItem).length > 0;

const MenuItem = tooltip(MenuItemBS);

/**
 * transform `widgetTools` property items with `target` = `menu` into a DropDown button to put in `topRightItems` for WidgetContainer, as a menu
 */
export default ({ className = "widget-menu", menuIcon = "option-vertical"} = {}) =>
    withProps(({ widgetTools, topRightItems = [], items = [], layer, id, map, widgetType }) => ({
        topRightItems: hasMenuItems(widgetTools)
            ? [...topRightItems, (
                <ButtonToolbar>
                    <DropdownButton pullRight bsStyle="default" className={className} title={<Glyphicon glyph={menuIcon} />} noCaret id="dropdown-no-caret">
                        {widgetTools.filter(isMenuItem)
                            .map(({ onClick = () => { }, disabled = false, glyph, glyphClassName, text, textId, tooltipId, active}, i) =>
                                <MenuItem
                                    active={active}
                                    tooltipId={tooltipId}
                                    onSelect={onClick}
                                    disabled={disabled}
                                    eventKey={i}>
                                    <Glyphicon className={glyphClassName} glyph={glyph} />
                                    {textId ? <Message msgId={textId} /> : text}
                                </MenuItem>)
                        }
                        {items.map((item) =>
                            <item.Component
                                key={item.name}
                                layer={layer}
                                widgetId={id}
                                map={map}
                                widgetType={widgetType}
                                itemComponent={(props) => (
                                    <MenuItem {...props}>
                                        <Glyphicon glyph={props.glyph} />
                                        <Message msgId={props.textId} />
                                    </MenuItem>)
                                } />)}
                    </DropdownButton>
                </ButtonToolbar>)]
            : topRightItems
    }));
