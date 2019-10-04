/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
const expect = require('expect');
const {compose, defaultProps} = require('recompose');
const legendWidget = require('../../enhancers/legendWidget');

const LegendWidget = compose(
    defaultProps({canEdit: true}),
    legendWidget
)(require('../LegendWidget'));

describe('LegendWidget component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('LegendWidget rendering with defaults', () => {
        ReactDOM.render(<LegendWidget />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.mapstore-widget-card');
        expect(el).toExist();
        expect(container.querySelector('.glyphicon-pencil')).toExist();
        expect(container.querySelector('.glyphicon-trash')).toExist();
    });
    it('view only mode', () => {
        ReactDOM.render(<LegendWidget canEdit={false} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.glyphicon-pencil')).toNotExist();
        expect(container.querySelector('.glyphicon-trash')).toNotExist();
    });
    it('Test LegendWidget onEdit callback', () => {
        const actions = {
            onEdit: () => { }
        };
        const spyonEdit = expect.spyOn(actions, 'onEdit');
        ReactDOM.render(<LegendWidget onEdit={actions.onEdit} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.glyphicon-pencil');
        ReactTestUtils.Simulate.click(el); // <-- trigger event callback
        expect(spyonEdit).toHaveBeenCalled();
    });
    it('LegendWidget rendering with layers', () => {
        const LAYERS = [{
            name: 'layer:00',
            title: 'Layer',
            visibility: true,
            type: 'wms'
        },
        {
            name: 'layer:01',
            title: 'Layer:01',
            visibility: false,
            type: 'wms',
            opacity: 0.5
        }
        ];
        ReactDOM.render(<LegendWidget dependencies={{layers: LAYERS}} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.mapstore-widget-card');
        expect(el).toExist();
        expect(container.querySelector('.compact-legend-grid')).toExist();
    });
    it('LegendWidget rendering with layers specified in dependenciesMap', () => {
        const layers = [
            {
                type: 'wms',
                url: 'https://gs-stable.geo-solutions.it/geoserver/wms',
                visibility: true,
                dimensions: [],
                name: 'gs:us_states',
                title: 'States of US',
                description: '',
                bbox: {
                    crs: 'EPSG:4326',
                    bounds: {
                        minx: -124.73142200000001,
                        miny: 24.955967,
                        maxx: -66.969849,
                        maxy: 49.371735
                    }
                },
                links: [],
                params: {},
                allowedSRS: {},
                search: {
                    type: 'wfs',
                    url: 'https://gs-stable.geo-solutions.it/geoserver/wfs'
                },
                id: 'gs:us_states__qxhbmc4jmko'
            }
        ];
        ReactDOM.render(<LegendWidget
            dependencies={{"widgets[3fe79110-ac81-11e9-9a66-39723a13a30f].map.layers": layers}}
            dependenciesMap={{layers: "widgets[3fe79110-ac81-11e9-9a66-39723a13a30f].map.layers" }} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.mapstore-widget-card');
        expect(el).toExist();
        expect(container.querySelector('.compact-legend-grid')).toExist();
    });
});
