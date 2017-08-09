/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var ReactDOM = require('react-dom');
var TButton = require('../TButton');
var expect = require('expect');
const spyOn = expect.spyOn;

const isVisibleButton = (el) => {
    return el.style.width !== 0 && el.style.width !== "0" && el.style.width !== "0px";
};

describe('Featuregrid TButton', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('TButton', () => {
        const events = {
            onClick: () => {}
        };
        spyOn(events, "onClick");
        ReactDOM.render(<TButton id="TEST_BUTTON" onClick={events.onClick} visible />, document.getElementById("container"));
        let editButton = document.getElementById("fg-TEST_BUTTON");
        expect(editButton).toExist();
        expect(isVisibleButton(editButton)).toBe(true);
        editButton.click();
        expect(events.onClick).toHaveBeenCalled();
        ReactDOM.render(<TButton id="TEST_BUTTON" onClick={events.onClick} visible active/>, document.getElementById("container"));
        editButton = document.getElementById("fg-TEST_BUTTON");
        expect(editButton.className.indexOf("success") >= 0).toBe(true);
        ReactDOM.render(<TButton id="TEST_BUTTON" onClick={events.onClick} />, document.getElementById("container"));
        editButton = document.getElementById("fg-TEST_BUTTON");
        expect(isVisibleButton(editButton)).toBe(false);
    });

});
