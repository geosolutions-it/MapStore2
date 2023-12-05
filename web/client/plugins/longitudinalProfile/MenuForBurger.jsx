/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import Overlay from '../../components/misc/Overlay';

import {Glyphicon, MenuItem, Popover} from 'react-bootstrap';
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

    const [open, setMenuOpen ] = useState(false);
    useEffect(() => {
        const burgerButton = document.querySelector("#mapstore-burger-menu-container");
        burgerButton?.addEventListener("click", () => {
            setMenuOpen(false);
        });
        return () => {
            setMenuOpen(false);
        };
    }, []);
    const onToggleTool = useCallback((toolName) => () => {
        onActivateTool();
        setMenuOpen(false);
        onToggleSourceMode(toolName);
    }, []);
    const ref = useRef();
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
    const Menu = (<>
        {open && <Overlay
            show={open}
            target={ref.current}
            placement="left"
            container={this}
            containerPadding={20}
        >
            <Popover id="longitudinal-profile-burger-menu" placement="left" style={{margin: 0, padding: 0}}>
                <div className="dropdown-menu open" style={{display: "block", position: "relative"}}>
                    {body}
                </div>
            </Popover>
        </Overlay>
        }
        <MenuItem ref={ref} active={menuIsActive || open} key="menu" onClick={() => { setMenuOpen(!open);}}>
            <Glyphicon glyph="1-line"/>
            <Message msgId="longitudinalProfile.title"/>
        </MenuItem>
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
