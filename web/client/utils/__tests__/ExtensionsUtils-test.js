/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from "expect";
import JSZip from "jszip";
import {checkZipBundle, checkUploads, getExtensionInfo, ERROR, UPLOAD_ERROR_MESSAGE_IDS} from "../ExtensionsUtils";
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

const zipOf = (index, name = 'extension.zip') => {
    const zip = new JSZip();
    zip.file('index.js', 'window.Extension = {};');
    zip.file('index.json', JSON.stringify(index));
    return zip.generateAsync({ type: 'blob' }).then(blob => new File([blob], name));
};
const INDEX = { plugins: [{ name: 'PrivacySettings', title: 'Privacy settings', version: '1.1.0' }] };

describe('checkUploads', () => {
    it('returns name, title and version of the plugin of each valid file', (done) => {
        Promise.all([zipOf(INDEX, 'a.zip'), zipOf({ plugins: [{ name: 'Sample' }] }, 'b.zip')])
            .then(files => checkUploads(files, [], id => id).then(checked => {
                expect(checked.map(({ name, title, version, file }) => ({ name, title, version, file: file.name }))).toEqual([
                    { name: 'PrivacySettings', title: 'Privacy settings', version: '1.1.0', file: 'a.zip' },
                    { name: 'Sample', title: undefined, version: undefined, file: 'b.zip' }
                ]);
                expect(checked.every(entry => !entry.error)).toBe(true);
            }))
            .then(() => done()).catch(done);
    });
    it('gives the error of an invalid file to every file, with the text of its message', (done) => {
        Promise.all([zipOf(INDEX, 'a.zip'), zipOf(INDEX, 'b.zip')])
            .then(files => checkUploads(files, ['PrivacySettings'], id => `text of ${id}`).then(checked => {
                expect(checked.length).toBe(2);
                expect(checked.map(entry => entry.name)).toEqual(['a.zip', 'b.zip']);
                expect(checked.map(entry => entry.error.message)).toEqual([
                    `text of ${UPLOAD_ERROR_MESSAGE_IDS[ERROR.ALREADY_INSTALLED]}`,
                    `text of ${UPLOAD_ERROR_MESSAGE_IDS[ERROR.ALREADY_INSTALLED]}`
                ]);
            }))
            .then(() => done()).catch(done);
    });
});

describe('getExtensionInfo', () => {
    it('reads title, description and version from the top level of index.json, and the plugins', () => {
        expect(getExtensionInfo({
            title: 'Statistics tools',
            description: 'Charts and tables',
            version: '3.0.0',
            glyph: 'stats',
            plugins: [{ name: 'Statistics', title: 'Charts', description: 'Charts of a layer', version: '2.0.0', glyph: 'th', dependencies: ['Toolbar'] }, { name: 'StatisticsTable', version: '1.0.0' }]
        })).toEqual({
            title: 'Statistics tools',
            description: 'Charts and tables',
            version: '3.0.0',
            glyph: 'stats',
            plugins: [{ name: 'Statistics', title: 'Charts', version: '2.0.0', glyph: 'th' }, { name: 'StatisticsTable', title: undefined, version: '1.0.0', glyph: undefined }]
        });
    });
    it('takes the fields missing at the top level from the first plugin', () => {
        expect(getExtensionInfo({
            version: '3.0.0',
            plugins: [{ name: 'Statistics', title: 'Charts', description: 'Charts of a layer', version: '2.0.0', glyph: 'th' }]
        })).toEqual({
            title: 'Charts',
            description: 'Charts of a layer',
            version: '3.0.0',
            glyph: 'th',
            plugins: [{ name: 'Statistics', title: 'Charts', version: '2.0.0', glyph: 'th' }]
        });
    });
    it('returns empty fields for an index without plugins', () => {
        expect(getExtensionInfo({})).toEqual({ title: undefined, description: undefined, version: undefined, glyph: undefined, plugins: [] });
    });
});

describe('checkUploads with the extension version', () => {
    it('returns the version of the extension, not the one of its first plugin', (done) => {
        zipOf({ version: '3.0.0', plugins: [{ name: 'Statistics', version: '2.0.0' }, { name: 'StatisticsTable', version: '1.0.0' }] }, 'statistics.zip')
            .then(file => checkUploads([file], [], id => id).then(checked => {
                expect(checked.length).toBe(1);
                expect(checked[0].error).toNotExist();
                expect(checked[0].name).toBe('Statistics');
                expect(checked[0].version).toBe('3.0.0');
                expect(checked[0].plugins).toEqual([{ name: 'Statistics', title: undefined, version: '2.0.0', glyph: undefined }, { name: 'StatisticsTable', title: undefined, version: '1.0.0', glyph: undefined }]);
            }))
            .then(() => done()).catch(done);
    });
});
