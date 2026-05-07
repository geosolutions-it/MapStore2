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

import InteractionsRow from '../InteractionsRow';

describe('InteractionsRow component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should only disable element rows when map time is already connected', () => {
        const container = document.getElementById('container');
        const sourceNodePath = 'widgets[filter-widget].filters[filter-1]';
        const target = {
            targetType: 'applyDimension',
            expectedDataType: 'LAYER_DIMENSION',
            constraints: {}
        };
        const item = {
            id: 'map',
            title: 'Map',
            icon: '1-map',
            type: 'collection',
            nodePath: 'map',
            children: [{
                id: 'params.elevation',
                title: 'Elevation',
                icon: 'arrow-up',
                type: 'element',
                nodePath: 'map.layers[layer-1].params.elevation',
                interactionMetadata: {
                    targets: [{
                        targetType: 'applyDimension',
                        expectedDataType: 'LAYER_DIMENSION',
                        constraints: {}
                    }]
                }
            }]
        };
        const interactionTree = {
            id: 'root',
            children: [{
                id: 'filter-1',
                nodePath: sourceNodePath
            }]
        };

        ReactDOM.render(
            <InteractionsRow
                item={item}
                target={target}
                interactions={[]}
                sourceWidgetId="filter-widget"
                interactionTree={interactionTree}
                currentSourceId="filter-1"
                onEditorChange={() => {}}
                alreadyExistingInteractions={[{
                    id: 'map-time-interaction',
                    plugged: true,
                    targetType: 'applyDimension',
                    source: {
                        nodePath: sourceNodePath
                    },
                    target: {
                        nodePath: 'map.time'
                    }
                }]}
            />,
            container
        );

        const rows = container.querySelectorAll('.ms-connection-row');
        expect(rows.length).toBe(2);
        expect(rows[0].classList.contains('is-disabled')).toBe(false);
        expect(rows[1].classList.contains('is-disabled')).toBe(true);
        expect(rows[1].querySelector('button').disabled).toBe(true);
    });
});
