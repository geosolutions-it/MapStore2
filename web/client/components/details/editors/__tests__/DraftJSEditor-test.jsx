/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import DraftJSEditor from '../DraftJSEditor';

describe('DraftJSEditor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('DraftJSEditor default rendering', () => {
        ReactDOM.render(<DraftJSEditor/>, document.getElementById('container'));
        expect(document.getElementsByClassName('rdw-editor-main')[0]).toExist();
    });
});
