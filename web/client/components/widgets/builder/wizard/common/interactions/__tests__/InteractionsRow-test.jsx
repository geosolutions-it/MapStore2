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

import InteractionsRow from '../InteractionsRow';

const target = {
    targetType: 'applyFilter',
    expectedDataType: 'WIDGET_FILTER',
    constraints: {}
};

const configuration = {
    forcePlug: false
};

const createElementItem = () => ({
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

const renderRow = (props = {}) => {
    const container = document.getElementById('container');
    ReactDOM.render(
        <InteractionsRow
            item={createElementItem()}
            target={target}
            configuration={configuration}
            {...props}
        />,
        container
    );
    return container;
};

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

    it('should render disabled state on element rows and disable interaction buttons', () => {
        const container = renderRow({
            isPluggable: true,
            nodeDisabled: {
                disabled: true,
                reason: <span>Disabled reason</span>
            }
        });

        const row = container.querySelector('.ms-connection-row');
        const buttonsContainer = container.querySelector('.ms-interaction-buttons');
        const plugButton = buttonsContainer.querySelector('button');

        expect(row.classList.contains('is-disabled')).toBe(true);
        expect(buttonsContainer.classList.contains('is-disabled')).toBe(true);
        expect(plugButton.disabled).toBe(true);
    });

    it('should call onPlugChange with the next plugged value', () => {
        let nextPlugged;
        const container = renderRow({
            plugged: false,
            isPluggable: true,
            onPlugChange: (value) => {
                nextPlugged = value;
            }
        });

        ReactTestUtils.Simulate.click(container.querySelector('.ms-interaction-buttons button'));

        expect(nextPlugged).toBe(true);
    });

    it('should render and collapse children for collection rows', () => {
        const collectionItem = {
            id: 'map',
            title: 'Map',
            icon: '1-map',
            type: 'collection',
            children: [{}]
        };
        const container = renderRow({
            item: collectionItem,
            children: <li className="test-child-row">Child row</li>
        });

        expect(container.querySelector('.test-child-row')).toBeTruthy();

        ReactTestUtils.Simulate.click(container.querySelector('.ms-connection-row button'));

        expect(container.querySelector('.test-child-row')).toBe(null);
    });
});
