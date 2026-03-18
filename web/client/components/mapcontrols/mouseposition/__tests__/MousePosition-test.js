/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import MousePosition from '../MousePosition';

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
        ReactDOM.render(<MousePosition id="mouse-position" enabled mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}/>, document.getElementById("container"));
        const cmp = document.getElementById("container");
        expect(cmp).toExist();

        const cmpDom = cmp.querySelector('#mouse-position');
        expect(cmpDom).toExist();

        // checking that the copy to clipboard button don't exists
        const buttons = cmpDom.getElementsByTagName('button');
        expect(buttons).toExist();
        expect(buttons.length).toBe(0);
    });

    it('checks disabled', () => {
        ReactDOM.render(<MousePosition id="mouse-position" enabled={false} mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}/>, document.getElementById("container"));
        const cmp = document.getElementById("container");
        expect(cmp).toExist();

        const cmpDom = cmp.querySelector('#mouse-position');
        expect(cmpDom).toNotExist();
    });

    it('checks no position', () => {
        ReactDOM.render(<MousePosition id="mouse-position" enabled/>, document.getElementById("container"));
        const cmp = document.getElementById("container");
        expect(cmp).toExist();

        const cmpDom = cmp.querySelector('#mouse-position');
        expect(cmpDom).toExist();
        expect(cmpDom.innerText.indexOf('...') !== -1).toBe(true);
    });

    it('checks no elevation', () => {
        ReactDOM.render(<MousePosition id="mouse-position" enabled />, document.getElementById("container"));
        const cmp = document.getElementById("container");
        expect(cmp).toExist();

        const cmpDom = cmp.querySelector('#mouse-position');
        expect(cmpDom).toExist();
        expect(cmpDom.getElementsByClassName('mapstore-mouse-elevation').length).toBe(0);
    });

    it('checks elevation enabled', () => {
        ReactDOM.render(<MousePosition id="mouse-position" enabled showElevation mousePosition={{ x: 11, y: 12, z: 13, crs: "EPSG:4326" }}/>, document.getElementById("container"));
        const cmp = document.getElementById("container");
        expect(cmp).toExist();

        const cmpDom = cmp.querySelector('#mouse-position');
        expect(cmpDom).toExist();

        expect(cmpDom.innerHTML).toContain('Alt:');
        expect(cmpDom.innerHTML).toContain('13 m');
    });

    it('checks default templates degrees', () => {
        ReactDOM.render(<MousePosition id="mouse-position" enabled mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}/>, document.getElementById("container"));
        const cmp = document.getElementById("container");
        expect(cmp).toExist();

        const cmpDom = cmp.querySelector('#mouse-position');
        expect(cmpDom).toExist();

        expect(cmpDom.innerHTML).toContain('Lat:');
        expect(cmpDom.innerHTML).toContain('Lng:');
    });

    it('checks default templates meters', () => {
        ReactDOM.render(<MousePosition id="mouse-position" enabled crs="EPSG:3857" mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}/>, document.getElementById("container"));
        const cmp = document.getElementById("container");
        expect(cmp).toExist();

        const cmpDom = cmp.querySelector('#mouse-position');
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

        ReactDOM.render(<MousePosition id="mouse-position" degreesTemplate={Template} enabled mousePosition={{x: 11, y: 12, crs: "EPSG:4326"}}/>, document.getElementById("container"));
        const cmp = document.getElementById("container");
        expect(cmp).toExist();

        const cmpDom = cmp.querySelector('#mouse-position');
        expect(cmpDom).toExist();
        expect(cmpDom.innerHTML).toContain('11');
        expect(cmpDom.innerHTML).toContain('12');
    });

    it('checks custom elevation template', () => {
        const elevationTemplate = (z) => <div>Z: {z}</div>;
        ReactDOM.render(<MousePosition id="mouse-position" elevationTemplate={elevationTemplate} showElevation enabled mousePosition={{ x: 11, y: 12, z: 13, crs: "EPSG:4326" }} />, document.getElementById("container"));
        const cmp = document.getElementById("container");
        expect(cmp).toExist();
        const cmpDom = cmp.querySelector('#mouse-position');
        expect(cmpDom).toExist();
        expect(cmpDom.innerHTML).toContain('Z:');
        expect(cmpDom.innerHTML).toContain('13');
    });

    it('checks copy to clipboard enabled', () => {
        ReactDOM.render(<MousePosition
            id="mouse-position"
            enabled
            mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}
            copyToClipboardEnabled
        />, document.getElementById("container"));
        const cmp = document.getElementById("container");
        expect(cmp).toExist();

        // checking if the component exists
        const cmpDom = cmp.querySelector('#mouse-position');
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
        ReactDOM.render(<MousePosition
            id="mouse-position"
            enabled
            mousePosition={{x: 1, y: 1, crs: "EPSG:4326"}}
            copyToClipboardEnabled
            onCopy={actions.onCopy}
        />, document.getElementById("container"));
        // getting the copy to clipboard button
        const cmpDom = document.getElementById("container");
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
        ReactDOM.render(<MousePosition
            id="mouse-position"
            enabled
            mousePosition={{x: Math.floor(1.1), y: Math.floor(1.2), crs: "EPSG:4326"}}
            copyToClipboardEnabled
            onCopy={actions.onCopy}
        />, document.getElementById("container"));
        // getting the copy to clipboard button
        const cmpDom = document.getElementById("container");
        const button = cmpDom.getElementsByTagName('button')[0];

        // if propmt for ctrl+c we accept
        expect.spyOn(window, 'prompt').andReturn(true);

        // checking copy to clipboard invocation
        button.click();
        expect(spy.calls.length).toBe(1);
    });

});
