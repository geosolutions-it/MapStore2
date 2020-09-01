/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Nav, NavItem as BSNavItem } from 'react-bootstrap';

import tooltip from '../../misc/enhancers/tooltip';

const NavItem = tooltip(BSNavItem);
import withLocationPopupTabs from './enhancers/withLocationPopupTabs';

const LocationPopoverEditor = ({
    tabs = [],
    activeTab,
    width,
    setActiveTab = () => {},
    ...props
} = {}
) => {
    return (<div key="ms-geostory-map-settings-navbar" className="ms-row-tab">
        <div>
            <Nav bsStyle="tabs" activeKey={activeTab} justified>
                {tabs.map(tab =>
                    <NavItem
                        key={'ms-tab-settings-' + tab.id}
                        tooltipId={tab.tooltipId}
                        eventKey={tab.id}
                        href={window.location.href} // prevents from navigating away
                        onClick={() => {
                            setActiveTab(tab.id);
                        }}>
                        {tab.title}
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
};


export default withLocationPopupTabs(LocationPopoverEditor);
