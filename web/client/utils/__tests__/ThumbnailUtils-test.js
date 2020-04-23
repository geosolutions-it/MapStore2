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
    getVideoFrame,
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
    it('getVideoFrame', (done) => {
        const videoBase64 = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAA0ptZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1NyByMjkzMiAzMDNjNDg0IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxOCAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTI1IHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAKmWIhAA///73aJ8Cm15hqoDklcUl20+B/6tncOAcX/2PHODTehPb44B1wQAAAAtBmiRsQ7/+qZYLeAAAAAhBnkJ4h38BFQAAAAgBnmF0Qz8BxwAAAAgBnmNqQz8BxwAAABFBmmdJqEFomUwIZ//+nhBIwQAAAApBnoVFESw3/wGFAAAACAGepmpDPwHHAAADtG1vb3YAAABsbXZoZAAAAAAAAAAAAAAAAAAAA+gAAAIIAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAALedHJhawAAAFx0a2hkAAAAAwAAAAAAAAAAAAAAAQAAAAAAAAIIAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAACkAAAAIgAAAAAAJGVkdHMAAAAcZWxzdAAAAAAAAAABAAACCAAABgAAAQAAAAACVm1kaWEAAAAgbWRoZAAAAAAAAAAAAAAAAAAAMgAAABoAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAgFtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAHBc3RibAAAAKlzdHNkAAAAAAAAAAEAAACZYXZjMQAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAACkACIASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAADNhdmNDAWQACv/hABpnZAAKrNlC354jARAAAAMAEAAAAwMg8SJZYAEABmjr48siwAAAABBwYXNwAAAAAQAAAAEAAABIc3R0cwAAAAAAAAAHAAAAAQAABAAAAAABAAACAAAAAAEAAAQAAAAAAgAAAgAAAAABAAAGAAAAAAEAAAQAAAAAAQAAAgAAAAAUc3RzcwAAAAAAAAABAAAAAQAAAFBjdHRzAAAAAAAAAAgAAAABAAAGAAAAAAEAABAAAAAAAQAABgAAAAABAAAAAAAAAAEAAAIAAAAAAQAAEAAAAAABAAAEAAAAAAEAAAIAAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAAIAAAAAQAAADRzdHN6AAAAAAAAAAAAAAAIAAAC4AAAAA8AAAAMAAAADAAAAAwAAAAVAAAADgAAAAwAAAAUc3RjbwAAAAAAAAABAAAAMAAAAGJ1ZHRhAAAAWm1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAALWlsc3QAAAAlqXRvbwAAAB1kYXRhAAAAAQAAAABMYXZmNTguMTkuMTAw';
        getVideoFrame(videoBase64, {
            type: 'image/jpeg',
            quality: 0.5
        })
            .then((data) => {
                try {
                    expect(data.match('image/jpeg')).toBeTruthy();
                } catch (e) {
                    done(e);
                }
                done();
            })
            .catch(e => done(e));
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
