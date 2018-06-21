/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const expect = require('expect');
const ReactDOM = require('react-dom');
const PanelHeader = require('../PanelHeader');

describe("test PanelHeader", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test rendering', () => {
        ReactDOM.render(<PanelHeader />, document.getElementById("container"));
        const domComp = document.getElementsByClassName('ms-header')[0];
        expect(domComp).toExist();
        const styleClass = document.getElementsByClassName('ms-default')[0];
        expect(styleClass).toExist();
        const buttons = document.getElementsByClassName('square-button');
        expect(buttons.length).toBe(2);
        expect(buttons[1].children[0].getAttribute('class')).toBe('glyphicon glyphicon-1-close');
    });

    it('test left position', () => {
        ReactDOM.render(<PanelHeader position="left"/>, document.getElementById("container"));
        const domComp = document.getElementsByClassName('ms-header')[0];
        expect(domComp).toExist();
        const styleClass = document.getElementsByClassName('ms-default')[0];
        expect(styleClass).toExist();
        const buttons = document.getElementsByClassName('square-button');
        expect(buttons.length).toBe(2);
        expect(buttons[0].children[0].getAttribute('class')).toBe('glyphicon glyphicon-1-close');
    });

    it('test additional rows', () => {
        ReactDOM.render(<PanelHeader additionalRows={<div className="custom-header-row"/>}/>, document.getElementById("container"));
        const domComp = document.getElementsByClassName('ms-header')[0];
        expect(domComp).toExist();
        const styleClass = document.getElementsByClassName('ms-default')[0];
        expect(styleClass).toExist();
        const buttons = document.getElementsByClassName('square-button');
        expect(buttons.length).toBe(2);
        expect(buttons[1].children[0].getAttribute('class')).toBe('glyphicon glyphicon-1-close');
        const customRow = document.getElementsByClassName('custom-header-row');
        expect(customRow).toExist();
    });

    it('test additional bsStyle', () => {
        ReactDOM.render(<PanelHeader bsStyle="primary"/>, document.getElementById("container"));
        const domComp = document.getElementsByClassName('ms-header')[0];
        expect(domComp).toExist();
        const styleClass = document.getElementsByClassName('ms-primary')[0];
        expect(styleClass).toExist();
        const icon = document.getElementsByClassName('bg-primary');
        expect(icon.length).toBe(1);
        const buttons = document.getElementsByClassName('btn-primary');
        expect(buttons.length).toBe(1);
    });

    it('test fullscreen glyphs', () => {
        // right
        ReactDOM.render(<PanelHeader showFullscreen />, document.getElementById("container"));
        let fullscreenGlyph = document.getElementsByClassName('glyphicon-chevron-left')[0];
        expect(fullscreenGlyph).toExist();
        ReactDOM.render(<PanelHeader showFullscreen fullscreen/>, document.getElementById("container"));
        fullscreenGlyph = document.getElementsByClassName('glyphicon-chevron-right')[0];
        expect(fullscreenGlyph).toExist();
        // left
        ReactDOM.render(<PanelHeader position="left" showFullscreen/>, document.getElementById("container"));
        fullscreenGlyph = document.getElementsByClassName('glyphicon-chevron-right')[0];
        expect(fullscreenGlyph).toExist();
        ReactDOM.render(<PanelHeader position="left" showFullscreen fullscreen/>, document.getElementById("container"));
        fullscreenGlyph = document.getElementsByClassName('glyphicon-chevron-left')[0];
        expect(fullscreenGlyph).toExist();
        // bottom
        ReactDOM.render(<PanelHeader position="bottom" showFullscreen/>, document.getElementById("container"));
        fullscreenGlyph = document.getElementsByClassName('glyphicon-chevron-up')[0];
        expect(fullscreenGlyph).toExist();
        ReactDOM.render(<PanelHeader position="bottom" showFullscreen fullscreen/>, document.getElementById("container"));
        fullscreenGlyph = document.getElementsByClassName('glyphicon-chevron-down')[0];
        expect(fullscreenGlyph).toExist();
        // top
        ReactDOM.render(<PanelHeader position="top" showFullscreen/>, document.getElementById("container"));
        fullscreenGlyph = document.getElementsByClassName('glyphicon-chevron-down')[0];
        expect(fullscreenGlyph).toExist();
        ReactDOM.render(<PanelHeader position="top" showFullscreen fullscreen/>, document.getElementById("container"));
        fullscreenGlyph = document.getElementsByClassName('glyphicon-chevron-up')[0];
        expect(fullscreenGlyph).toExist();
    });

    it('test icon not button', () => {
        ReactDOM.render(<PanelHeader bsStyle="primary"/>, document.getElementById("container"));
        const domComp = document.getElementsByClassName('ms-header')[0];
        expect(domComp).toExist();
        const icon = document.getElementsByClassName('bg-primary');
        expect(icon.length).toBe(1);
        expect(icon[0].tagName.toLowerCase()).toBe('div');
    });
});
