/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import requestBuilder from '../RequestBuilder';
import {fidFilter} from '../../Filter/filter';
import describeStates from '../../../../test-resources/wfs/describe-states.json';
import describePois from '../../../../test-resources/wfs/describe-pois.json';
import wyoming from '../../../../test-resources/wfs/Wyoming.json';
import museam from '../../../../test-resources/wfs/museam.json';
import expectedInsertWyoming from 'raw-loader!../../../../test-resources/wfst/insert/Wyoming_1_1_0.xml';
import expectedInsertmuseam from 'raw-loader!../../../../test-resources/wfst/insert/museam_1_1_0.xml';
import expectedDelete from 'raw-loader!../../../../test-resources/wfst/delete/museam_1_1_0.xml';
import expectedUpdate from 'raw-loader!../../../../test-resources/wfst/update/museam_1_1_0.xml';
import doubleMuseamInsert from 'raw-loader!../../../../test-resources/wfst/insert/double_museam_1_1_0.xml';
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
            update(propertyChange("NAME", "newName"), fidFilter("ogc", "poi.7"))
        );
        expect(result).toExist();
        expect(result).toEqual(expectedUpdate.replace(/[\n\r]/g, ''));
    });

});
