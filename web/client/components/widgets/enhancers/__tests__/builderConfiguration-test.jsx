/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import builderConfiguration from '../builderConfiguration';
import WB from '../../builder/WidgetBuilder';
import { createSink } from 'recompose';

const WidgetBuilder = builderConfiguration()(WB);
const WPSWidgetBuilder = builderConfiguration({ needsWPS: true })(WB);

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
                layer={{ url: 'base/web/client/test-resources/widgetbuilder/wms', search: { url: 'base/web/client/test-resources/widgetbuilder/wfs' } }}
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
                layer={{ url: 'base/web/client/test-resources/widgetbuilder/wms', search: { url: 'base/web/client/test-resources/widgetbuilder/no-data' } }}
                onConfigurationError={actions.onConfigurationError} />),
            document.getElementById("container"));
    });
    it('with option needsWPS = true, the missing WPS process causes error', (done) => {
        const actions = {
            onConfigurationError: () => {
                setTimeout(() => {
                    expect(document.querySelector('.empty-state-container')).toExist();
                    done();
                }, 20);

            }
        };
        ReactDOM.render(
            (<WPSWidgetBuilder
                layer={{ url: 'base/web/client/test-resources/widgetbuilder/no-data', search: { url: 'base/web/client/test-resources/widgetbuilder/wfs' } }}
                onConfigurationError={actions.onConfigurationError} />),
            document.getElementById("container"));
    });
    it('with option needWPS = false, the contained component receives the hasAggregateProcess = false', (done) => {
        const Builder = builderConfiguration()(createSink(({hasAggregateProcess}) => {
            if (hasAggregateProcess === false) {
                done();
            }
        }));

        ReactDOM.render(
            (<Builder
                layer={{ url: 'base/web/client/test-resources/widgetbuilder/no-data', search: { url: 'base/web/client/test-resources/widgetbuilder/wfs' } }}
            />),
            document.getElementById("container"));
    });
    it('the contained component receives the hasAggregateProcess = false if WPS is not available (and needsWPS = false)', (done) => {
        const Builder = builderConfiguration()(createSink(({ hasAggregateProcess, loading }) => {
            if (hasAggregateProcess === false) {
                expect(loading).toBeFalsy();
                done();
            }
        }));

        ReactDOM.render(
            (<Builder
                layer={{ url: 'base/web/client/test-resources/widgetbuilder/no-data', search: { url: 'base/web/client/test-resources/widgetbuilder/wfs' } }}
            />),
            document.getElementById("container"));
    });
    it('the contained component receives the hasAggregateProcess = false if WPS is not available (and needsWPS = false)', (done) => {
        const Builder = builderConfiguration()(createSink(({ hasAggregateProcess, loading }) => {
            if (hasAggregateProcess === true) {
                expect(loading).toBeFalsy();
                done();
            }
        }));

        ReactDOM.render(
            (<Builder
                layer={{ url: 'base/web/client/test-resources/widgetbuilder/wms', search: { url: 'base/web/client/test-resources/widgetbuilder/wfs' } }}
            />),
            document.getElementById("container"));
    });
});
