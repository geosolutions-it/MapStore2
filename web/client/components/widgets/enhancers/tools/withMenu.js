/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Message = require('../../../I18N/Message');

const {withProps} = require('recompose');
const tooltip = require('../../../misc/enhancers/tooltip');

const isMenuItem = ({target, visible = true}) => visible && target === "menu";
const hasMenuItems = (tt = []) => tt.filter(isMenuItem).length > 0;
const {
    Glyphicon,
    ButtonToolbar,
    DropdownButton,
    MenuItem: MenuItemBS
} = require('react-bootstrap');
const MenuItem = tooltip(MenuItemBS);
/**
 * transform `widgetTools` property items with `target` = `menu` into a DropDown button to put in `topRightItems` for WidgetContainer, as a menu
 */
module.exports = ({ className = "widget-menu", menuIcon = "option-vertical"} = {}) =>
    withProps(({ widgetTools, topRightItems = []}) => ({
        topRightItems: hasMenuItems(widgetTools)
            ? [...topRightItems, (<ButtonToolbar>
                <DropdownButton pullRight bsStyle="default" className={className} title={<Glyphicon glyph={menuIcon} />} noCaret id="dropdown-no-caret">
                    {widgetTools.filter(isMenuItem).map(({ onClick = () => { }, disabled = false, glyph, glyphClassName, text, textId, tooltipId, active}, i) =>
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
                </DropdownButton>
            </ButtonToolbar>)]
            : topRightItems
    }));
