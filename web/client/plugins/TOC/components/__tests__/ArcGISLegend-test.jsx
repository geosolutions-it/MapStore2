import React from 'react';
import ReactDOM from 'react-dom';
import ArcGISLegend from '../ArcGISLegend';
import mockAxios from 'axios-mock-adapter';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import assert from 'assert';
import expect from 'expect';

const axiosMock = new mockAxios(axios);

describe('ArcGISLegend', function() {

    this.timeout(100000);
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.setAttribute('id', 'container');
        document.body.appendChild(container);
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(container);
        document.body.innerHTML = '';
        axiosMock.reset();
    });

    it('should display a loader during loading', async () => {
        const node = { url: 'https://fake.server.com/arcgis/rest/services/test/MapServer' };

        axiosMock.onGet(/legend/).reply(() => {
            return new Promise(() => {});
        });

        await act(async () => {
            ReactDOM.render(<ArcGISLegend node={node} />, document.getElementById("container"));
        });

        expect(document.getElementById("container").querySelector('.mapstore-loader')).toExist();
    });

    it('displays legend items after fetch', done => {
        const node = { url: 'https://fake.server.com/arcgis/rest/services/test/MapServer' };
        const mockLegendData = { layers: [{ layerId:0, layerName:'Layer', legend:[{id:'sym1', label:'Water', contentType:'image/png', imageData:'iVBORw0KGgoAAAANSUhEUgAAAAUA', width:12, height:12}]}] };

        axiosMock.onGet(/legend/).reply(200, mockLegendData);

        act(() => {
            ReactDOM.render(<ArcGISLegend node={node} />, container);
        });

        setTimeout(() => {
            try {
                const item = container.querySelector('.ms-legend-rule');
                assert(item.textContent.includes('Water'));
                done();
            } catch (err) {
                done(err);
            }
        }, 100);
    });

    it('should display error message on failed fetch', done => {
        const node = { url: 'https://fake.server.com/arcgis/rest/services/test/MapServer' };
        axiosMock.onGet(/legend/).reply(500);
        act(() => ReactDOM.render(<ArcGISLegend node={node} />, container));
        setTimeout(() => {
            try {
                const msg = container.querySelector('.ms-arcgis-legend').textContent;
                assert(msg.includes('legenderror'));
                done();
            } catch (err) {
                done(err);
            }
        }, 100);
    });

    it('should call onChange with legendEmpty status', done => {
        const node = { url: 'https://fake.server.com/arcgis/rest/services/test/MapServer' };
        const mockData = { layers: [{ layerId:0, layerName:'Layer', legend:[{ id:'sym1', label:'Water', contentType:'image/png', imageData:'iVBORw0', width:12, height:12 }] }] };

        axiosMock.onGet(/legend/).reply(200, mockData);

        const onChangeSpy = (status) => {
            try {
                assert(status.legendEmpty === false);
                done();
            } catch (err) {
                done(err);
            }
        };

        act(() => ReactDOM.render(<ArcGISLegend node={node} onChange={onChangeSpy} />, container));
    });

});
