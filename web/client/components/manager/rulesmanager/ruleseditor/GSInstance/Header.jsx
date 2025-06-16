/**
* Copyright 2025, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';

import Toolbar from '../../../../misc/toolbar/Toolbar';
import { NavItem, Nav } from 'react-bootstrap';
import Message from '../../../../I18N/Message';

export default ({
    onNavChange = () => {},
    onExit = () => {},
    disableSave = true,
    onSave = () => {},
    activeTab = "1",
    loading = false
}) => {
    const buttons = [{
        glyph: '1-close',
        tooltipId: 'rulesmanager.tooltip.closeGSInstance',
        onClick: onExit,
        disabled: loading
    },
    {
        glyph: 'floppy-disk',
        tooltipId: 'rulesmanager.tooltip.saveGSInstance',
        onClick: onSave,
        disabled: disableSave || loading
    }];
    return (<div className="ms-panel-header-container">
        <div className="ms-toolbar-container">
            <Toolbar btnDefaultProps={{ className: 'square-button-md', bsStyle: 'primary', tooltipPosition: 'bottom'}} buttons={buttons}/>
        </div>
        <div className={`loading-header ${loading ? 'ms-circle-loader-md' : ''}`}/>
        <Nav bsStyle="tabs" activeKey={activeTab} justified onSelect={onNavChange}>
            <NavItem eventKey="1" ><Message msgId={"rulesmanager.navItems.mainGSInstance"}/></NavItem>
        </Nav>
    </div>);
};
