/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import ImageList from '../ImageList';

describe('ImageList component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ImageList rendering with defaults', () => {
        ReactDOM.render(<ImageList/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-imageList')).toBeTruthy();
        expect(container.querySelector('.msEmptyListMessage')).toBeTruthy();
    });
    it('does not renders empty list message', () => {
        ReactDOM.render(<ImageList resources={[
            {
                id: "test",
                data: {}
            }
        ]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-imageList')).toBeTruthy();
        expect(container.querySelector('.msEmptyListMessage')).toBeFalsy();

    });
});
