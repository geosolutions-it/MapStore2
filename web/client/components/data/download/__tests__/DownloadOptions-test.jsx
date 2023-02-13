/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import DownloadOptions from '../DownloadOptions';

describe('Test for DownloadOptions component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container" style="height:500px"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('render with defaults', () => {
        ReactDOM.render(<DownloadOptions />, document.getElementById("container"));
        expect(document.getElementsByTagName('form')[0]).toBeTruthy();
    });

    it('render serivce selector', () => {
        ReactDOM.render(<DownloadOptions wpsAvailable wfsAvailable />, document.getElementById("container"));
        const form = document.getElementsByTagName('form')[0];
        const firstChild = form.querySelector('label');
        expect(firstChild.innerHTML).toBe('<span>layerdownload.service</span>');
        const selectorValueLabel = form.querySelector('.Select .Select-value-label');
        expect(selectorValueLabel.innerText).toBe('WPS');
    });

    it('render service selector with WFS service', () => {
        ReactDOM.render(<DownloadOptions wpsAvailable wfsAvailable service="wfs" />, document.getElementById("container"));
        const form = document.getElementsByTagName('form')[0];
        const selectorValueLabel = form.querySelector('.Select .Select-value-label');
        expect(selectorValueLabel.innerText).toBe('WFS');
    });

    it('should not render service selector', () => {
        ReactDOM.render(<DownloadOptions wpsAvailable wfsAvailable={false} service="wps" />, document.getElementById("container"));
        const form = document.getElementsByTagName('form')[0];
        const selectors = form.querySelectorAll('.Select');
        expect(selectors.length).toBe(2);
    });
    it('should not render service selector if hideServiceSelector is true', () => {
        ReactDOM.render(<DownloadOptions wpsAvailable wfsAvailable hideServiceSelector service="wps" />, document.getElementById("container"));
        const form = document.getElementsByTagName('form')[0];
        const selectors = form.querySelectorAll('.Select');
        expect(selectors.length).toBe(2);
    });
});
