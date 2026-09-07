/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import {
    generateTemplateString,
    getCleanTemplate,
    parseCustomTemplate,
    validateStringAttribute
} from '../TemplateUtils';


describe('TemplateUtils', () => {
    beforeEach( () => {

    });
    afterEach((done) => {
        document.body.innerHTML = '';

        setTimeout(done);
    });
    it('test template generation', () => {
        let templateFunction = generateTemplateString("this is a ${test}");
        expect(templateFunction).toExist();
        let templateResult = templateFunction({test: "TEST"});
        expect(templateResult).toBe("this is a TEST");
    });
    it('test template cache', () => {
        let templateFunction = generateTemplateString("this is a ${test}");
        expect(templateFunction).toExist();
        let templateResult = templateFunction({test: "TEST"});
        expect(templateResult).toBe("this is a TEST");
        let templateFunction2 = generateTemplateString("this is a ${test}");
        expect(templateFunction2).toExist();
        let templateResult2 = templateFunction2({test: "TEST"});
        expect(templateResult2).toBe("this is a TEST");
        expect(templateFunction).toBe(templateFunction2);
        let templateFunction3 = generateTemplateString("this is a second ${test}");
        let templateResult3 = templateFunction3({test: "TEST"});
        expect(templateResult3).toBe("this is a second TEST");

    });
    it('test escape function', () => {
        let templateFunction = generateTemplateString("this is a ${test}", a => a + "2");
        expect(templateFunction).toExist();
        let templateResult = templateFunction({test: "TEST"});
        expect(templateResult).toBe("this is a TEST2");
    });
    it('generateTemplateString with some null or undefined attributes', () => {
        let templateFunction = generateTemplateString("#${desc}, ${desc1}, ${desc2}#");
        expect(templateFunction).toExist();
        let templateResult = templateFunction({desc: "desc value", desc1: null, desc2: undefined});
        expect(templateResult).toEqual("#desc value, , #");
    });

    it('validateStringAttribute', () => {
        const testObj = {
            properties: {
                name: 'object-name'
            }
        };
        expect(validateStringAttribute(testObj, 'properties.name')).toBe(true);
        expect(validateStringAttribute(testObj, ' properties.name ')).toBe(true);
        expect(validateStringAttribute(testObj, '${properties.name}')).toBe(false);
        expect(validateStringAttribute(testObj, '${properties.name}', 2, 1)).toBe(true);
        expect(validateStringAttribute(testObj, '${ properties.name }', 2, 1)).toBe(true);
        expect(validateStringAttribute(testObj, 'properties.desc')).toBe(false);
    });

    describe('getCleanTemplate', () => {
        it('cleaning a normal template', () => {
            const template = '<p>the name is ${ properties.name } and the description ${ properties.desc } and again the name is ${ <strong>properties.name</strong> }</p>';
            const testObj = {
                properties: {
                    name: 'object-name'
                }
            };
            expect(getCleanTemplate(template, testObj, /\$\{.*?\}/g, 2, 1)).toBe('<p>the name is ${ properties.name } and the description  and again the name is ${ properties.name }</p>');
        });
        it('cleaning a template i with a - already escaped', () => {
            const template = '<p>name ${ properties["name-surname"] }</p>';
            const testObj = {
                properties: {
                    "name-surname": 'M-V'
                }
            };
            expect(getCleanTemplate(template, testObj, /\$\{.*?\}/g, 2, 1)).toBe('<p>name ${ properties["name-surname"] }</p>');
        });
    });

    it('parseCustomTemplate with some missing attributes', () => {
        const retVal = parseCustomTemplate("${desc}, ${desc2}", {desc: "desc value"});
        expect(retVal).toEqual("desc value, desc2 Not Available");
    });
    it('parseCustomTemplate with some no default value for missing attributes', () => {
        const retVal = parseCustomTemplate("${desc}, ${desc2}", {desc: "desc value"}, () => "");
        expect(retVal).toEqual("desc value, ");
    });
    it('parseCustomTemplate with invalid attribute and some no default value for missing attributes', () => {
        const retVal = parseCustomTemplate("${<p>desc </p>}, ${desc2}", {desc: "desc value"}, () => "");
        expect(retVal).toEqual("desc value, ");
    });
    it('parseCustomTemplate with invalid attribute and some no default value for missing attributes', () => {
        const retVal = parseCustomTemplate("${<p>desc </p>}, ${desc2}", {desc: "desc value"});
        expect(retVal).toEqual("desc value, desc2 Not Available");
    });

    it('generateTemplateString keeps defined falsy values', () => {
        const feature = { properties: { count: 0, flag: false, empty: '', name: 'Rome' } };
        expect(generateTemplateString('${properties.count}')(feature)).toBe('0');
        expect(generateTemplateString('${properties.flag}')(feature)).toBe('false');
        expect(generateTemplateString('${properties.name}')(feature)).toBe('Rome');
        expect(generateTemplateString('${properties.empty}')(feature)).toBe('');
        expect(generateTemplateString('${properties.missing}')(feature)).toBe('');
        expect(generateTemplateString('${properties.missing.nested}')(feature)).toBe('');
    });
    it('parseCustomTemplate keeps defined falsy values', () => {
        expect(parseCustomTemplate('${count}', { count: 0 }, () => '')).toBe('0');
        expect(parseCustomTemplate('${flag}', { flag: false }, () => '')).toBe('false');
    });
    it('parseCustomTemplate substitutes placeholders by value', () => {
        window.__templateEvaluated = undefined;
        parseCustomTemplate('${(window.__templateEvaluated = true)}', {}, () => '');
        expect(window.__templateEvaluated).toBe(undefined);
    });
    it('parseCustomTemplate resolves only property references', () => {
        const retVal = parseCustomTemplate('${1 + 1}', {}, () => '');
        expect(retVal.indexOf('2')).toBe(-1);
    });
    it('parseCustomTemplate escapes the html of the resolved values', () => {
        const retVal = parseCustomTemplate('${desc}', { desc: '<b>value</b>' }, () => '');
        expect(retVal).toBe('&lt;b&gt;value&lt;/b&gt;');
    });
});
