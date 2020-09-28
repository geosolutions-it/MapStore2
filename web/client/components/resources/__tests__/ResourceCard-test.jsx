/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var ReactDOM = require('react-dom');
var ResourceCard = require('../ResourceCard.jsx');
var expect = require('expect');

const TestUtils = require('react-dom/test-utils');

describe('This test for ResourceCard', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    // test DEFAULTS
    it('creates the component with defaults', () => {
        const mapItem = ReactDOM.render(<ResourceCard map={{}} />, document.getElementById("container"));
        expect(mapItem).toExist();

        const mapItemDom = ReactDOM.findDOMNode(mapItem);
        expect(mapItemDom).toExist();

        expect(mapItemDom.childNodes[0].className).toBe('gridcard map-thumb');
        const headings = mapItemDom.getElementsByClassName('gridcard-title');
        expect(headings.length).toBe(1);
    });
    // test DEFAULTS
    it('creates the component with data', () => {
        const testName = "test";
        const testDescription = "testDescription";
        const mapItem = ReactDOM.render(<ResourceCard resource={{ name: testName, description: testDescription }} />, document.getElementById("container"));
        expect(mapItem).toExist();

        const mapItemDom = ReactDOM.findDOMNode(mapItem);
        expect(mapItemDom).toExist();

        expect(mapItemDom.childNodes[0].className).toBe('gridcard map-thumb');
        const headings = mapItemDom.getElementsByClassName('gridcard-title');
        expect(headings.length).toBe(1);
        expect(headings[0].innerHTML).toBe(testName);
    });
    describe('thumbnail', () => {
        const THUMB_SELECTOR = '.map-thumb';
        const DEFAULT_IMAGE = require('../../maps/style/default.jpg');
        const DEFAULT_BACKGROUND_IMAGE = `url("${DEFAULT_IMAGE}")`;
        it('no thumbnail', () => {
            const resource = {
                name: "test",
                description: "testDescription"
            };

            ReactDOM.render(<ResourceCard resource={resource} />, document.getElementById("container"));
            const thumb = document.querySelector(THUMB_SELECTOR);
            expect(thumb.style.backgroundImage).toBe(DEFAULT_BACKGROUND_IMAGE);
        });
        it('test thumbnail with NODATA value', () => {
            const resource = {
                name: "test",
                description: "testDescription",
                thumbnail: "NODATA"
            };

            ReactDOM.render(<ResourceCard resource={resource} />, document.getElementById("container"));
            const thumb = document.querySelector(THUMB_SELECTOR);
            expect(thumb.style.backgroundImage).toBe(DEFAULT_BACKGROUND_IMAGE);
        });
        it('test thumbnail with normal thumb', () => {
            const resource = {
                name: "test",
                description: "testDescription",
                thumbnail: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
            };
            ReactDOM.render(<ResourceCard resource={resource} />, document.getElementById("container"));
            const thumb = document.querySelector(THUMB_SELECTOR);
            expect(thumb.style.backgroundImage).toBe(`linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3)), url("${resource.thumbnail}")`);
        });
    });

    it('test edit/delete/share', () => {
        const testName = "test";
        const testDescription = "testDescription";

        const handlers = {
            viewerUrl: () => { },
            onEdit: () => { },
            onDelete: () => { },
            onShare: () => { }
        };


        let spyonEdit = expect.spyOn(handlers, "onEdit");
        let spyonDelete = expect.spyOn(handlers, "onDelete");
        let spyonShare = expect.spyOn(handlers, "onShare");
        const component = ReactDOM.render(<ResourceCard
            viewerUrl={handlers.viewerUrl}
            onDelete={handlers.onDelete}
            onEdit={handlers.onEdit}
            onShare={handlers.onShare}
            resource={{ canEdit: true, id: 1, name: testName, description: testDescription }} />, document.getElementById("container"));
        const buttons = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'button'
        );
        expect(buttons.length).toBe(3);
        buttons.forEach(b => TestUtils.Simulate.click(b));
        expect(spyonEdit.calls.length).toEqual(1);
        expect(spyonShare.calls.length).toEqual(1);
        // wait for confirm
        expect(spyonDelete.calls.length).toEqual(0);
        expect(document.querySelector('.modal-dialog')).toExist();
        const confirmBtn = document.querySelectorAll('.modal-footer .btn-primary')[0];
        expect(confirmBtn).toExist();
        TestUtils.Simulate.click(confirmBtn);
        expect(spyonDelete.calls.length).toEqual(1);

    });

    it('test resource with icon', () => {
        const resource = {
            canEdit: true,
            name: "test",
            description: "testDescription",
            icon: '1-map'
        };

        ReactDOM.render(<ResourceCard resource={resource}/>, document.getElementById('container'));

        const icon = document.querySelector('.map-thumb-description + div');
        expect(icon).toExist();
        const glyph = icon.getElementsByClassName('glyphicon-1-map')[0];
        expect(glyph).toExist();
    });
});
