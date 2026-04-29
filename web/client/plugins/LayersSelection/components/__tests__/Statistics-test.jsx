import React from 'react';
import ReactDOM from 'react-dom';
import Statistics from '../Statistics';
import expect from 'expect';

describe('Statistics component', () => {
    let container;
    const defaultProps = {
        fields: [],
        features: [],
        setStatisticsOpen: () => { }
    };

    const MockGeoJsonfeatures = {
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
                    "name": "Sample Point",
                    "value": 10
                }
            },
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [102.0, 0.5]
                },
                "properties": {
                    "name": "Sample Point",
                    "value": 12
                }
            }
        ]
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


    const renderComponentWithFakeFeature = (props = {}) => {


        props.fields = ['value'];
        props.features = MockGeoJsonfeatures.features;

        const component = React.createElement(Statistics, {
            ...defaultProps,
            ...props
        });
        return ReactDOM.render(component, container);
    };

    describe('render Statistics component', () => {
        it('should render a statistics table', () => {
            renderComponentWithFakeFeature();

            // Verifying that the table rows are displayed based on passed props
            // Should check into document because it's a modal added outside the DOM hierarchy component
            const table = document.querySelector('.ms-statistics-table');
            expect(table).toBeTruthy();
        });

        it('should render a max value of the mocked GeoJSON', () => {
            renderComponentWithFakeFeature();

            // Verifying that the table rows are displayed based on passed props
            // Should check into document because it's a modal added outside the DOM hierarchy component
            const table = document.querySelector('.ms-statistics-table');
            const allTrs = table.querySelectorAll('tr');
            const allTrsAsArray = [...allTrs];
            const trOfMax = allTrsAsArray.find(el => {
                const spans = [...el.querySelectorAll('span')];
                const span = spans.find(elSpan => elSpan.textContent.trim() === 'layersSelection.statistics.max');
                if (span) {
                    return true;
                }
                return false;

            });
            const LinesOftrMax = trOfMax.querySelectorAll('td');
            const LinesOftrMaxAsArray = [...LinesOftrMax];
            // Max is store in second line
            const max = LinesOftrMaxAsArray[1].innerHTML;

            // GET MAX
            const maxCalculated = MockGeoJsonfeatures.features.reduce((maxValue, current) => {
                return (current.properties.value > maxValue.properties.value) ? current : maxValue;
            }, MockGeoJsonfeatures.features[0]);

            expect(max).toEqual(maxCalculated.properties.value);
        });

    });
});
