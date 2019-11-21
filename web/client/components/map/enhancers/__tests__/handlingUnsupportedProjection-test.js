/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import expect from 'expect';
import ReactDOM from 'react-dom';
const {createSink} = require('recompose');

import {handlingUnsupportedProjection} from '../handlingUnsupportedProjection';

describe('handlingUnsupportedProjection enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('handlingUnsupportedProjection for unsupported projection', () => {
        const Sink = handlingUnsupportedProjection(createSink());
        ReactDOM.render(<Sink projection="EPSG:31468" />, document.getElementById("container"));
        const title = document.querySelector("h1 span");
        const description = document.querySelector(".empty-state-description span");
        expect(title).toExist();
        expect(title.innerText).toBe("map.errors.loading.title");
        expect(description).toExist();
        expect(description.innerText).toBe("map.errors.loading.projectionError");

    });

});
