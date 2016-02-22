/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {
    CHANGE_SNAPSHOT_STATE,
    SNAPSHOT_ERROR,
    SNAPSHOT_READY,
    changeSnapshotState,
    onSnapshotError,
    onSnapshotReady,
    postCanvas
} = require('../snapshot');

describe('Test correctness of the snapshot actions', () => {

    it('change snapshot state', () => {
        const testVal = "val";
        const retval = changeSnapshotState(testVal);

        expect(retval.type).toBe(CHANGE_SNAPSHOT_STATE);
        expect(retval.state).toExist();
        expect(retval.state).toBe(testVal);
    });
    it('snapshot error', () => {
        const testVal = "error";
        const retval = onSnapshotError(testVal);

        expect(retval.type).toBe(SNAPSHOT_ERROR);
        expect(retval.error).toExist();
        expect(retval.error).toBe(testVal);
    });

    it('snapshot ready', () => {
        const snapshot = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAA";
        const width = 20;
        const height = 20;
        const size = 20;
        const act = onSnapshotReady(snapshot, width, height, size);
        expect(act).toExist();
        expect(act.type).toBe(SNAPSHOT_READY);
        expect(act.imgData).toExist();
        expect(act.imgData).toBe(snapshot);
        expect(act.width).toExist();
        expect(act.width).toBe(width);
        expect(act.height).toExist();
        expect(act.height).toBe(height);
        expect(act.size).toExist();
        expect(act.size).toBe(size);
    });
    it('test upload canvas exeption action', (done) => {
        postCanvas('')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe(SNAPSHOT_ERROR);
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });
    it('test upload canvas exeption action', (done) => {
        postCanvas('', 'base/web/client/test-resources/testConfig.brokenjson')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe(SNAPSHOT_ERROR);
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });
});

