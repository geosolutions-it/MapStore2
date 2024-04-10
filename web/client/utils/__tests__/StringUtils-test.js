/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { containsHTML, removeDuplicateLines } from '../StringUtils';

describe('StringUtils test', () => {
    it('test contains html', () => {
        const withHtml = "<div> some val </div>";
        const withoutHtml = "some val";

        expect(containsHTML(withHtml)).toBe(true);
        expect(containsHTML(withoutHtml)).toBe(false);
    });
    it('removeDuplicateLines', () => {
        let test = "line1 \nline2 \nlin2 \nline1";
        expect(removeDuplicateLines(test)).toBe('line1 line2 lin2');

        test = "line1 \nline2 \nlin2 \n line1";
        expect(removeDuplicateLines(test)).toBe('line1 line2 lin2');

        test = "some:line1\nline1";
        expect(removeDuplicateLines(test)).toBe('some:line1');

        test = "s.o.m.e:line1. \nline2.\nline2";
        expect(removeDuplicateLines(test)).toBe('s.o.m.e:line1. line2.');

        test = "s-o-m-e:line1. \n\n line1. \n line1";
        expect(removeDuplicateLines(test)).toBe('s-o-m-e:line1.');

        test = "s-o-m-e:line1.line2.line1";
        expect(removeDuplicateLines(test)).toBe(test);

        test = "";
        expect(removeDuplicateLines(test)).toBe(test);
    });

});
