/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {upload} from "../plugins";
import MockAdapter from "axios-mock-adapter";
import axios from "../../libs/ajax";

let mockAxios;

describe('Plugins API', () => {
    afterEach((done) => {
        if (mockAxios) {
            mockAxios.restore();
        }
        mockAxios = null;
        setTimeout(done);
    });
    it('upload post the binary file with application/octet-stream content type', (done) => {
        axios.get("base/web/client/test-resources/plugin.zip", { responseType: "blob" }).then(({ data }) => {
            mockAxios = new MockAdapter(axios);
            mockAxios.onPost().reply(200, {});
            upload([data], "uploadPlugin");
            setTimeout(() => {
                expect(mockAxios.history.post.length).toBe(1);
                expect(mockAxios.history.post[0].url).toBe("uploadPlugin");
                expect(mockAxios.history.post[0].headers["Content-Type"]).toBe("application/octet-stream");
                done();
            }, 100);
        });
    });
});
