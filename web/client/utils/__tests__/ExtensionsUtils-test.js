/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from "expect";
import {checkZipBundle, ERROR} from "../ExtensionsUtils";
import axios from '../../libs/ajax';

describe('checkZipBundle', () => {
    it('throws an error if uploaded file is not a zip file', (done) => {
        axios.get("base/web/client/test-resources/extensions/this_is_not_a_zip_file.zip", { responseType: "blob" }).then(({data}) => {
            checkZipBundle(data).catch(e => {
                expect(e).toBe(ERROR.WRONG_FORMAT);
                done();
            });
        });
    });
    it('throws an error if uploaded zip does not contain index.json', (done) => {
        axios.get("base/web/client/test-resources/extensions/myplugin_no_index.zip", { responseType: "blob" }).then(({data}) => {
            checkZipBundle(data).catch(e => {
                expect(e).toBe(ERROR.MISSING_INDEX);
                done();
            });
        });
    });
    it('throws an error if uploaded zip contains a malformed index.json', (done) => {
        axios.get("base/web/client/test-resources/extensions/myplugin_wrong_json.zip", { responseType: "blob" }).then(({data}) => {
            checkZipBundle(data).catch(e => {
                expect(e).toBe(ERROR.MALFORMED_INDEX);
                done();
            });
        });
    });
    it('throws an error if uploaded zip does not contain a js bundle', (done) => {
        axios.get("base/web/client/test-resources/extensions/myplugin_no_js.zip", { responseType: "blob" }).then(({data}) => {
            checkZipBundle(data).catch(e => {
                expect(e).toBe(ERROR.MISSING_BUNDLE);
                done();
            });
        });
    });
    it('throws an error if uploaded zip index.json does not contain a plugin', (done) => {
        axios.get("base/web/client/test-resources/extensions/myplugin_no_plugin.zip", { responseType: "blob" }).then(({data}) => {
            checkZipBundle(data).catch(e => {
                expect(e).toBe(ERROR.MISSING_PLUGIN);
                done();
            });
        });
    });
    it('throws an error if uploaded zip contains more than one js file', (done) => {
        axios.get("base/web/client/test-resources/extensions/myplugin_too_many_bundles.zip", { responseType: "blob" }).then(({data}) => {
            checkZipBundle(data).catch(e => {
                expect(e).toBe(ERROR.TOO_MANY_BUNDLES);
                done();
            });
        });
    });
    it('throws an error if uploaded zip an already installed plugin', (done) => {
        axios.get("base/web/client/test-resources/extensions/myplugin.zip", { responseType: "blob" }).then(({data}) => {
            checkZipBundle(data, ["My"]).catch(e => {
                expect(e).toBe(ERROR.ALREADY_INSTALLED);
                done();
            });
        });
    });
    it('return the file to upload if everything is ok', (done) => {
        axios.get("base/web/client/test-resources/extensions/myplugin.zip", { responseType: "blob" }).then(({data}) => {
            checkZipBundle(data).then(extension => {
                expect(extension).toExist();
                expect(extension.name).toBe("My");
                done();
            });
        });
    });
});
