/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';
import Catalog from '../datasets/Catalog';

describe('Test Catalog panel', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('creates the component with defaults', () => {
        const SERVICE = {
            type: "csw",
            url: "http://sample.service/catalog",
            title: "csw"
        };
        ReactDOM.render(<Catalog
            services={{ "csw": SERVICE}}
            selectedService="csw"
            selectedFormat="csw"
        />, document.getElementById("container"));
        const catalog = document.querySelector('.ms-catalog');
        expect(catalog).toBeTruthy();
    });
    it('triggers search on autoload service', (done) => {
        const SERVICE = {
            type: "csw",
            url: "http://sample.service/catalog",
            title: "csw",
            autoload: true
        };
        ReactDOM.render(<Catalog
            services={{ "csw": SERVICE}}
            selectedService="csw"
            selectedFormat="csw"
            onSearch={(props) => {
                expect(props).toEqual({
                    format: 'csw',
                    url: 'http://sample.service/catalog',
                    startPosition: 1,
                    maxRecords: 12,
                    text: '',
                    options: {
                        filters: undefined,
                        sort: undefined,
                        service: SERVICE
                    }
                });
                done();
            }}
        />, document.getElementById("container"));
    });
    it('resets new service status before autoload search', (done) => {
        const SERVICE = {
            type: "csw",
            url: "http://sample.service/catalog",
            title: "csw",
            autoload: true
        };
        const actions = {
            setNewServiceStatus: () => {}
        };
        const spyOnStatus = expect.spyOn(actions, 'setNewServiceStatus');
        actions.onSearch = () => {
            expect(spyOnStatus).toHaveBeenCalled();
            expect(spyOnStatus.calls[0].arguments[0]).toBe(false);
            done();
        };
        ReactDOM.render(<Catalog
            services={{ "csw": SERVICE}}
            selectedService="csw"
            selectedFormat="csw"
            onSearch={actions.onSearch}
            isNewServiceAdded
            setNewServiceStatus={actions.setNewServiceStatus}
        />, document.getElementById("container"));
    });
    it('renders editor in edit mode', () => {
        const SERVICE = {
            type: "csw",
            url: "http://sample.service/catalog",
            title: "csw"
        };
        ReactDOM.render(<Catalog
            services={{ "csw": SERVICE}}
            selectedService="csw"
            mode="edit"
        />, document.getElementById("container"));
        expect(document.querySelector('.ms-catalog-service-editor')).toBeTruthy();
    });

    it('renders layer error alert in view mode', () => {
        const SERVICE = {
            type: 'csw',
            url: 'http://sample.service/catalog',
            title: 'csw'
        };
        ReactDOM.render(<Catalog
            services={{ csw: SERVICE }}
            selectedService="csw"
            selectedFormat="csw"
            mode="view"
            layerError
        />, document.getElementById('container'));

        const alertNode = document.querySelector('.alert.alert-danger');
        expect(alertNode).toBeTruthy();
    });

    it('renders no records matched message section', () => {
        const SERVICE = {
            type: 'csw',
            url: 'http://sample.service/catalog',
            title: 'csw'
        };
        ReactDOM.render(<Catalog
            services={{ csw: SERVICE }}
            selectedService="csw"
            selectedFormat="csw"
            mode="view"
            result={{ numberOfRecordsMatched: 0 }}
        />, document.getElementById('container'));

        const emptySection = document.querySelector('._padding-sm');
        expect(emptySection).toBeTruthy();
    });

    it('hides catalog selector when showCatalogSelector is false', () => {
        const SERVICE = {
            type: 'csw',
            url: 'http://sample.service/catalog',
            title: 'csw'
        };
        ReactDOM.render(<Catalog
            services={{ csw: SERVICE }}
            selectedService="csw"
            selectedFormat="csw"
            mode="view"
            showCatalogSelector={false}
        />, document.getElementById('container'));

        expect(document.querySelector('.ms-catalog-service-select')).toBeFalsy();
    });

    it('handles back button click in edit mode', () => {
        const SERVICE = {
            type: 'csw',
            url: 'http://sample.service/catalog',
            title: 'csw'
        };
        const actions = {
            onChangeCatalogMode: () => {}
        };
        const spyOnChangeMode = expect.spyOn(actions, 'onChangeCatalogMode');

        ReactDOM.render(<Catalog
            services={{ csw: SERVICE }}
            selectedService="csw"
            mode="edit"
            onChangeCatalogMode={actions.onChangeCatalogMode}
        />, document.getElementById('container'));

        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);
        TestUtils.Simulate.click(buttons[0]);

        expect(spyOnChangeMode).toHaveBeenCalled();
        expect(spyOnChangeMode.calls[0].arguments[0]).toBe('view');
        expect(spyOnChangeMode.calls[0].arguments[1]).toBe(false);
    });

    it('triggers search on geonode autoload service', (done) => {
        const SERVICE = {
            type: 'geonode',
            url: 'http://sample.service/geonode',
            title: 'GeoNode',
            autoload: true
        };
        ReactDOM.render(<Catalog
            services={{ geonode: SERVICE }}
            selectedService="geonode"
            selectedFormat="geonode"
            onSearch={(props) => {
                expect(props).toEqual({
                    format: 'geonode',
                    url: 'http://sample.service/geonode',
                    startPosition: 1,
                    maxRecords: 12,
                    text: '',
                    options: {
                        filters: undefined,
                        sort: undefined,
                        service: SERVICE
                    }
                });
                done();
            }}
        />, document.getElementById('container'));
    });

    it('shows filter and sort controls for geonode', () => {
        const SERVICE = {
            type: 'geonode',
            url: 'http://sample.service/geonode',
            title: 'GeoNode'
        };
        ReactDOM.render(<Catalog
            services={{ geonode: SERVICE }}
            selectedService="geonode"
            selectedFormat="geonode"
            mode="view"
            result={{ numberOfRecordsMatched: 1 }}
            records={[{ identifier: 'geo-1', title: 'Geo Layer', references: [] }]}
            selected={[]}
            layers={[]}
            loadingLayers={[]}
            onSelect={() => {}}
            onAddSelected={() => {}}
            onAddLayer={() => {}}
        />, document.getElementById('container'));

        expect(document.querySelector('.glyphicon-filter')).toBeTruthy();
        expect(document.querySelector('#sort-dropdown')).toBeTruthy();
    });

    it('does not show sort control for csw service', () => {
        const SERVICE = {
            type: 'csw',
            url: 'http://sample.service/catalog',
            title: 'csw'
        };
        ReactDOM.render(<Catalog
            services={{ csw: SERVICE }}
            selectedService="csw"
            selectedFormat="csw"
            mode="view"
            result={{ numberOfRecordsMatched: 1 }}
            records={[{ identifier: 'csw-1', title: 'Catalog Layer', references: [] }]}
            selected={[]}
            layers={[]}
            loadingLayers={[]}
            onSelect={() => {}}
            onAddSelected={() => {}}
            onAddLayer={() => {}}
        />, document.getElementById('container'));

        expect(document.querySelector('#sort-dropdown')).toBeFalsy();
    });
});
