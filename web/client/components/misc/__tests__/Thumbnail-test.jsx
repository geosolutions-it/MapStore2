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
import Thumbnail from '../Thumbnail';
import { Simulate } from 'react-dom/test-utils';

describe('Thumbnail component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<Thumbnail/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.dropzone-thumbnail-container')).toBeTruthy();
    });
    it('should trigger update', (done) => {
        ReactDOM.render(<Thumbnail
            onUpdate={(data) =>{
                try {
                    expect(data).toBeTruthy();
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-thumbnail-dropzone')).toBeTruthy();

        const file = new Blob([null], { type: 'image/png' });
        const input = document.querySelector('input');
        Simulate.drop(input, { dataTransfer: { files: [file] } });

        const loadingNode = document.querySelector('.ms-loading');
        expect(loadingNode).toBeTruthy();
    });
    it('should trigger error', (done) => {
        ReactDOM.render(<Thumbnail
            onError={(error) =>{
                try {
                    expect(error).toEqual([ 'FORMAT' ]);
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-thumbnail-dropzone')).toBeTruthy();

        const file = new Blob([null], { type: 'text/plain' });
        const input = document.querySelector('input');
        Simulate.drop(input, { dataTransfer: { files: [file] } });

        const loadingNode = document.querySelector('.ms-loading');
        expect(loadingNode).toBeTruthy();
    });
    it('should trigger remove', (done) => {
        ReactDOM.render(<Thumbnail
            thumbnail="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII="
            onRemove={(arg) =>{
                try {
                    expect(arg).toBeFalsy();
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-thumbnail-dropzone')).toBeTruthy();

        const removeNode = document.querySelector('.btn');
        expect(removeNode).toBeTruthy();
        Simulate.click(removeNode);
        const loadingNode = document.querySelector('.ms-loading');
        expect(loadingNode).toBeTruthy();
    });
});
