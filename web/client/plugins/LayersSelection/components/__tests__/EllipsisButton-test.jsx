import React from 'react';
import ReactDOM from 'react-dom';
import EllipsisButton from '../EllipsisButton';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';

describe('Ellipsis button component', () => {
    let container;
    const defaultProps = {
        node: {},
        selectionData: {},
        onAddOrUpdateSelection: () => { },
        onZoomToExtent: () => { },
        onAddLayer: () => { },
        onChangeLayerProperties: () => { }
    };

    beforeEach((done) => {
        container = document.createElement('div');
        document.body.appendChild(container);
        setTimeout(done);
    });

    afterEach((done) => {
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
