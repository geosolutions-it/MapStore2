/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import ExportDataResults from '../ExportDataResults';

describe('ExportDataResults component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('renders the download link of completed results', () => {
        const startTime = new Date(2026, 0, 1).getTime();
        ReactDOM.render(<ExportDataResults results={[
            { id: '1', layerName: 'layer1', layerTitle: 'Layer 1', startTime, status: 'completed', result: 'https://example.com/wps/output.zip' },
            { id: '2', layerName: 'layer2', layerTitle: 'Layer 2', startTime, status: 'completed', result: 'ftp://example.com/output.zip' },
            { id: '3', layerName: 'layer3', layerTitle: 'Layer 3', startTime, status: 'pending' }
        ]} />, document.getElementById('container'));
        const items = document.querySelectorAll('.mapstore-exportdataresults-item');
        expect(items.length).toBe(3);
        const links = [...items].map(item => {
            const link = item.querySelector('a');
            return link ? link.getAttribute('href') : 'no link';
        });
        expect(links).toEqual(['https://example.com/wps/output.zip', null, 'no link']);
    });
});
