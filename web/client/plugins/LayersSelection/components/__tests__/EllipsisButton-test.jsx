import React from 'react';
import ReactDOM from 'react-dom';
import EllipsisButton from '../EllipsisButton';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';
import axios from '../../../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';

describe('Ellipsis button component', () => {
    let container;
    let mockAxios;
    const defaultProps = {
        node: {},
        selectionData: {},
        onAddOrUpdateSelection: () => { },
        onZoomToExtent: () => { },
        onAddLayer: () => { },
        onChangeLayerProperties: () => { }
    };

    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        mockAxios.onGet().reply(200, { featureTypes: [{ typeName: 'test', properties: [] }] });
        container = document.createElement('div');
        document.body.appendChild(container);
        setTimeout(done);
    });

    afterEach((done) => {
        mockAxios.restore();
        ReactDOM.unmountComponentAtNode(container);
        document.body.removeChild(container);
        setTimeout(done);
    });

    const renderComponent = (props = {}) => {
        const component = React.createElement(EllipsisButton, {
            ...defaultProps,
            ...props
        });
        return ReactDOM.render(component, container);
    };

    const renderComponentWithFakeFeature = (props = {}) => {
        const GeoJsonfeatures = {
            "type": "FeatureCollection",
            "crs": {
                "type": "name",
                "properties": {
                    "name": "EPSG:4326"
                }
            },
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [102.0, 0.5]
                    },
                    "properties": {
                        "name": "Sample Point"
                    }
                }
            ]
        };

        props.selectionData = GeoJsonfeatures;

        const component = React.createElement(EllipsisButton, {
            ...defaultProps,
            ...props
        });
        return ReactDOM.render(component, container);
    };

    describe('render EllipsisButton component', () => {
        it('opens the selected WFS layer in the attribute table', () => {
            const node = { id: 'layer', type: 'wfs', name: 'test', url: '/wfs' };
            const onViewInTable = expect.createSpy();
            renderComponentWithFakeFeature({ node, onViewInTable });
            const item = [...container.querySelectorAll('a')].find(link => link.textContent === 'layersSelection.button.viewInTable');
            expect(item).toBeTruthy();
            TestUtils.Simulate.click(item);
            expect(onViewInTable).toHaveBeenCalledWith(node, null);
        });

        it('only offers the attribute table for supported WFS data sources', () => {
            renderComponentWithFakeFeature({ node: { type: 'vector' } });
            expect(container.textContent.indexOf('layersSelection.button.viewInTable')).toBe(-1);
        });
        it('should render with default props', () => {
            renderComponent();
            expect(container.querySelector('._border-transparent')).toBeTruthy();
            expect(container.querySelector('.dropdown-toggle')).toBeTruthy();
        });

        it('should render with default props', () => {
            renderComponent();
            expect(container.querySelector('._border-transparent')).toBeTruthy();
            expect(container.querySelector('.dropdown-toggle')).toBeTruthy();
        });

        it('should not render statistics when any features are selected', () => {
            renderComponent();
            const spanList = [...container.querySelectorAll('span')];
            const span = spanList.find(el => el.textContent.trim() === 'layersSelection.button.statistics');
            const link = span.parentElement;
            TestUtils.Simulate.click(link);

            const modal = document.getElementById('ms-resizable-modal');

            expect(modal).toBeFalsy();
        });

        it('should  render statistics when a feature at least is selected', () => {
            renderComponentWithFakeFeature();
            const spanList = [...container.querySelectorAll('span')];
            const span = spanList.find(el => el.textContent.trim() === 'layersSelection.button.statistics');
            const link = span.parentElement;
            TestUtils.Simulate.click(link);

            const modal = document.getElementById('ms-resizable-modal');
            expect(modal).toBeTruthy();
        });

    });
});
