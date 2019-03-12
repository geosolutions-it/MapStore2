/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const StyleList = require('../StyleList');
const TestUtils = require('react-dom/test-utils');
const expect = require('expect');

describe('test StyleList module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test StyleList show list', () => {

        ReactDOM.render(<StyleList
            defaultStyle="point"
            enabledStyle="square"
            availableStyles={
                [
                    {
                        name: 'point',
                        filename: 'default_point.sld',
                        format: 'sld',
                        title: 'A boring default style',
                        _abstract: 'A sample style that just prints out a purple square'
                    },
                    {
                        name: 'square',
                        filename: 'square.css',
                        format: 'css',
                        title: 'Square',
                        _abstract: 'Simple square'
                    },
                    {
                        name: 'css',
                        filename: 'circle.css',
                        format: 'css',
                        title: 'Circle',
                        _abstract: 'Simple circle'
                    }
                ]
            }/>, document.getElementById("container"));

        const cards = document.querySelectorAll('.mapstore-side-card');
        expect(cards.length).toBe(3);

        const selectedTitle = document.querySelector('.mapstore-side-card.selected .mapstore-side-card-title span');
        expect(selectedTitle.innerHTML).toBe('Square');

        const svgIconsText = document.querySelectorAll('svg text');
        expect(svgIconsText.length).toBe(3);

        expect(svgIconsText[0].innerHTML).toBe('SLD');
        expect(svgIconsText[1].innerHTML).toBe('CSS');
        expect(svgIconsText[2].innerHTML).toBe('CSS');
    });

    it('test StyleList onSelect', () => {

        const testHandlers = {
            onSelect: () => {}
        };

        const spyOnSelect = expect.spyOn(testHandlers, 'onSelect');

        ReactDOM.render(<StyleList
            defaultStyle="point"
            enabledStyle="square"
            onSelect={testHandlers.onSelect}
            availableStyles={
                [
                    {
                        name: 'point',
                        filename: 'default_point.sld',
                        format: 'sld',
                        title: 'A boring default style',
                        _abstract: 'A sample style that just prints out a purple square'
                    },
                    {
                        name: 'square',
                        filename: 'square.css',
                        format: 'css',
                        title: 'Square',
                        _abstract: 'Simple square'
                    },
                    {
                        name: 'circle',
                        filename: 'circle.css',
                        format: 'css',
                        title: 'Circle',
                        _abstract: 'Simple circle'
                    }
                ]
            }/>, document.getElementById("container"));

        const cards = document.querySelectorAll('.mapstore-side-card');
        expect(cards.length).toBe(3);

        TestUtils.Simulate.click(cards[2]);

        expect(spyOnSelect).toHaveBeenCalledWith({style: 'circle'}, true);
    });

    it('test StyleList onSelect default', () => {

        const testHandlers = {
            onSelect: () => {}
        };

        const spyOnSelect = expect.spyOn(testHandlers, 'onSelect');

        ReactDOM.render(<StyleList
            defaultStyle="point"
            enabledStyle="square"
            onSelect={testHandlers.onSelect}
            availableStyles={
                [
                    {
                        name: 'point',
                        filename: 'default_point.sld',
                        format: 'sld',
                        title: 'A boring default style',
                        _abstract: 'A sample style that just prints out a purple square'
                    },
                    {
                        name: 'square',
                        filename: 'square.css',
                        format: 'css',
                        title: 'Square',
                        _abstract: 'Simple square'
                    },
                    {
                        name: 'circle',
                        filename: 'circle.css',
                        format: 'css',
                        title: 'Circle',
                        _abstract: 'Simple circle'
                    }
                ]
            }/>, document.getElementById("container"));

        const cards = document.querySelectorAll('.mapstore-side-card');
        expect(cards.length).toBe(3);

        TestUtils.Simulate.click(cards[0]);

        expect(spyOnSelect).toHaveBeenCalledWith({style: ''}, true);
    });


    it('test StyleList showDefaultStyleIcon', () => {

        ReactDOM.render(<StyleList
            defaultStyle="point"
            enabledStyle="square"
            showDefaultStyleIcon
            availableStyles={
                [
                    {
                        name: 'point',
                        filename: 'default_point.sld',
                        format: 'sld',
                        title: 'A boring default style',
                        _abstract: 'A sample style that just prints out a purple square'
                    },
                    {
                        name: 'square',
                        filename: 'square.css',
                        format: 'css',
                        title: 'Square',
                        _abstract: 'Simple square'
                    },
                    {
                        name: 'circle',
                        filename: 'circle.css',
                        format: 'css',
                        title: 'Circle',
                        _abstract: 'Simple circle'
                    }
                ]
            }/>, document.getElementById("container"));
        const cards = document.querySelectorAll('.mapstore-side-card');
        expect(cards.length).toBe(3);

        const iconDefault = cards[0].querySelectorAll('.glyphicon');
        expect(iconDefault.length).toBe(1);

        const icon1 = cards[1].querySelectorAll('.glyphicon');
        expect(icon1.length).toBe(0);

        const icon2 = cards[1].querySelectorAll('.glyphicon');
        expect(icon2.length).toBe(0);
    });
});
