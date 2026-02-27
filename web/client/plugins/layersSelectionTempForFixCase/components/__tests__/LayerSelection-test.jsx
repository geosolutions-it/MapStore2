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

    it('should render the header when container is visible', () => {
        ReactDOM.render(<SelectComponent {...defaultProps} />, container);
        const componentContainer = container.querySelector('.select-dialog');
        const header = componentContainer.querySelector('.modal-header');
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
});
