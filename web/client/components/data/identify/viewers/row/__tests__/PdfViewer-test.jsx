/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { waitFor } from '@testing-library/react';

import PdfViewer from '../PdfViewer';
import axios from '../../../../../../libs/ajax';

const SRC = 'https://example.com/file.pdf';
const OBJECT_URL = 'blob:https://example.com/file';

describe('PdfViewer', () => {
    let mockAxios;
    let originalCreateObjectURL;
    let originalRevokeObjectURL;
    let revoked;

    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
        mockAxios = new MockAdapter(axios);
        revoked = [];
        originalCreateObjectURL = URL.createObjectURL;
        originalRevokeObjectURL = URL.revokeObjectURL;
        URL.createObjectURL = () => OBJECT_URL;
        URL.revokeObjectURL = (url) => revoked.push(url);
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        mockAxios.restore();
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
    });

    const render = () => act(() => {
        ReactDOM.render(<PdfViewer src={SRC} title="Document"/>, document.getElementById('container'));
    });

    const unmount = () => act(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
    });

    it('renders the downloaded document in an iframe', () => {
        mockAxios.onGet(SRC).reply(200, 'pdf-content');
        render();
        return waitFor(() => {
            const iframe = document.querySelector('.ms-pdf .ms-pdf-frame');
            expect(iframe).toExist();
            expect(iframe.getAttribute('src')).toBe(OBJECT_URL);
            expect(iframe.getAttribute('title')).toBe('Document');
        });
    });

    it('revokes the object URL on unmount', () => {
        mockAxios.onGet(SRC).reply(200, 'pdf-content');
        render();
        return waitFor(() => expect(document.querySelector('iframe')).toExist())
            .then(() => {
                unmount();
                expect(revoked).toEqual([OBJECT_URL]);
            });
    });

    it('revokes the object URL when unmounted before the download resolves', () => {
        let sendResponse;
        const pending = new Promise((resolve) => { sendResponse = resolve; });
        mockAxios.onGet(SRC).reply(() => pending.then(() => [200, 'pdf-content']));
        render();
        unmount();
        sendResponse();
        return waitFor(() => expect(revoked).toEqual([OBJECT_URL]));
    });
});
