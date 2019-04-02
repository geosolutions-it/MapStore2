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
const DockPanel = require('../DockPanel');
const TestUtils = require('react-dom/test-utils');

describe("test DockPanel", () => {
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
        ReactDOM.render(<DockPanel />, document.getElementById("container"));
        const domComp = document.getElementsByClassName('ms-side-panel')[0];
        expect(domComp).toExist();
    });

    it('test open/close panel', () => {
        ReactDOM.render(<DockPanel open size={600}/>, document.getElementById("container"));
        let domComp = document.getElementsByClassName('ms-side-panel')[0];
        expect(domComp.children[0].children[0].clientWidth).toBe(600);
        expect(domComp.children[0].children[0].style.left).toBe('0px');

        ReactDOM.render(<DockPanel open={false} size={600}/>, document.getElementById("container"));
        domComp = document.getElementsByClassName('ms-side-panel')[0];
        expect(domComp.children[0].children[0].style.left).toBe('-600px');
    });

    it('test header, footer and children', () => {
        ReactDOM.render(
            <DockPanel
                open
                header={<div className="my-custom-head-row"/>}
                footer={<div className="my-custom-footer"/>}>
                <div className="my-custom-body-child"/>
            </DockPanel>, document.getElementById("container"));

        const header = document.getElementsByClassName('my-custom-head-row')[0];
        expect(header).toExist();
        const footer = document.getElementsByClassName('my-custom-footer')[0];
        expect(footer).toExist();
        const body = document.getElementsByClassName('my-custom-body-child')[0];
        expect(body).toExist();
    });
    it('test header, footer and children with closed panel (render nothing)', () => {
        // This prevents issues like "Pressing tab cause white space on right #3664"
        ReactDOM.render(
            <DockPanel
                header={<div className="my-custom-head-row" />}
                footer={<div className="my-custom-footer" />}>
                <div className="my-custom-body-child" />
            </DockPanel>, document.getElementById("container"));

        const header = document.getElementsByClassName('my-custom-head-row')[0];
        expect(header).toNotExist();
        const footer = document.getElementsByClassName('my-custom-footer')[0];
        expect(footer).toNotExist();
        const body = document.getElementsByClassName('my-custom-body-child')[0];
        expect(body).toNotExist();
    });

    it('test fullscreen', () => {
        ReactDOM.render(<DockPanel open showFullscreen onClose={() => {}}/>, document.getElementById("container"));
        const buttons = document.getElementsByClassName('square-button');
        expect(buttons.length).toBe(2);
        expect(buttons[0].children[0].getAttribute('class')).toBe('glyphicon glyphicon-chevron-left');
        TestUtils.Simulate.click(buttons[0]);
        expect(buttons[0].children[0].getAttribute('class')).toBe('glyphicon glyphicon-chevron-right');
    });

    it('hide header', () => {
        ReactDOM.render(
            <DockPanel
                open
                hideHeader
                header={<div className="my-custom-head-row"/>}
                footer={<div className="my-custom-footer"/>}>
                <div className="my-custom-body-child"/>
            </DockPanel>, document.getElementById("container"));

        const header = document.getElementsByClassName('my-custom-head-row');
        expect(header.length).toBe(0);
    });
});
