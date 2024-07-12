
/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { getOffsetBottom, getOffsetTop, scrollIntoViewId } from '../DOMUtil';

describe('Test the DOMUtils', () => {

    it('should test scrollIntoView', function() {
        document.body.innerHTML = '<div id="container"></div>';
        const handlers = {
            scroll: () => { }
        };
        const spy = expect.spyOn(handlers, 'scroll');
        window.HTMLElement.prototype.scrollIntoView = handlers.scroll;
        scrollIntoViewId('container');
        expect(spy.calls.length).toEqual(1);
    });
    it('test getOffsetTop', function() {
        const desiredOffset = 8;
        document.body.style.cssText = `margin: ${desiredOffset} px;`;
        document.body.innerHTML = `
        <div id="container">
            <div id="content">
            test
            </div>
        </div>`;
        const offset = getOffsetTop(document.querySelector("#content"));
        expect(offset).toEqual(desiredOffset);
    });
    it('test getOffsetBottom', function() {
        document.body.style.cssText = `margin: 8 px;`;
        document.body.innerHTML = `
        <div id="container">
            <div id="content" style="height: 18px">
            test
            </div>
        </div>`;
        const offset = getOffsetBottom(document.querySelector("#content"));
        expect(offset).toEqual(10);
    });

});
