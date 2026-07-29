/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import InteractionTargetsList from '../InteractionTargetsList';
import { DATATYPES, TARGET_TYPES } from '../../../../../../../utils/InteractionUtils';

const sourceNodePath = 'widgets[filter-widget].filters[filter-1]';

const applyDimensionTarget = {
    targetType: 'applyDimension',
    expectedDataType: 'LAYER_DIMENSION',
    constraints: {}
};

const applyFilterTarget = {
    targetType: 'applyFilter',
    expectedDataType: 'WIDGET_FILTER',
    constraints: {}
};

const interactionTree = {
    id: 'root',
    children: [{
        id: 'filter-1',
        nodePath: sourceNodePath
    }]
};

const createLayerDimensionItem = (dimension) => ({
    id: `params.${dimension}`,
    title: dimension === 'time' ? 'Time' : 'Elevation',
    icon: dimension === 'time' ? 'time' : 'arrow-up',
    type: 'element',
    nodePath: `map.layers[layer-1].params.${dimension}`,
    interactionMetadata: {
        targets: [{
            targetType: 'applyDimension',
            expectedDataType: 'LAYER_DIMENSION',
            constraints: {}
        }]
    }
});

const createLayerFilterItem = () => ({
    id: 'layer-1',
    title: 'Layer 1',
    icon: '1-layer',
    type: 'element',
    nodePath: 'map.layers[layer-1]',
    interactionMetadata: {
        targets: [{
            targetType: 'applyFilter',
            expectedDataType: 'WIDGET_FILTER',
            constraints: {}
        }]
    }
});

const zoomToTarget = {
    targetType: TARGET_TYPES.APPLY_ZOOM_TO,
    expectedDataType: DATATYPES.ZOOM_TRIGGER,
    constraints: {}
};

const createZoomToItem = (id = 'map', nodePath = 'map.applyZoomTo') => ({
    id,
    title: 'Zoom to',
    icon: 'zoom-to',
    type: 'element',
    nodePath,
    interactionMetadata: {
        targets: [{
            targetType: TARGET_TYPES.APPLY_ZOOM_TO,
            expectedDataType: DATATYPES.ZOOM_TRIGGER,
            constraints: {}
        }]
    }
});

const renderTargetsList = ({
    item = createLayerDimensionItem('elevation'),
    target = applyDimensionTarget,
    interactions = [],
    alreadyExistingInteractions = [],
    sourceSelectionMode,
    timelineEnabled = false,
    filteredInteractionTree,
    onEditorChange = () => {}
} = {}) => {
    const finalFilteredInteractionTree = filteredInteractionTree || { children: [item] };
    const container = document.getElementById('container');
    const fullInteractionTree = {
        ...interactionTree,
        children: [
            ...interactionTree.children,
            ...(finalFilteredInteractionTree.children || [])
        ]
    };
    ReactDOM.render(
        <InteractionTargetsList
            target={target}
            interactions={interactions}
            sourceWidgetId="filter-widget"
            interactionTree={fullInteractionTree}
            currentSourceId="filter-1"
            onEditorChange={onEditorChange}
            filteredInteractionTree={finalFilteredInteractionTree}
            alreadyExistingInteractions={alreadyExistingInteractions}
            sourceSelectionMode={sourceSelectionMode}
            timelineEnabled={timelineEnabled}
        />,
        container
    );
    return container;
};

