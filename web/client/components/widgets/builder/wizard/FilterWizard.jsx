/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import './FilterWizard.less';

import React, { useState, useEffect } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import FilterDataTab from './filter/FilterDataTab';
import FilterLayoutTab from './filter/FilterLayoutTab';
import FilterActionsTab from './filter/FilterActionsTab';
import FilterList from './filter/FilterList';
import FilterSelector from './filter/FilterSelector';
import WizardContainer from '../../../misc/wizard/WizardContainer';
import { wizardHandlers } from '../../../misc/wizard/enhancers';
import WidgetOptions from './common/WidgetOptions';


const Wizard = wizardHandlers(WizardContainer);

// Validation function to check if filter configuration is complete
const isFilterConfigValid = (editorData = {}) => {
    const filters = editorData.filters || [];
    if (filters.length === 0) {
        return false;
    }

    // Check each filter for required fields
    return filters.every(filter => {
        const filterData = filter?.data || {};
        const dataSource = filterData.dataSource;
        const hasLayer = !!filterData.layer;

        // For features source, we need both layer and valueAttribute
        if (dataSource === 'features') {
            const hasValueAttribute = !!filterData.valueAttribute;
            return hasLayer && hasValueAttribute;
        }

        // For userDefined source, we need layer and at least one user defined item
        if (dataSource === 'userDefined') {
            const hasItems = filterData.userDefinedItems && filterData.userDefinedItems.length > 0;
            return hasLayer && hasItems;
        }

        // If no dataSource is selected yet, it's invalid
        return false;
    });
};

const FilterWizard = ({
    filterData = {},
    editorData = {},
    onChange = () => {},
    onOpenLayerSelector = () => {},
    openFilterEditor = () => {},
    onEditorChange = () => {},
    dashBoardEditing,
    step = 0,
    setPage = () => {},
    onFinish = () => {},
    setValid = () => {},
    // Props for FilterList and FilterSelector
    filters = [],
    selections = {},
    variantComponentMap = {},
    selectedFilterId = null,
    onFilterSelect = () => {},
    onAddFilter = () => {},
    onDeleteFilter = () => {},
    onRenameFilter = () => {},
    onSelectionChange = () => {}
}) => {
    const [activeTab, setActiveTab] = useState('data');

    const tabs = [
        { id: 'data', glyph: 'th-list', label: "Data" },
        { id: 'layout', glyph: 'cog', label: "Layout" },
        { id: 'actions', glyph: 'flash', label: "Interactions" }
    ];

    // Update validation state when data changes
    useEffect(() => {
        const isValid = isFilterConfigValid(editorData);
        setValid(isValid);
    }, [editorData, setValid]);

    const tabContents = {
        data: <FilterDataTab data={filterData} onChange={onChange} onOpenLayerSelector={onOpenLayerSelector} openFilterEditor={openFilterEditor} onEditorChange={onEditorChange} dashBoardEditing={dashBoardEditing} />,
        layout: <FilterLayoutTab data={filterData} onChange={onChange} />,
        actions: <FilterActionsTab data={filterData} onChange={onChange} />
    };

    // Filter configuration with FilterList, FilterSelector, and tabs (Data, Layout, Actions)
    const FilterConfiguration = (
        <div className="ms-filter-builder-content">
            <div className="ms-filter-list-sticky">
                <FilterList
                    filters={filters}
                    componentMap={variantComponentMap}
                    selections={selections}
                    getSelectionHandler={onSelectionChange}
                    selectedFilterId={selectedFilterId}
                />
            </div>
            <FilterSelector
                filters={filters}
                selectedFilterId={selectedFilterId}
                onSelect={onFilterSelect}
                onAdd={onAddFilter}
                onDelete={onDeleteFilter}
                onRename={onRenameFilter}
            />
            {filterData && (
                <div className="ms-filter-wizard">
                    <div className="ms-row-tab">
                        <Nav bsStyle="tabs" activeKey={activeTab} justified>
                            {tabs.map(tab => (
                                <NavItem
                                    key={`ms-filter-tab-${tab.id}`}
                                    eventKey={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <span>{tab.label}</span>
                                </NavItem>
                            ))}
                        </Nav>
                        <div className="ms-filter-tab-content">
                            {tabContents[activeTab]}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    //  Widget options (title & description)
    const FilterWidgetOptions = (
        <WidgetOptions
            data={editorData}
            onChange={onEditorChange}
            showTitle
        />
    );

    return (
        <Wizard
            step={step}
            setPage={setPage}
            onFinish={onFinish}
            isStepValid={(n) =>
                n === 0
                    ? isFilterConfigValid(editorData)
                    : true
            }
            hideButtons
            className="filter-wizard"
        >
            {[FilterConfiguration, FilterWidgetOptions].map((component, index) => (
                <React.Fragment key={index}>
                    {component}
                </React.Fragment>
            ))}
        </Wizard>
    );
};

export default FilterWizard;

