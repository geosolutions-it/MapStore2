/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { values } from 'lodash';
import {
    objectToAttributes,
    escapeValue,
    escapeText,
    escapeAttributeValue,
    removeEmptyNodes,
    writeXML
} from '../XMLUtils';

const namespaces = {
    root: {
        ns: 'http://sample.com/xmlns'
    },
    test: {
        ns: 'httpL//test.com/xmlns',
        prefix: 'test'
    }
};

describe('XMLUtils tests', () => {
    it('escapeValue', () => {
        expect(escapeValue(false, false, false, false, '\'Escaping\' tes\"&&t with>all <<> kinds of &\" symbols;')).toBe(
            '&apos;Escaping&apos; tes&quot;&amp;&amp;t with&gt;all &lt;&lt;&gt; kinds of &amp;&quot; symbols;'
        );
    });
    it('escapeText', () => {
        expect(escapeText('Don\'t escape \" and \' and >, but escape &,<')).toBe('Don\'t escape \" and \' and >, but escape &amp;,&lt;');
    });
    it('escapeAttributeValue', () => {
        expect(escapeAttributeValue('Don\'t escape >, but escape \',\",<,&')).toBe('Don&apos;t escape >, but escape &apos;,&quot;,&lt;,&amp;');
    });
    it('objectToAttributes', () => {
        const attributes = objectToAttributes({
            attr1: 'value',
            attr2: 1,
            attr3: undefined
        });

        expect(attributes.length).toBe(2);
        expect(attributes[0].name).toBe('attr1');
        expect(attributes[0].value).toBe('value');
        expect(attributes[0].xmlns).toNotExist();
        expect(attributes[1].name).toBe('attr2');
        expect(attributes[1].value).toBe(1);
        expect(attributes[1].xmlns).toNotExist();
    });
    it('objectToAttributes with xmlns', () => {
        const attributes = objectToAttributes({
            attr1: 'value',
            attr2: 1,
            attr3: undefined
        }, namespaces.test);

        expect(attributes.length).toBe(2);
        expect(attributes[0].name).toBe('attr1');
        expect(attributes[0].value).toBe('value');
        expect(attributes[0].xmlns).toEqual(namespaces.test);
        expect(attributes[1].name).toBe('attr2');
        expect(attributes[1].value).toBe(1);
        expect(attributes[1].xmlns).toEqual(namespaces.test);
    });
    it('writeXML with removeEmptyNodes', () => {
        const tree = {
            name: 'Root',
            xmlns: namespaces.root,
            children: [{
                name: 'SomeElement',
                attributes: objectToAttributes({
                    attr1: '<value>&',
                    attr2: 0,
                    attr3: undefined
                }),
                children: [false && {
                    name: 'NotPresentElement',
                    textContent: 'i should not be present'
                }, {
                    name: 'SomeElementInner',
                    attributes: objectToAttributes({
                        attr1: 'value'
                    }, namespaces.test),
                    textContent: 'textContent<textContent>'
                }]
            }, {
                name: 'AnotherElement',
                xmlns: namespaces.test,
                attributes: objectToAttributes({
                    attr: 'value'
                }),
                textContent: 'text'
            }, {
                name: 'SimpleElement'
            }]
        };
        const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="${namespaces.root.ns}">
  <SomeElement attr1="&lt;value>&amp;" attr2="0">
    <SomeElementInner xmlns:${namespaces.test.prefix}="${namespaces.test.ns}" ${namespaces.test.prefix}:attr1="value">textContent&lt;textContent></SomeElementInner>
  </SomeElement>
  <${namespaces.test.prefix}:AnotherElement xmlns:${namespaces.test.prefix}="${namespaces.test.ns}" attr="value">text</${namespaces.test.prefix}:AnotherElement>
  <SimpleElement/>
</Root>`;
        expect(writeXML(removeEmptyNodes(tree))).toBe(xml);
    });
    it('writeXML with removeEmptyNodes and xmlnsList', () => {
        const tree = {
            name: 'Root',
            xmlns: namespaces.root,
            children: [{
                name: 'SomeElement',
                attributes: objectToAttributes({
                    attr1: '<value>&',
                    attr2: 0,
                    attr3: undefined
                }),
                children: [false && {
                    name: 'NotPresentElement',
                    textContent: 'i should not be present'
                }, {
                    name: 'SomeElementInner',
                    attributes: objectToAttributes({
                        attr1: 'value'
                    }, namespaces.test),
                    textContent: 'textContent<textContent>'
                }]
            }, {
                name: 'AnotherElement',
                xmlns: namespaces.test,
                attributes: objectToAttributes({
                    attr: 'value'
                }),
                textContent: 'text'
            }, {
                name: 'SimpleElement'
            }]
        };
        const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<Root xmlns="${namespaces.root.ns}" xmlns:${namespaces.test.prefix}="${namespaces.test.ns}">
  <SomeElement attr1="&lt;value>&amp;" attr2="0">
    <SomeElementInner ${namespaces.test.prefix}:attr1="value">textContent&lt;textContent></SomeElementInner>
  </SomeElement>
  <${namespaces.test.prefix}:AnotherElement attr="value">text</${namespaces.test.prefix}:AnotherElement>
  <SimpleElement/>
</Root>`;
        expect(writeXML(removeEmptyNodes(tree), values(namespaces))).toBe(xml);
    });
});
