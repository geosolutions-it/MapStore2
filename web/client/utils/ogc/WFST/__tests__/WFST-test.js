/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const requestBuilder = require('../RequestBuilder');
const {fidFilter} = require('../../Filter/filter');
const describeStates = require('../../../../test-resources/wfs/describe-states.json');
const describePois = require('../../../../test-resources/wfs/describe-pois.json');
const wyoming = require('../../../../test-resources/wfs/Wyoming.json');
const museam = require('../../../../test-resources/wfs/museam.json');
const expectedInsertWyoming = require('raw-loader!../../../../test-resources/wfst/insert/Wyoming_1_1_0.xml');
const expectedInsertmuseam = require('raw-loader!../../../../test-resources/wfst/insert/museam_1_1_0.xml');
const expectedDelete = require('raw-loader!../../../../test-resources/wfst/delete/museam_1_1_0.xml');
const expectedUpdate = require('raw-loader!../../../../test-resources/wfst/update/museam_1_1_0.xml');
const doubleMuseamInsert = require('raw-loader!../../../../test-resources/wfst/insert/double_museam_1_1_0.xml');
describe('Test WFS-T request bodies generation', () => {
    it('WFS-T insert', () => {
        const {insert} = requestBuilder(describeStates);
        const result = insert(wyoming);
        expect(result).toExist();
    });
    it('WFS-T insert (array)', () => {
        const {insert} = requestBuilder(describeStates);
        const result = insert([wyoming]);
        expect(result).toExist();
    });
    it('WFS-T transaction insert (arg list)', () => {
        const {transaction, insert} = requestBuilder(describePois);
        const result = transaction(insert(museam, museam));
        expect(result).toBe(doubleMuseamInsert.replace(/[\r\n]/g, ''));

    });
    it('WFS-T transaction with insert polygon', () => {
        const {insert, transaction} = requestBuilder(describeStates);
        const result = transaction(insert(wyoming));
        expect(result).toExist();
        expect(result).toEqual(expectedInsertWyoming.replace(/[\n\r]/g, ''));
    });

    it('WFS-T transaction with insert point', () => {
        const {insert, transaction} = requestBuilder(describePois);
        const result = transaction([insert(museam)]);
        expect(result).toExist();
        expect(result).toEqual(expectedInsertmuseam.replace(/[\n\r]/g, ''));
    });

    it('WFS-T transaction with delete', () => {
        const {deleteFeature, transaction} = requestBuilder(describePois);
        const result = transaction(deleteFeature(museam));
        expect(result).toExist();
        expect(result).toEqual(expectedDelete.replace(/[\r\n]/g, ''));
    });

    it('WFS-T transaction with delete (as array)', () => {
        const {deleteFeature, transaction} = requestBuilder(describePois);
        const result = transaction([deleteFeature(museam)]);
        expect(result).toExist();
        expect(result).toEqual(expectedDelete.replace(/[\r\n]/g, ''));
    });

    it('WFS-T transaction with update', () => {
        const {update, propertyChange, transaction} = requestBuilder(describePois);
        const result = transaction(
            update(
                [propertyChange("NAME", "newName"), fidFilter("ogc", "poi.7")])
        );
        expect(result).toExist();
        expect(result).toEqual(expectedUpdate.replace(/[\r\n]/g, ''));
    });
    it('WFS-T transaction with update (arg list)', () => {
        const {update, propertyChange, transaction} = requestBuilder(describePois);
        const result = transaction(
            update(propertyChange("NAME", "newName"), fidFilter("ogc", "poi.7")),
        );
        expect(result).toExist();
        expect(result).toEqual(expectedUpdate.replace(/[\n\r]/g, ''));
    });

});
