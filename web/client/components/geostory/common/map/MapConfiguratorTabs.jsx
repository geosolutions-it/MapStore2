/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Nav, NavItem as BSNavItem, Glyphicon } from 'react-bootstrap';

import tooltip from '../../../misc/enhancers/tooltip';

const NavItem = tooltip(BSNavItem);
/**
 * returns a list of tabs and a body with the active tab's component
 */
export const MapConfiguratorTabs = ({
    tabs = [],
    activeTab,
    width,
    setActiveTab = () => { },
    ...props
} = {}
) =>
    (<div key="ms-geostory-map-settings-navbar" className="ms-row-tab">
        <div>
            <Nav bsStyle="tabs" activeKey={activeTab} justified>
                {tabs.map(tab =>
                    <NavItem
                        key={'ms-tab-settings-' + tab.id}
                        tooltipId={tab.tooltipId}
                        eventKey={tab.id}
                        onClick={() => setActiveTab(tab.id)}>
                        <Glyphicon glyph={tab.glyph} />
                    </NavItem>
                )}
            </Nav>
        </div>
        <div>
            {tabs.filter(tab => tab.id && tab.id === activeTab).filter(tab => tab.Component).map(tab => (
                <tab.Component
                    {...props}
                    key={'ms-geostory-tab-settings-body-' + tab.id}/>
            ))}</div>
    </div>);

export default MapConfiguratorTabs;
