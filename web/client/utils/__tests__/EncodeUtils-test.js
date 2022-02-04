import expect from 'expect';

import { encodeUTF8, decodeUTF8, base64ToUtf8, utf8ToBase64 } from '../EncodeUtils';

describe('EncodeUtils', () => {
    const TESTS =  ["✓", "àèìòù€", "日本語", "اَلْعَرَبِيَّةُ", "汉语/漢語"];
    it('encode-decode UTF-8', () => {
        TESTS.forEach( value => expect(decodeUTF8(encodeUTF8(value))).toEqual(value));
    });
    it('encode-decode base64', () => {
        TESTS.forEach( value => expect(base64ToUtf8(utf8ToBase64(value))).toEqual(value));
    });
});
