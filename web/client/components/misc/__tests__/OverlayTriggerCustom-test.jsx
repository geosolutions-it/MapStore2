/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root dir
 ectory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import expect from 'expect';
import { Tooltip, Button } from 'react-bootstrap';

import OverlayTriggerCustom from '../OverlayTriggerCustom';

const overlay = <Tooltip id="tooltip-test"><span>Message</span></Tooltip>;

describe('OverlayTriggerCustom component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('tooltip on button hover', () => {
        const testComponent = (
            <OverlayTriggerCustom overlay={overlay}>
                <Button id="test-button">
                    Button
                </Button>
            </OverlayTriggerCustom>
        );

        ReactDOM.render(testComponent, document.getElementById('container'));
        const button = document.getElementById('test-button');
        expect(button).toExist();

        TestUtils.Simulate.mouseOver(button);

        const overlayElement = document.getElementById('tooltip-test');
        expect(overlayElement).toExist();
    });
    it('tooltip on disabled button hover', () => {
        const testComponent = (
            <OverlayTriggerCustom overlay={overlay}>
                <Button id="test-button" disabled>
                    Button
                </Button>
            </OverlayTriggerCustom>
        );

        ReactDOM.render(testComponent, document.getElementById('container'));
        const button = document.getElementById('test-button');
        expect(button).toExist();

        TestUtils.Simulate.mouseOver(button);

        const overlayElement = document.getElementById('tooltip-test');
        expect(overlayElement).toExist();
    });
});
