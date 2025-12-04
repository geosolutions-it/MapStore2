/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import FilterDataTab from './filter/FilterDataTab';
import FilterLayoutTab from './filter/FilterLayoutTab';
import FilterActionsTab from './filter/FilterActionsTab';


const FilterWizard = ({
    data = {},
    onChange = () => {},
    onOpenLayerSelector = () => {},
    openFilterEditor = () => {},
    onEditorChange = () => {},
    dashBoardEditing
}) => {
    const [activeTab, setActiveTab] = useState('data');

    const tabs = [
        { id: 'data', glyph: 'th-list', label: "Data" },
        { id: 'layout', glyph: 'cog', label: "Layout" },
        { id: 'actions', glyph: 'flash', label: "Interactions" }
    ];

    const tabContents = {
        data: <FilterDataTab data={data} onChange={onChange} onOpenLayerSelector={onOpenLayerSelector} openFilterEditor={openFilterEditor} onEditorChange={onEditorChange} dashBoardEditing={dashBoardEditing} />,
        layout: <FilterLayoutTab data={data} onChange={onChange} />,
        actions: <FilterActionsTab data={data} onChange={onChange} />
    };

    return (
        <div className="ms-filter-wizard">
            <div className="ms-row-tab">
                <Nav bsStyle="tabs" activeKey={activeTab} justified>
                    {tabs.map(tab => (
                        <NavItem
                            key={`ms-filter-tab-${tab.id}`}
                            eventKey={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span  >{tab.label}</span>
                        </NavItem>
                    ))}
                </Nav>
                <div className="ms-filter-tab-content">
                    {tabContents[activeTab]}
                </div>
            </div>
        </div>
    );
};

export default FilterWizard;

