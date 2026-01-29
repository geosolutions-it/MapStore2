/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import ArcGISLegend from '../ArcGISLegend';
import expect from 'expect';
import { act } from 'react-dom/test-utils';
import axios from '../../../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';
import { waitFor } from '@testing-library/react';

describe('ArcGISLegend', () => {
    let mockAxios;
    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        mockAxios.restore();
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with defaults', () => {
        act(() => {
            ReactDOM.render(<ArcGISLegend/>, document.getElementById("container"));
        });
        expect(document.querySelector('.ms-arcgis-legend')).toBeTruthy();
    });
    it('should show the legend container when the legend request succeed', (done) => {
        mockAxios.onGet().reply(200, { layers: [{ layerId: 1, legend: [{ contentType: 'image/png', imageData: 'imageData', label: 'Label', width: 30, height: 20 }] }] });
        act(() => {
            ReactDOM.render(<ArcGISLegend node={{ name: 1, url: '/rest/MapServer' }}/>, document.getElementById("container"));
        });
        waitFor(() => expect(document.querySelector('.mapstore-small-size-loader')).toBeFalsy())
            .then(() => {
                expect(document.querySelector('.ms-legend')).toBeTruthy();
                const img = document.querySelector('.ms-legend img');
                expect(img.getAttribute('src')).toBe('data:image/png;base64,imageData');
                expect(img.getAttribute('width')).toBe('30');
                expect(img.getAttribute('height')).toBe('20');
                done();
            })
            .catch(done);
    });
    it('should show error message when the legend request fails', (done) => {
        mockAxios.onGet().reply(500);
        act(() => {
            ReactDOM.render(<ArcGISLegend node={{ url: '/rest/MapServer' }}/>, document.getElementById("container"));
        });
        waitFor(() => expect(document.querySelector('.mapstore-small-size-loader')).toBeFalsy())
            .then(() => {
                expect(document.querySelector('.ms-arcgis-legend').innerText).toBe('layerProperties.legenderror');
                done();
            })
            .catch(done);
    });
    it('should request using queryLegend when enableDynamicLegend is set to true', done => {
        const node = { url: '/rest/services/test/MapServer', enableDynamicLegend: true };
        const mockData = { layers: [{ layerId: 0, layerName: 'Layer', legend: [{ id: 'sym1', label: 'Water', contentType: 'image/png', imageData: 'iVBORw0', width: 12, height: 12 }] }] };

        mockAxios.onGet(/queryLegends/).reply(200, mockData);

        act(() => {
            const container = document.getElementById("container");
            ReactDOM.render(<ArcGISLegend node={node} />, container);
        });

        waitFor(() => expect(document.querySelector('.ms-legend-rule')).toBeTruthy())
            .then(() => {
                const legendRule = document.querySelector('.ms-legend-rule');
                expect(legendRule.innerText).toBe('Water');
                done();
            })
            .catch(done);
    });
    it('should display the empty layer message when legend items are not provided', done => {
        const node = { url: '/rest/services/test/MapServer', enableDynamicLegend: true };
        const mockData = { layers: [{ layerId: 0, layerName: 'Layer', legend: [] }] };

        mockAxios.onGet(/queryLegends/).reply(200, mockData);

        act(() => {
            const container = document.getElementById("container");
            ReactDOM.render(<ArcGISLegend node={node} />, container);
        });

        waitFor(() => expect(document.querySelector('.ms-no-visible-layers-in-extent')).toBeTruthy())
            .then(() => {
                done();
            })
            .catch(done);
    });
});
