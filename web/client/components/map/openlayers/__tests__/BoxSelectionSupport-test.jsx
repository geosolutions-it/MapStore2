/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import ReactDOM from 'react-dom';

import BoxSelectionSupport from '../BoxSelectionSupport';

describe('Test BoxSelectionSupport', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="map"></div><div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should add interactions from map when status is start', (done) => {
        const map = {
            addInteraction: () => {
                done();
            }
        };
        ReactDOM.render(<BoxSelectionSupport status="start" map={map}/>, document.getElementById("container"));
    });

    it('should remove interactions from map when status is end', (done) => {
        const map = {
            removeInteraction: () => {
                done();
            }
        };
        ReactDOM.render(<BoxSelectionSupport status="end" map={map}/>, document.getElementById("container"));
    });

});
