/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import DetailsViewer from '../DetailsViewer';

describe('DetailsViewer component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    describe('sanitization', () => {
        it('removes script tags from the details text', () => {
            window.__detailsViewerScript = undefined;
            ReactDOM.render(
                <DetailsViewer detailsText={'<p>content</p><script>window.__detailsViewerScript = true</script>'} />,
                document.getElementById('container')
            );
            expect(window.__detailsViewerScript).toBe(undefined);
            expect(document.getElementById('container').innerHTML.indexOf('<script')).toBe(-1);
        });
        it('keeps the formatting tags of the details text', () => {
            ReactDOM.render(
                <DetailsViewer detailsText={'<p><b>bold</b></p>'} />,
                document.getElementById('container')
            );
            expect(document.querySelector('b')).toBeTruthy();
        });
        it('renders a nil details text without throwing', () => {
            expect(() => ReactDOM.render(
                <DetailsViewer detailsText={null} />, document.getElementById('container')
            )).toNotThrow();
        });
    });
});
