/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {Glyphicon, MenuItem} from 'react-bootstrap';
import {connect} from "react-redux";

import Message from '../../components/I18N/Message';
import { setControlProperty } from "../../actions/controls";
import {
    toggleMode
} from "../../actions/longitudinalProfile";
import {
    dataSourceModeSelector,
    isActiveMenuSelector,
    isInitializedSelector,
    isParametersOpenSelector
} from "../../selectors/longitudinalProfile";
import { isCesium } from '../../selectors/maptype';

/**
 * A DropDown menu for longitudinal profile
 */
const UserMenu = ({
    dataSourceMode,
    initialized,
    isParametersOpen,
    menuIsActive,
    showDrawOption,
    onActivateTool,
    onToggleParameters,
    onToggleSourceMode
}) => {
    const onToggleTool = useCallback((toolName) => () => {
        onActivateTool();
        onToggleSourceMode(toolName);
    }, []);
    const [open, setMenuOpen ] = useState(false);
    const body = (<>
        {showDrawOption ? <MenuItem active={dataSourceMode === 'draw'} key="draw" onClick={onToggleTool('draw')}>
            <Glyphicon glyph="pencil"/><Message msgId="longitudinalProfile.draw"/>
        </MenuItem> : null}
        <MenuItem active={dataSourceMode === 'import'} key="import" onClick={onToggleTool('import')}>
            <Glyphicon glyph="upload"/> <Message msgId="longitudinalProfile.import"/>
        </MenuItem>
        <MenuItem active={dataSourceMode === 'select'} key="select" onClick={onToggleTool('select')}>
            <Glyphicon glyph="1-layer"/> <Message msgId="longitudinalProfile.select"/>
        </MenuItem>
        <MenuItem key="divider" divider/>
        <MenuItem active={isParametersOpen} key="parameters" onClick={onToggleParameters}>
            <Glyphicon glyph="cog"/> <Message msgId="longitudinalProfile.parameters"/>
        </MenuItem>
    </>);

    // inside extra tools
    const Menu = (<> {
        open ? <>
            <div className="open dropup btn-group btn-group-tray" style={{ position: "absolute", display: "inline"}}>
                <ul role="menu" className="dropdown-menu dropdown-menu-right" aria-labelledby="longitudinal-tool">
                    {body}
                </ul>
            </div>
            <MenuItem active={menuIsActive || open} key="menu" onClick={() => setMenuOpen(!open)}>
                <Glyphicon glyph="1-line"/>
                <Message msgId="longitudinalProfile.title"/>
            </MenuItem></> :
            <MenuItem active={menuIsActive || open} key="menu" onClick={() => setMenuOpen(!open)}>
                <Glyphicon glyph="1-line"/>
                <Message msgId="longitudinalProfile.title"/>
            </MenuItem> }
    </>);

    return initialized ? Menu : false;
};

UserMenu.propTypes = {
    className: PropTypes.string,
    dataSourceMode: PropTypes.string,
    initialized: PropTypes.bool,
    isParametersOpen: PropTypes.bool,
    menuIsActive: PropTypes.bool,
    menuItem: PropTypes.bool,
    nav: PropTypes.bool,
    showDrawOption: PropTypes.bool,
    tooltipPosition: PropTypes.string,
    onActivateTool: PropTypes.func,
    onToggleParameters: PropTypes.func,
    onToggleSourceMode: PropTypes.func
};

UserMenu.defaultProps = {
    className: "square-button",
    menuIsActive: false,
    nav: false,
    showDrawOption: true,
    onActivateTool: () => {},
    onToggleParameters: () => {},
    onToggleSourceMode: () => {},
    tooltipPosition: 'left'
};

const MenuForBurger =  connect((state) => ({
    menuIsActive: isActiveMenuSelector(state),
    dataSourceMode: dataSourceModeSelector(state),
    isParametersOpen: isParametersOpenSelector(state),
    showDrawOption: !isCesium(state),
    initialized: isInitializedSelector(state)
}), {
    onActivateTool: setControlProperty.bind(null, "longitudinalProfileTool", "enabled", true),
    onToggleSourceMode: toggleMode,
    onToggleParameters: setControlProperty.bind(null, "LongitudinalProfileToolParameters", "enabled", true, true)
})(UserMenu);

export default MenuForBurger;