describe('InteractionTargetsList component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should disable apply dimension nodes when selection mode is multiple', () => {
        const container = renderTargetsList({
            target: applyDimensionTarget,
            sourceSelectionMode: 'multiple'
        });

        const row = container.querySelector('.ms-connection-row');

        expect(row.classList.contains('is-disabled')).toBe(true);
        expect(row.querySelector('.ms-interaction-buttons')).toBe(null);
    });

    it('should disable a layer dimension target connected from another filter', () => {
        const container = renderTargetsList({
            target: applyDimensionTarget,
            alreadyExistingInteractions: [{
                id: 'elevation-interaction',
                plugged: true,
                targetType: 'applyDimension',
                source: {
                    nodePath: 'widgets[filter-widget].filters[filter-2]'
                },
                target: {
                    nodePath: 'map.layers[layer-1].params.elevation'
                }
            }]
        });

        const row = container.querySelector('.ms-connection-row');

        expect(row.classList.contains('is-disabled')).toBe(true);
        expect(row.querySelector('.ms-interaction-buttons')).toBe(null);
    });

    it('should disable a layer time target when controlled by map time', () => {
        const container = renderTargetsList({
            item: createLayerDimensionItem('time'),
            target: applyDimensionTarget,
            timelineEnabled: true
        });

        const row = container.querySelector('.ms-connection-row');

        expect(row.classList.contains('is-disabled')).toBe(true);
        expect(row.querySelector('.ms-interaction-buttons')).toBe(null);
    });

    it('should create an interaction when a target node is plugged', () => {
        let changedKey;
        let changedInteractions;
        const container = renderTargetsList({
            item: createLayerFilterItem(),
            target: applyFilterTarget,
            onEditorChange: (key, value) => {
                changedKey = key;
                changedInteractions = value;
            }
        });

        ReactTestUtils.Simulate.click(container.querySelector('.ms-interaction-buttons button'));

        expect(changedKey).toBe('interactions');
        expect(changedInteractions.length).toBe(1);
        expect(changedInteractions[0].plugged).toBe(true);
        expect(changedInteractions[0].targetType).toBe('applyFilter');
        expect(changedInteractions[0].source.nodePath).toBe(sourceNodePath);
        expect(changedInteractions[0].target.nodePath).toBe('map.layers[layer-1]');
    });

    it('should render an existing apply filter interaction as plugged', () => {
        const container = renderTargetsList({
            item: createLayerFilterItem(),
            target: applyFilterTarget,
            interactions: [{
                id: 'apply-filter-interaction',
                plugged: true,
                targetType: 'applyFilter',
                source: {
                    nodePath: sourceNodePath
                },
                target: {
                    nodePath: 'map.layers[layer-1]'
                },
                configuration: {
                    forcePlug: false
                }
            }]
        });

        expect(container.querySelector('.glyphicon-plug')).toBeTruthy();
    });

    it('should automatically unplug dependent interactions when an interaction is unplugged', () => {
        let changedKey;
        let changedInteractions;

        const applyFilterItem = createLayerFilterItem();
        const zoomToItem = createZoomToItem('map', 'map.applyZoomTo');

        const container = renderTargetsList({
            target: applyFilterTarget,
            item: applyFilterItem,
            alreadyExistingInteractions: [],
            filteredInteractionTree: { children: [applyFilterItem, zoomToItem] },
            interactions: [{
                id: 'apply-filter-1',
                plugged: true,
                targetType: 'applyFilter',
                source: { nodePath: sourceNodePath },
                target: { nodePath: 'map.layers[layer-1]' }
            }, {
                id: 'zoom-1',
                plugged: true,
                targetType: TARGET_TYPES.APPLY_ZOOM_TO,
                source: { nodePath: sourceNodePath },
                target: { nodePath: 'map.applyZoomTo' }
            }],
            onEditorChange: (key, value) => {
                changedKey = key;
                changedInteractions = value;
            }
        });

        const rows = container.querySelectorAll('.ms-connection-row');
        // Unplug the applyFilter connection
        const plugButton = rows[0].querySelector('.ms-interaction-buttons button');
        ReactTestUtils.Simulate.click(plugButton);

        expect(changedKey).toBe('interactions');
        expect(changedInteractions.length).toBe(2);

        const unpluggedFilter = changedInteractions.find(i => i.targetType === 'applyFilter');
        const unpluggedZoomTo = changedInteractions.find(i => i.targetType === TARGET_TYPES.APPLY_ZOOM_TO);

        expect(unpluggedFilter.plugged).toBe(false);
        // The applyZoomTo interaction should be automatically unplugged!
        expect(unpluggedZoomTo.plugged).toBe(false);
    });
});
