/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import expect from 'expect';

import BaseMap from '../../../../../components/map/BaseMap';
import { withLocationLayer } from '../withLocationLayer';


describe('withLocationLayer HOC', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should enhance wrapped component with locations layer when mapLocationsEnabled', () => {
        const enhancer = withLocationLayer(BaseMap);
        const EnhancedMapWithLocationLayer = enhancer(
            {plugins: {Map: () => <div/>},
                update: () => {},
                layers: [{}],
                editMap: true,
                map: {mapLocationsEnabled: true}
            });

        const renderedMap = ReactDOM.render(EnhancedMapWithLocationLayer, document.getElementById("container"));
        const m = ReactTestUtils.findAllInRenderedTree(renderedMap, () => true);

        const locationsLayer = m[0].props.layers.filter(layer => layer.id === "locations");
        expect(m[0].props.layers.length).toEqual(2);
        expect(locationsLayer.length).toEqual(1);
    });

    it('should not add a new locations layer if it already existed', () => {
        const enhancer = withLocationLayer(BaseMap);
        const EnhancedMapWithLocationLayer = enhancer(
            {plugins: {Map: () => <div/>},
                update: () => {},
                layers: [{id: "locations"}],
                editMap: true,
                map: {mapLocationsEnabled: true}
            });

        const renderedMap = ReactDOM.render(EnhancedMapWithLocationLayer, document.getElementById("container"));
        const m = ReactTestUtils.findAllInRenderedTree(renderedMap, () => true);

        expect(m[0].props.layers.length).toEqual(1);
    });
});
