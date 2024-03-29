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
import Catalog from '../Catalog';

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
        const item = ReactDOM.render(<Catalog />, document.getElementById("container"));
        const catalog = TestUtils.findRenderedDOMComponentWithClass(item, "ms2-border-layout-body catalog");
        expect(item).toExist();
        expect(catalog).toExist();
    });
    it('test the search of records', (done) => {
        const SERVICE = {
            type: "csw",
            url: "url",
            title: "csw"
        };
        const item = ReactDOM.render(<Catalog
            services={{ "csw": SERVICE}}
            selectedService="csw"
            onSearch={(props) => {
                expect(props).toExist();
                expect(props).toEqual({ format: 'csw', url: 'url', startPosition: 1, maxRecords: 4, text: '', options: {service: SERVICE} } );
                done();
            }}
        />, document.getElementById("container"));
        expect(item).toExist();
        const buttons = TestUtils.scryRenderedDOMComponentsWithTag(item, "button");
        expect(buttons.length).toBe(1);
        const searchButton = buttons[0];
        TestUtils.Simulate.click(searchButton);
    });
    it('test rendering records with expand button', () => {
        const title = "title";
        const description = "description";
        const item = ReactDOM.render(<Catalog
            services={{"csw": {
                type: "csw",
                url: "url",
                title: "csw",
                format: "image/png8",
                metadataTemplate: "<p>${title} and ${description}</p>",
                showTemplate: true
            }}}
            searchOptions={{}}
            selectedService="csw"
            loading={false}
            mode="view"
            result={{numberOfRecordsMatched: 1}}
            records={[{title, description, references: []}]}
        />, document.getElementById("container"));
        expect(item).toExist();
        const expandClass = ".glyphicon-chevron-left";
        const expandButton = document.querySelector(expandClass);
        expect(expandButton).toExist(`${expandClass} does not exist`);
    });
    it('renders records without thumbnail for a specific service', () => {
        const title = "title";
        const description = "description";
        const item = ReactDOM.render(<Catalog
            services={{"csw": {
                type: "csw",
                url: "url",
                title: "csw",
                format: "image/png8",
                metadataTemplate: "<p>${title} and ${description}</p>",
                hideThumbnail: true
            }}}
            searchOptions={{}}
            selectedService="csw"
            loading={false}
            mode="view"
            result={{numberOfRecordsMatched: 1}}
            records={[{title, description, references: []}]}
        />, document.getElementById("container"));
        expect(item).toExist();
        const previewClassName = ".mapstore-side-preview";
        const preview = document.querySelector(previewClassName);
        expect(preview).toNotExist(`${previewClassName} does not exist`);
    });
    it('renders records with default_map_backgrounds', () => {
        const title = "title";
        const description = "description";
        const item = ReactDOM.render(<Catalog
            services={{
                "default_map_backgrounds": {
                    "type": "backgrounds",
                    "title": "Default bg",
                    "titleMsgId": "defaultMapBackgroundsServiceTitle",
                    "autoload": true
                },
                "csw": {
                    type: "csw",
                    url: "url",
                    title: "csw",
                    format: "image/png8",
                    metadataTemplate: "<p>${title} and ${description}</p>",
                    hideThumbnail: true
                }
            }}
            searchOptions={{}}
            selectedService="default_map_backgrounds"
            loading={false}
            mode="view"
            result={{numberOfRecordsMatched: 1}}
            records={[{title, description, references: []}]}
        />, document.getElementById("container"));
        const inputField = document.querySelector(".form-group .Select-value-label");
        expect(inputField.innerText).toBe("defaultMapBackgroundsServiceTitle");
        expect(item).toExist();
    });
    it('test the search of records with new service added', () => {
        const SERVICE = {
            type: "csw",
            url: "url",
            title: "csw"
        };
        const actions = { setNewServiceStatus: () => {} };
        const spyOnNewService = expect.spyOn(actions, 'setNewServiceStatus');
        const item = ReactDOM.render(<Catalog
            services={{ "csw": SERVICE}}
            selectedService="csw"
            isNewServiceAdded
            setNewServiceStatus={actions.setNewServiceStatus}
            result={{numberOfRecordsMatched: 4, numberOfRecordsReturned: 10}}
        />, document.getElementById("container"));
        expect(item).toExist();
        const catalogPagination = document.getElementsByClassName('catalog-pagination');
        const buttons = TestUtils.scryRenderedDOMComponentsWithTag(item, "button");
        expect(buttons.length).toBe(1);
        const searchButton = buttons[0];
        TestUtils.Simulate.click(searchButton);
        expect(spyOnNewService).toHaveBeenCalled();
        expect(spyOnNewService.calls[0].arguments[0]).toBeFalsy();
        expect(catalogPagination.length).toBe(0); // Pagination is hidden
    });
    it('test the search of records with no new service added', () => {
        const SERVICE = {
            type: "csw",
            url: "url",
            title: "csw"
        };
        const actions = { onSearch: () => {}, setNewServiceStatus: () => {} };
        const spyOnNewService = expect.spyOn(actions, 'setNewServiceStatus');
        const spyOnSearch = expect.spyOn(actions, 'onSearch');
        const item = ReactDOM.render(<Catalog
            services={{ "csw": SERVICE}}
            selectedService="csw"
            isNewServiceAdded={false}
            onSearch={actions.onSearch}
            result={{numberOfRecordsMatched: 4, numberOfRecordsReturned: 10}}
            searchOptions={{startPosition: 1}}
            setNewServiceStatus={actions.setNewServiceStatus}
        />, document.getElementById("container"));
        expect(item).toExist();
        const catalogPagination = document.getElementsByClassName('catalog-pagination');
        const buttons = TestUtils.scryRenderedDOMComponentsWithTag(item, "button");
        expect(buttons.length).toBe(1);
        const searchButton = buttons[0];
        TestUtils.Simulate.click(searchButton);
        expect(spyOnNewService).toNotHaveBeenCalled();
        expect(spyOnSearch).toHaveBeenCalled();
        expect(spyOnSearch.calls[0].arguments[0]).toEqual({ format: 'csw', url: 'url', startPosition: 1, maxRecords: 4, text: '', options: {service: SERVICE} });
        expect(catalogPagination.length).toBe(1); // Pagination is displayed
    });
    it('test manage service with permission', () => {
        const SERVICE = {
            type: "csw",
            url: "url",
            title: "csw"
        };
        ReactDOM.render(<Catalog
            services={{ "csw": SERVICE}}
            canEdit
            selectedService="csw"
            isNewServiceAdded={false}
            result={{numberOfRecordsMatched: 4, numberOfRecordsReturned: 10}}
            searchOptions={{startPosition: 1}}
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        expect(container).toBeTruthy();
        let editEl = document.querySelector('.glyphicon-pencil');
        let addEl = document.querySelector('.glyphicon-plus');
        expect(editEl).toBeTruthy();
        expect(addEl).toBeTruthy();
    });
    it('test manage service with no permission', () => {
        const SERVICE = {
            type: "csw",
            url: "url",
            title: "csw"
        };
        ReactDOM.render(<Catalog
            services={{ "csw": SERVICE}}
            canEdit={false}
            selectedService="csw"
            isNewServiceAdded={false}
            result={{numberOfRecordsMatched: 4, numberOfRecordsReturned: 10}}
            searchOptions={{startPosition: 1}}
        />, document.getElementById("container"));
        const container = document.getElementById("container");
        expect(container).toBeTruthy();
        let editEl = document.querySelector('.glyphicon-pencil');
        let addEl = document.querySelector('.glyphicon-plus');
        expect(editEl).toBeFalsy();
        expect(addEl).toBeFalsy();
    });
});
