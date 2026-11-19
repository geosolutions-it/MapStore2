/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils, { act } from 'react-dom/test-utils';
import { getLayerFromRecord } from '../../../../api/catalog/ArcGIS';

import SelectComponent from '../LayersSelection';

describe('Select Component', () => {
    let container;

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        container = document.getElementById('container');
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(container);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    const testRecord = {
        name: 1,
        title: "TestedLayer",
        url: "base/web/client/test-resources/arcgis/arcgis-test-data.json"
    };
    const layer = getLayerFromRecord(testRecord, { layerBaseConfig: { group: undefined } });

    const defaultProps = {
        layers: [layer],
        onUpdateNode: () => { },
        onClose: () => { },
        isVisible: true,
        isFloating: false,
        highlightOptions: {},
        queryOptions: {},
        selectTools: [],
        storeConfiguration: () => { },
        selections: {},
        maxFeatureCount: 1,
        cleanSelection: () => { },
        addOrUpdateSelection: () => { },
        zoomToExtent: () => { },
        addLayer: () => { },
        changeLayerProperties: () => { }
    };


    it('should render the component container', () => {
        ReactDOM.render(<SelectComponent {...defaultProps} />, container);
        const componentContainer = container.querySelector('.select-dialog');
        expect(componentContainer).toBeTruthy();
    });

    it('uses floating mode by default and keeps the map and sidebar clickable', () => {
        const storeConfiguration = expect.createSpy();
        const onClose = expect.createSpy();
        act(() => {
            ReactDOM.render(<SelectComponent {...defaultProps} isFloating={undefined} dockStyle={{ right: 40 }} storeConfiguration={storeConfiguration} onClose={onClose}/>, container);
        });
        const modal = container.querySelector('.ms-layers-selection-floating');
        const dialog = container.querySelector('.select-dialog');
        expect(modal).toBeTruthy();
        expect(modal.classList.contains('ms-draggable')).toBe(true);
        expect(container.querySelector('#layers-selection-container')).toBe(null);
        expect(dialog.classList.contains('ms-side-panel')).toBe(false);
        expect(getComputedStyle(modal).pointerEvents).toBe('none');
        expect(getComputedStyle(dialog).pointerEvents).toBe('auto');
        expect(storeConfiguration).toHaveBeenCalledWith({ highlightOptions: {}, queryOptions: {}, isFloating: true });
        TestUtils.Simulate.click(container.querySelector('.ms-resizable-modal'));
        expect(onClose).toNotHaveBeenCalled();
        TestUtils.Simulate.click(container.querySelector('.modal-header button'));
        expect(onClose).toHaveBeenCalled();
    });

    it('updates stored layout configuration when switching panel modes', () => {
        const storeConfiguration = expect.createSpy();
        act(() => {
            ReactDOM.render(<SelectComponent {...defaultProps} storeConfiguration={storeConfiguration}/>, container);
        });
        act(() => {
            ReactDOM.render(<SelectComponent {...defaultProps} isFloating storeConfiguration={storeConfiguration}/>, container);
        });
        expect(storeConfiguration.calls.map(({ arguments: args }) => args[0].isFloating)).toEqual([false, true]);
        expect(container.querySelector('.ms-layers-selection-floating')).toBeTruthy();
    });

    it('should render the header when container is visible', () => {
        ReactDOM.render(<SelectComponent {...defaultProps} />, container);
        const componentContainer = container.querySelector('.select-dialog');
        const header = componentContainer.querySelector('.ms-header');
        expect(header).toBeTruthy();
    });

    it('shouldn\'t render the component when container is not visible', () => {
        const props = { ...defaultProps };
        props.isVisible = false;
        ReactDOM.render(<SelectComponent {...props} />, container);
        const componentContainer = container.querySelector('.select-dialog');
        expect(componentContainer).toBe(null);
    });

    it('should render layers tree', () => {
        ReactDOM.render(<SelectComponent {...defaultProps} />, container);
        const layerTreeIsExisting = container.querySelectorAll('.ms-layers-tree');
        expect(layerTreeIsExisting).toBeTruthy();
    });

    it('should render layer TestedLayer in the layers tree', () => {
        ReactDOM.render(<SelectComponent {...defaultProps} />, container);
        const msnodestitle = container.querySelectorAll('.ms-node-title');
        const msnodestitleAsArray = Array.from(msnodestitle);
        const LookingForTestedLayer = msnodestitleAsArray.filter(obj => obj.innerHTML === 'TestedLayer');
        expect(LookingForTestedLayer.length).toBeGreaterThanOrEqualTo(1);

    });

    it('keeps the dock clear of the sidebar without a modal backdrop', () => {
        container.style.cssText = 'position: absolute; inset: 0;';
        ReactDOM.render(<SelectComponent {...defaultProps} dockStyle={{ right: 40 }} />, container);
        expect(container.querySelector('.select-dialog').classList.contains('ms-side-panel')).toBe(true);
        expect(container.querySelector('.modal-backdrop')).toBe(null);
        const dockContainer = container.querySelector('#layers-selection-container');
        expect(dockContainer.style.width).toBe('calc(100% - 40px)');
        expect(dockContainer.style.transform).toBe('translateX(-40px)');
        const header = container.querySelector('.select-dialog .ms-header').getBoundingClientRect();
        expect(header.right).toBeLessThanOrEqualTo(window.innerWidth - 40);
    });

    it('disables geometry selection when no eligible layer is checked', () => {
        act(() => {
            ReactDOM.render(<SelectComponent {...defaultProps} layers={[{ ...layer, isSelectQueriable: false }]} selectTools={['Point']} />, container);
        });
        expect(container.querySelector('.Select').classList.contains('is-disabled')).toBe(true);
        act(() => {
            ReactDOM.render(<SelectComponent {...defaultProps} layers={[{ ...layer, isSelectQueriable: true }]} selectTools={['Point']} />, container);
        });
        expect(container.querySelector('.Select').classList.contains('is-disabled')).toBe(false);
    });

    it('updates every checkbox when all layers are deselected', () => {
        const onUpdateNode = expect.createSpy();
        ReactDOM.render(<SelectComponent {...defaultProps} layers={[{ ...layer, id: 'one', isSelectQueriable: true }, { ...layer, id: 'two', isSelectQueriable: true }]} onUpdateNode={onUpdateNode} />, container);
        TestUtils.Simulate.click(container.querySelector('.tree-header .ms-visibility-check'));
        expect(onUpdateNode.calls.map(({ arguments: args }) => args)).toEqual([
            ['one', 'layers', { isSelectQueriable: false }],
            ['two', 'layers', { isSelectQueriable: false }]
        ]);
    });

    it('resets the selected geometry shown in the dropdown after closing', () => {
        act(() => {
            ReactDOM.render(<SelectComponent {...defaultProps} drawType="Point" selectTools={['Point']} />, container);
        });
        expect(container.querySelector('.Select-value')).toBeTruthy();
        act(() => {
            ReactDOM.render(<SelectComponent {...defaultProps} drawType={null} isVisible={false} selectTools={['Point']} />, container);
            ReactDOM.render(<SelectComponent {...defaultProps} drawType={null} selectTools={['Point']} />, container);
        });
        expect(container.querySelector('.Select-value')).toBe(null);
    });
});
