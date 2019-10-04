
/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { scrollIntoViewId } from '../DOMUtil';

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

});
