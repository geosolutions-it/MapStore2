/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

const PropTypes = require('prop-types');

var React = require('react');
var ReactDOM = require('react-dom');
var MousePosition = require('../MousePosition');

describe('MousePosition', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('checks enabled', () => {
        const cmp = ReactDOM.render(<MousePosition enabled mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}/>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.id).toExist();

        // checking that the copy to clipboard button don't exists
        const buttons = cmpDom.getElementsByTagName('button');
        expect(buttons).toExist();
        expect(buttons.length).toBe(0);
    });

    it('checks disabled', () => {
        const cmp = ReactDOM.render(<MousePosition enabled={false} mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}/>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toNotExist();
    });

    it('checks no position', () => {
        const cmp = ReactDOM.render(<MousePosition enabled/>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.innerText.indexOf('...') !== -1).toBe(true);
    });

    it('checks no elevation', () => {
        const cmp = ReactDOM.render(<MousePosition enabled />, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.getElementsByClassName('mapstore-mouse-elevation').length).toBe(0);
    });

    it('checks elevation enabled', () => {
        const cmp = ReactDOM.render(<MousePosition enabled showElevation mousePosition={{ x: 11, y: 12, z: 13, crs: "EPSG:4326" }}/>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.getElementsByClassName('mapstore-mouse-elevation').length).toBe(1);
        expect(cmpDom.innerHTML).toContain('13');
    });

    it('checks default templates degrees', () => {
        const cmp = ReactDOM.render(<MousePosition enabled mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}/>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.innerHTML).toContain('Lat:');
        expect(cmpDom.innerHTML).toContain('Lng:');
    });

    it('checks default templates meters', () => {
        const cmp = ReactDOM.render(<MousePosition enabled crs="EPSG:3857" mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}/>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.innerHTML).toContain('Y:');
        expect(cmpDom.innerHTML).toContain('X:');
    });

    it('checks custom template', () => {
        class Template extends React.Component {
            static propTypes = {
                position: PropTypes.object
            };

            render() {
                return <div>{this.props.position.lng},{this.props.position.lat}</div>;
            }
        }

        const cmp = ReactDOM.render(<MousePosition degreesTemplate={Template} enabled mousePosition={{x: 11, y: 12, crs: "EPSG:4326"}}/>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.innerHTML).toContain('11');
        expect(cmpDom.innerHTML).toContain('12');
    });

    it('checks custom elevation template', () => {
        const elevationTemplate = (z) => <div>Z: {z}</div>;

        const cmp = ReactDOM.render(<MousePosition elevationTemplate={elevationTemplate} showElevation enabled mousePosition={{ x: 11, y: 12, z: 13, crs: "EPSG:4326" }} />, document.getElementById("container"));
        expect(cmp).toExist();
        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.innerHTML).toContain('Z:');
        expect(cmpDom.innerHTML).toContain('13');
    });

    it('checks copy to clipboard enabled', () => {
        const cmp = ReactDOM.render(<MousePosition
            enabled
            mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}
            copyToClipboardEnabled
        />, document.getElementById("container"));
        expect(cmp).toExist();

        // checking if the component exists
        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.id).toExist();

        // checking if the copy to clipboard button exists
        const buttons = cmpDom.getElementsByTagName('button');
        expect(buttons).toExist();
        expect(buttons.length).toBe(1);
    });

    it('checks copy to clipboard action', () => {

        // creating a copy to clipboard callback to spy on
        const actions = {
            onCopy: () => {}
        };
        let spy = expect.spyOn(actions, "onCopy");

        // instaciating mouse position plugin
        const cmp = ReactDOM.render(<MousePosition
            enabled
            mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}
            copyToClipboardEnabled
            onCopy={actions.onCopy}
        />, document.getElementById("container"));
        // getting the copy to clipboard button
        const cmpDom = ReactDOM.findDOMNode(cmp);
        const button = cmpDom.getElementsByTagName('button')[0];

        // if propmt for ctrl+c we accept
        expect.spyOn(window, 'prompt').andReturn(true);

        // checking copy to clipboard invocation
        button.click();
        expect(spy.calls.length).toBe(1);
    });

    it('checks lat ang lag value', () => {

        // creating a copy to clipboard callback to spy on
        const actions = {
            onCopy: () => {}
        };
        let spy = expect.spyOn(actions, "onCopy");

        // instaciating mouse position plugin
        const cmp = ReactDOM.render(<MousePosition
            enabled
            mousePosition={{x: Math.floor(1.1), y: Math.floor(1.2), crs: "EPSG:4326"}}
            copyToClipboardEnabled
            onCopy={actions.onCopy}
        />, document.getElementById("container"));
        // getting the copy to clipboard button
        const cmpDom = ReactDOM.findDOMNode(cmp);
        const button = cmpDom.getElementsByTagName('button')[0];

        // if propmt for ctrl+c we accept
        expect.spyOn(window, 'prompt').andReturn(true);

        // checking copy to clipboard invocation
        button.click();
        expect(spy.calls.length).toBe(1);
    });

});
