/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import FeatureInfoEditor from '../FeatureInfoEditor';

describe("test FeatureInfoEditor", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test rendering edit modal', () => {
        ReactDOM.render(<FeatureInfoEditor showEditor/>, document.getElementById("container"));
        const modalEditor = document.getElementsByClassName('ms-resizable-modal');
        expect(modalEditor.length).toBe(1);
    });

});
