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

import DetailsRow from '../DetailsRow';

describe('DetailsRow component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('DetailsRow with defaults', () => {
        ReactDOM.render(<DetailsRow/>, document.getElementById('container'));
        const details = document.getElementsByClassName('ms-details-sheet')[0];
        expect(details).toExist();
        const btnGroup = details.getElementsByTagName('button');
        expect(btnGroup.length).toBe(1);
        expect(btnGroup[0].getElementsByClassName('glyphicon-pencil-add').length).toBe(1);
    });
    it('DetailsRow no buttons when loading', () => {
        ReactDOM.render(<DetailsRow loading/>, document.getElementById('container'));
        const details = document.getElementsByClassName('ms-details-sheet')[0];
        expect(details).toExist();
        const btnGroup = details.getElementsByTagName('button');
        expect(btnGroup.length).toBe(0);
    });
});
