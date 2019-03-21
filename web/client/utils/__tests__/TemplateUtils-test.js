/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const {
    generateTemplateString,
    validateStringAttribute,
    getCleanTemplate
} = require('../TemplateUtils');


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

    it('getCleanTemplate', () => {
        const template = '<p>the name is ${ properties.name } and the description ${ properties.desc } and again the name is ${ <strong>properties.name</strong> }</p>';
        const testObj = {
            properties: {
                name: 'object-name'
            }
        };
        expect(getCleanTemplate(template, testObj, /\$\{.*?\}/g, 2, 1)).toBe('<p>the name is ${ properties.name } and the description  and again the name is ${ properties.name }</p>');

    });
});
