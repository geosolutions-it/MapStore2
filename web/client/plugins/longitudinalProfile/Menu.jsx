/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {DropdownButton, Glyphicon, MenuItem, NavDropdown} from 'react-bootstrap';
import {connect} from "react-redux";

import Message from '../../components/I18N/Message';
import tooltip from '../../components/misc/enhancers/tooltip';
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

const TNavDropdown = tooltip(NavDropdown);
const TDropdownButton = tooltip(DropdownButton);

/**
 * A DropDown menu for longitudinal profile
 */
const UserMenu = ({
    className,
    dataSourceMode,
    initialized,
    isParametersOpen,
    menuIsActive,
    nav,
    showDrawOption,
    tooltipPosition,
    onActivateTool,
    onToggleParameters,
    onToggleSourceMode
}) => {
    let DropDown = nav ? TNavDropdown : TDropdownButton;

    const onToggleTool = useCallback((toolName) => () => {
        onActivateTool();
        onToggleSourceMode(toolName);
    }, []);

    return initialized ? (
        <React.Fragment>
            <DropDown

                id="longitudinal-tool"
                className={className}
                pullRight
                bsStyle={menuIsActive ? "primary" : "tray"}
                title={<Glyphicon glyph="1-line"/>}
                tooltipId="longitudinalProfile.title"
                tooltipPosition={tooltipPosition}
                noCaret
            >
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
            </DropDown>
        </React.Fragment>
    ) : false;
};

UserMenu.propTypes = {
    className: PropTypes.string,
    dataSourceMode: PropTypes.string,
    initialized: PropTypes.bool,
    isParametersOpen: PropTypes.bool,
    menuIsActive: PropTypes.bool,
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

const UserMenuConnected =  connect((state) => ({
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

export default UserMenuConnected;
