/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    createBase64Thumbnail,
    getVideoThumbnail
} from '../ThumbnailUtils';

describe('ThumbnailUtils', () => {

    it('createBase64Thumbnail', (done) => {
        createBase64Thumbnail('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII='/* png 1px x 1px */, {
            width: 64,
            height: 64,
            contain: false,
            type: 'image/jpeg',
            quality: 0.5
        })
            .then((data) => {
                try {
                    expect(data.match('image/jpeg')).toBeTruthy();
                    const img = new Image();
                    img.onload = () => {
                        expect(img.naturalWidth).toBe(64);
                        expect(img.naturalHeight).toBe(64);
                        done();
                    };
                    img.src = data;
                } catch (e) {
                    done(e);
                }
            });
    });
    it('getVideoThumbnail youtube', (done) => {
        getVideoThumbnail('https://www.youtube.com/watch?v=testIdentif')
            .then((data) => {
                try {
                    expect(data).toBe('http://img.youtube.com/vi/testIdentif/sddefault.jpg');
                } catch (e) {
                    done(e);
                }
                done();
            })
            .catch(e => done(e));
    });
});
