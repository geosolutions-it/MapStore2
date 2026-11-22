/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import expect from 'expect';
import ReactDOM from 'react-dom';
import axios from 'axios';
import JSZip from 'jszip';
import { compose, setObservableConfig } from 'recompose';
import rxjsConfig from 'recompose/rxjsObservableConfig';

import processFile from '../processFile';
import useFile from '../useFile';

setObservableConfig(rxjsConfig);

// processFile injects onDrop (and the accumulated warnings) as props of the wrapped component
const Component = compose(processFile, useFile)((props) => {
    props.captureOnDrop(props.onDrop);
    return <div />;
});

describe('longitudinalProfile processFile + useFile warnings', () => {
    let notifications;
    let onDrop;
    let shapeWithoutPrj;

    const drop = (file) => {
        const before = notifications.length;
        onDrop([file]);
        // wait for the "no line feature" warning, emitted on every drop of this (points only) shapefile
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const check = () => {
                if (notifications.length > before && notifications.slice(before).some(n => n.message === 'longitudinalProfile.warnings.noLineFeatureFound')) {
                    resolve(notifications.slice(before).filter(n => n.message === 'shapefile.error.missingPrj').length);
                } else if (Date.now() - start > 5000) {
                    reject(new Error('timeout ' + JSON.stringify(notifications.map(n => n.message))));
                } else {
                    setTimeout(check, 20);
                }
            };
            check();
        });
    };

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        notifications = [];
        axios.get("base/web/client/test-resources/TestShape.zip", { responseType: "blob" })
            .then(({ data }) => { shapeWithoutPrj = data; done(); })
            .catch(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    const render = () => ReactDOM.render(<Component
        captureOnDrop={(d) => { onDrop = d; }}
        onWarning={(n) => notifications.push(n)}
        onChangeGeometry={() => {}}
        onClose={() => {}}
    />, document.getElementById("container"));

    it('notifies only the warnings of the file just dropped', function(done) {
        this.timeout(10000);
        render();
        const withPrj = () => JSZip.loadAsync(shapeWithoutPrj)
            .then(zip => zip.file("Unesco_point.prj", 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]').generateAsync({ type: "blob" }))
            .then(blob => new File([blob], "with-prj.zip", { type: "application/zip" }));
        const file = (name) => new File([shapeWithoutPrj], name, { type: "application/zip" });
        drop(file("first.zip"))
            .then(n => {
                expect(n).toBe(1);
                return drop(file("second.zip"));
            })
            .then(n => {
                expect(n).toBe(1);
                return withPrj();
            })
            .then(good => drop(good))
            .then(n => {
                expect(n).toBe(0);
                done();
            })
            .catch(done);
    });
});
