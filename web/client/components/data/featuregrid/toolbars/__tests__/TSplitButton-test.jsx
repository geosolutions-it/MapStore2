/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import TSplitButton from "../TSplitButton";

const spyOn = expect.spyOn;

const isVisibleButton = (el) => {
    return el.style.width !== 0 && el.style.width !== "0" && el.style.width !== "0px";
};

describe('Featuregrid TSplitButton', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('TSplitButton', () => {
        const events = {
            onClick: () => {}
        };
        spyOn(events, "onClick");
        ReactDOM.render(<TSplitButton className="TEST_BUTTON" id="TEST_BUTTON" title="test" onClick={events.onClick} visible />, document.getElementById("container"));
        let snapButton = document.getElementById("TEST_BUTTON");
        expect(snapButton).toExist();
        expect(isVisibleButton(snapButton)).toBe(true);
        snapButton.click();
        expect(events.onClick).toHaveBeenCalled();
        ReactDOM.render(<TSplitButton className="TEST_BUTTON" id="TEST_BUTTON" title="test" onClick={events.onClick} visible active/>, document.getElementById("container"));
        snapButton = document.getElementById("TEST_BUTTON");
        expect(snapButton.className.indexOf("btn-success") >= 0).toBe(true);
        ReactDOM.render(<TSplitButton className="TEST_BUTTON" id="TEST_BUTTON" title="test" onClick={events.onClick} />, document.getElementById("container"));
        snapButton =  document.getElementById("TEST_BUTTON");
        expect(snapButton).toBe(null);
    });

});
