import expect from 'expect';
import { setCookie, getCookieValue, eraseCookie } from '../CookieUtils';

describe("CookieUtils", () => {
    const TEST_COOKIE_1 = "TEST_COOKIE_1";
    const TEST_COOKIE_2 = "TEST_COOKIE_2";
    const TEST_COOKIE_1_VALUE = "COOKIE_1_VALUE";
    const TEST_COOKIE_2_VALUE = "COOKIE_2_VALUE";
    it("set and test cookies", () => {
        setCookie(TEST_COOKIE_1, TEST_COOKIE_1_VALUE);
        expect(getCookieValue(TEST_COOKIE_1)).toEqual(TEST_COOKIE_1_VALUE);
        setCookie(TEST_COOKIE_2, TEST_COOKIE_2_VALUE);
        expect(getCookieValue(TEST_COOKIE_1)).toEqual(TEST_COOKIE_1_VALUE);
        expect(getCookieValue(TEST_COOKIE_2)).toEqual(TEST_COOKIE_2_VALUE);
        eraseCookie(TEST_COOKIE_2);
        expect(getCookieValue(TEST_COOKIE_1)).toEqual(TEST_COOKIE_1_VALUE);
        expect(getCookieValue(TEST_COOKIE_2)).toBeFalsy();
        eraseCookie(TEST_COOKIE_1);
        expect(getCookieValue(TEST_COOKIE_1)).toBeFalsy();
    });

});

