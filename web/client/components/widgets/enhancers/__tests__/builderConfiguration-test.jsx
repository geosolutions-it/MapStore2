/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const expect = require('expect');
const builderConfiguration = require('../builderConfiguration');
const WidgetBuilder = builderConfiguration(require('../../builder/WidgetBuilder'));
describe('widgets builderConfiguration enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('test builder describeFeatureType and describeProcess calls', (done) => {
        const actions = {
            onEditorChange: (key, value) => {
                expect(key).toBe("geomProp");
                expect(value).toBe("the_geom");
                done();
            }
        };
        ReactDOM.render(
            (<WidgetBuilder
                layer={{url: 'base/web/client/test-resources/widgetbuilder/wms', search: {url: 'base/web/client/test-resources/widgetbuilder/wfs'}}}
                onEditorChange={actions.onEditorChange} />),
            document.getElementById("container"));
    });
    it('error management', (done) => {
        const actions = {
            onConfigurationError: () => {
                setTimeout(() => {
                    expect(document.querySelector('.empty-state-container')).toExist();
                    done();
                }, 20);

            }
        };
        ReactDOM.render(
            (<WidgetBuilder
                layer={{url: 'base/web/client/test-resources/widgetbuilder/wms', search: {url: 'base/web/client/test-resources/widgetbuilder/no-data'}}}
                onConfigurationError={actions.onConfigurationError} />),
            document.getElementById("container"));
    });
});
