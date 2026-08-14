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

import { Modes } from '../../../../utils/GeoStoryUtils';
import Text from '../Text';

describe('GeoStory Text content — DOMPurify sanitization (SM-06 / X-01)', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('strips <script> from html prop', () => {
        window.__xss_text = undefined;
        ReactDOM.render(
            <Text mode={Modes.VIEW} html={'<p>ok</p><script>window.__xss_text=true</script>'} />,
            document.getElementById('container')
        );
        expect(window.__xss_text).toBe(undefined);
        expect(document.body.innerHTML.indexOf('<script')).toBe(-1);
    });

    it('preserves safe formatting', () => {
        ReactDOM.render(
            <Text mode={Modes.VIEW} html={'<p><b>bold</b></p>'} />,
            document.getElementById('container')
        );
        expect(document.querySelector('.ms-text-wrapper b')).toBeTruthy();
    });

    it('handles empty/null html without throwing', () => {
        expect(() => ReactDOM.render(
            <Text mode={Modes.VIEW} html={null} />, document.getElementById('container')
        )).toNotThrow();
    });
});
