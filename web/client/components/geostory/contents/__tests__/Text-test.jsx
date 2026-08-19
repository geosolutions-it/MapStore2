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

describe('GeoStory Text content', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    describe('security checks', () => {
        it('removes script tags from the html content', () => {
            window.__textContentScript = undefined;
            ReactDOM.render(
                <Text mode={Modes.VIEW} html={'<p>content</p><script>window.__textContentScript = true</script>'} />,
                document.getElementById('container')
            );
            expect(window.__textContentScript).toBe(undefined);
            expect(document.getElementById('container').innerHTML.indexOf('<script')).toBe(-1);
        });
        it('keeps the formatting tags of the html content', () => {
            ReactDOM.render(
                <Text mode={Modes.VIEW} html={'<p><b>bold</b></p>'} />,
                document.getElementById('container')
            );
            expect(document.querySelector('.ms-text-wrapper b')).toBeTruthy();
        });
        it('renders an empty html content without throwing', () => {
            expect(() => ReactDOM.render(
                <Text mode={Modes.VIEW} html={null} />, document.getElementById('container')
            )).toNotThrow();
        });
    });
});
