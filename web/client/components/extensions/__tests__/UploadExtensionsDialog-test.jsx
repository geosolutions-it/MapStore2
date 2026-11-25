/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import expect from 'expect';

import UploadExtensionsDialog from '../UploadExtensionsDialog';

const installButton = () => [...document.querySelectorAll('.modal-footer button')].find(button => button.textContent === 'contextCreator.configurePlugins.install');

describe('UploadExtensionsDialog component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('lists the files with their warnings and installs only when a file is valid', () => {
        const toUpload = [
            { name: 'PrivacySettings', file: {}, warning: 'replaces 1.0.0' },
            { name: 'broken.zip', file: {}, error: new Error('wrong format') }
        ];
        const onInstall = expect.createSpy();
        ReactDOM.render(<UploadExtensionsDialog toUpload={toUpload} onInstall={onInstall} />, document.getElementById('container'));
        expect([...document.querySelectorAll('.uploading-file .plugin-name')].map(node => node.textContent)).toEqual(['PrivacySettings', 'broken.zip']);
        expect([...document.querySelectorAll('.upload-warning')].map(node => node.textContent)).toEqual(['replaces 1.0.0']);
        expect(document.querySelectorAll('.upload-error .glyphicon-warning-sign').length).toBe(1);
        expect(installButton().classList.contains('disabled')).toBe(false);
        ReactTestUtils.Simulate.click(installButton());
        expect(onInstall.calls.length).toBe(1);
    });
    it('cannot install when every file has an error, and removes a file by index', () => {
        const onRemove = expect.createSpy();
        const onInstall = expect.createSpy();
        ReactDOM.render(<UploadExtensionsDialog toUpload={[{ name: 'a.zip', error: new Error('x') }]} onRemove={onRemove} onInstall={onInstall} />, document.getElementById('container'));
        expect(installButton().classList.contains('disabled')).toBe(true);
        ReactTestUtils.Simulate.click(installButton());
        expect(onInstall.calls.length).toBe(0);
        ReactTestUtils.Simulate.click(document.querySelector('.upload-remove'));
        expect(onRemove.calls[0].arguments).toEqual([0]);
    });
    it('shows the error of the upload', () => {
        ReactDOM.render(<UploadExtensionsDialog uploadStatus={{ result: 'error', error: { message: 'denied' } }} />, document.getElementById('container'));
        expect(document.querySelector('.alert-danger').textContent).toBe('contextCreator.configurePlugins.uploadErrordenied');
    });
});
