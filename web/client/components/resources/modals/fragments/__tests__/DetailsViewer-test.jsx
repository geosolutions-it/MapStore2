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

describe('DetailsViewer — DOMPurify sanitization (SM-07 / X-02)', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('strips <script> from detailsText', () => {
        window.__xss_dv = undefined;
        ReactDOM.render(
            <DetailsViewer detailsText={'<p>hi</p><script>window.__xss_dv=true</script>'} />,
            document.getElementById('container')
        );
        expect(window.__xss_dv).toBe(undefined);
        expect(document.body.innerHTML.indexOf('<script')).toBe(-1);
    });

    it('preserves safe formatting', () => {
        ReactDOM.render(
            <DetailsViewer detailsText={'<p><b>hello</b></p>'} />,
            document.getElementById('container')
        );
        expect(document.querySelector('b')).toBeTruthy();
    });

    it('handles nil detailsText gracefully', () => {
        expect(() => ReactDOM.render(
            <DetailsViewer detailsText={null} />, document.getElementById('container')
        )).toNotThrow();
    });
});
