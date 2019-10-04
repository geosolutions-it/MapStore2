/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const Toolbar = require('../../../misc/toolbar/Toolbar');
const {NavItem, Nav} = require('react-bootstrap');
const Message = require('../../../I18N/Message');
const {areDetailsActive} = require("../../../../utils/RulesEditor");
module.exports = ({layer, rule = {}, onNavChange = () => {}, onExit = () => {}, disableSave = true, disableDetails = false, onSave = () => {}, activeTab = "1", loading = false, type = ""}) => {
    const buttons = [{
        glyph: '1-close',
        tooltipId: 'rulesmanager.tooltip.close',
        onClick: onExit,
        disabled: loading
    },
    {
        glyph: 'floppy-disk',
        tooltipId: 'rulesmanager.tooltip.save',
        onClick: onSave,
        disabled: disableSave || loading
    }];
    const detailsActive = !disableDetails && areDetailsActive(layer, rule);
    return (<div className="ms-panel-header-container">
        <div className="ms-toolbar-container">
            <Toolbar btnDefaultProps={{ className: 'square-button-md', bsStyle: 'primary', tooltipPosition: 'bottom'}} buttons={buttons}/>
        </div>
        <div className={`loading-header ${loading ? 'ms-circle-loader-md' : ''}`}/>
        <Nav bsStyle="tabs" activeKey={activeTab} justified onSelect={onNavChange}>
            <NavItem eventKey="1" ><Message msgId={"rulesmanager.navItems.main"}/></NavItem>
            <NavItem eventKey="2" disabled={!detailsActive}><Message msgId={"rulesmanager.navItems.style"}/></NavItem>
            <NavItem eventKey="3" disabled={!detailsActive}><Message msgId={"rulesmanager.navItems.filter"}/></NavItem>
            <NavItem eventKey="4" disabled={!detailsActive || type === "RASTER"}><Message msgId={"rulesmanager.navItems.attribute"}/></NavItem>
        </Nav>
    </div>);
};
