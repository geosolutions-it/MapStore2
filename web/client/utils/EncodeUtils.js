/**
 * Convert an UTF-8 into a byte representation. It usefult to avoid the `btoa` Unicode problem
 * A more detailed explaination about this can be found here: https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem
 *
 * @param {string} string string to convert
 * @returns the UTF8 string converted in bytes
 */
export function encodeUTF8(string) {
    return unescape(encodeURIComponent(string));
}
export function decodeUTF8(string) {
    return decodeURIComponent(escape(string));
}
/**
 * This utility function allows to encode UTF-8 strings in
 * Base64 (btoa is afflicted by the Unicode Problem: https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem)
 * @param {string} str the string to encode
 * @returns the string encoded in base64
 */
export function utf8ToBase64( str ) {
    return window.btoa(encodeUTF8( str));
}
/**
 * This utility function allows to decode UTF-8 strings in
 * Base64 (btoa is afflicted by the Unicode Problem: https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem)
 * @param {string} str the string in base64 to decode
 * @returns the string decoded
 */
export function base64ToUtf8( str ) {
    return decodeUTF8(window.atob( str ));
}
