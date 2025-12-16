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
                expect(document.querySelector('.ms-arcgis-legend').innerText).toContain('layerProperties.legenderror');
                done();
            })
            .catch(done);
    });

    it('should display a message when dynamic legend is active and legend outside', done => {
        const node = { url: 'https://fake.server.com/arcgis/rest/services/test/MapServer', enableDynamicLegend: true };
        const mockData = { layers: [{ layerId: 0, layerName: 'Layer', legend: [{ id: 'sym1', label: 'Water', contentType: 'image/png', imageData: 'iVBORw0', width: 12, height: 12 }] }] };

        mockAxios.onGet(/legend/).reply(200, mockData);

        act(() => {
            const container = document.getElementById("container");
            ReactDOM.render(<ArcGISLegend/>, container);
        });
        act(() =>{
            const container = document.getElementById("container");
            ReactDOM.render(<ArcGISLegend node={node}  />, container);
        });

        const legend = document.querySelector('.ms-no-visible-layers-in-extent');
        const span = legend.getElementsByTagName('span');
        expect(legend).toBeTruthy();
        expect(span).toBeTruthy();
        expect(span[0].innerHTML).toBe('widgets.errors.noLegend');
        done();
    });

});
