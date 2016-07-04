/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var SecurityUtils = require('../SecurityUtils');

const adminA = {
    User: {
        enabled: true,
        groups: "",
        id: 6,
        name: "admin",
        rol: "ADMIN"
    }
};

const adminB = Object.assign({}, adminA, {
    attribute: {
        name: "UUID",
        value: "263c6917-543f-43e3-8e1a-6a0d29952f72"
    }
});

const adminC = Object.assign({}, adminA, {
    attribute: [{
        name: "UUID",
        value: "263c6917-543f-43e3-8e1a-6a0d29952f72"
    }, {
        name: "description",
        value: "admin user"
    }
]});

describe('Test security utils methods', () => {
    it('test getting user attributes', () => {
        // test a null user
        let attributes = SecurityUtils.getUserAttributes(null);
        expect(attributes).toBeAn("array");
        expect(attributes.length).toBe(0);
        // test user with no attributes
        attributes = SecurityUtils.getUserAttributes(adminA);
        expect(attributes).toBeAn("array");
        expect(attributes.length).toBe(0);
        // test user with a single attribute
        attributes = SecurityUtils.getUserAttributes(adminB);
        expect(attributes).toBeAn("array");
        expect(attributes.length).toBe(1);
        expect(attributes).toInclude({
            name: "UUID",
            value: "263c6917-543f-43e3-8e1a-6a0d29952f72"
        });
        // test user with multiple attributes
        attributes = SecurityUtils.getUserAttributes(adminC);
        expect(attributes).toBeAn("array");
        expect(attributes.length).toBe(2);
        expect(attributes).toInclude({
            name: "UUID",
            value: "263c6917-543f-43e3-8e1a-6a0d29952f72"
        });
        expect(attributes).toInclude({
            name: "description",
            value: "admin user"
        });
    });
});
