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
const ol = require('openlayers');
const DrawSupport = require('../DrawSupport');
const {DEFAULT_ANNOTATIONS_STYLES} = require('../../../../utils/AnnotationsUtils');

let CIRCLE = {
    type: 'FeatureCollection',
    id: '36835090-23ad-11e8-9839-9bab136db9a3',
    features: [{
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
            [
              [
                -7.066692092065635,
                47.17477833929903
              ],
              [
                -7.070957956986268,
                47.26697075050753
              ],
              [
                -7.083738716328214,
                47.35863997502234
              ],
              [
                -7.104983930273322,
                47.44942710493982
              ],
              [
                -7.134609753668168,
                47.53897854842588
              ],
              [
                -7.172499266922562,
                47.6269473500946
              ],
              [
                -7.218502937437762,
                47.71299445745591
              ],
              [
                -7.272439209743323,
                47.796789930095706
              ],
              [
                -7.334095222013593,
                47.87801408888858
              ],
              [
                -7.403227646136091,
                47.95635860315586
              ],
              [
                -7.479563648016411,
                48.03152751426181
              ],
              [
                -7.562801964329729,
                48.10323819468144
              ],
              [
                -7.6526140914695295,
                48.17122224206827
              ],
              [
                -7.748645582001249,
                48.235226308292674
              ],
              [
                -7.850517443504369,
                48.29501286380931
              ],
              [
                -7.95782763428237,
                48.35036089804014
              ],
              [
                -8.07015265003761,
                48.40106655672712
              ],
              [
                -8.18704919524932,
                48.44694371741463
              ],
              [
                -8.308055932658505,
                48.48782450436609
              ],
              [
                -8.432695303955327,
                48.52355974430404
              ],
              [
                -8.560475414483594,
                48.55401936438973
              ],
              [
                -8.690891974524225,
                48.57909273383168
              ],
              [
                -8.823430289496404,
                48.59868895043517
              ],
              [
                -8.95756729122193,
                48.612737073283476
              ],
              [
                -9.092773602236358,
                48.62118630258009
              ],
              [
                -9.228515625000002,
                48.62400610748772
              ],
              [
                -9.364257647763646,
                48.62118630258009
              ],
              [
                -9.499463958778072,
                48.612737073283476
              ],
              [
                -9.633600960503598,
                48.59868895043517
              ],
              [
                -9.766139275475776,
                48.57909273383168
              ],
              [
                -9.89655583551641,
                48.55401936438973
              ],
              [
                -10.024335946044676,
                48.52355974430404
              ],
              [
                -10.148975317341497,
                48.48782450436609
              ],
              [
                -10.269982054750683,
                48.44694371741463
              ],
              [
                -10.386878599962396,
                48.40106655672712
              ],
              [
                -10.499203615717633,
                48.35036089804014
              ],
              [
                -10.606513806495634,
                48.29501286380931
              ],
              [
                -10.708385667998753,
                48.235226308292674
              ],
              [
                -10.804417158530473,
                48.17122224206827
              ],
              [
                -10.894229285670272,
                48.10323819468144
              ],
              [
                -10.977467601983593,
                48.03152751426181
              ],
              [
                -11.053803603863912,
                47.95635860315586
              ],
              [
                -11.12293602798641,
                47.87801408888858
              ],
              [
                -11.184592040256682,
                47.796789930095706
              ],
              [
                -11.238528312562241,
                47.71299445745591
              ],
              [
                -11.284531983077443,
                47.6269473500946
              ],
              [
                -11.322421496331836,
                47.53897854842588
              ],
              [
                -11.352047319726681,
                47.44942710493982
              ],
              [
                -11.373292533671789,
                47.35863997502234
              ],
              [
                -11.386073293013734,
                47.26697075050753
              ],
              [
                -11.390339157934367,
                47.17477833929903
              ],
              [
                -11.386073293013734,
                47.08242559504841
              ],
              [
                -11.373292533671789,
                46.990277901535556
              ],
              [
                -11.35204731972668,
                46.8987017170481
              ],
              [
                -11.322421496331836,
                46.808063084694076
              ],
              [
                -11.284531983077443,
                46.718726115193576
              ],
              [
                -11.238528312562241,
                46.63105144927073
              ],
              [
                -11.184592040256682,
                46.545394707297326
              ],
              [
                -11.12293602798641,
                46.46210493431348
              ],
              [
                -11.053803603863912,
                46.381523048960865
              ],
              [
                -10.977467601983593,
                46.303980305201314
              ],
              [
                -10.894229285670272,
                46.22979677595146
              ],
              [
                -10.804417158530473,
                46.15927986793656
              ],
              [
                -10.708385667998753,
                46.09272287714786
              ],
              [
                -10.60651380649563,
                46.03040359427646
              ],
              [
                -10.499203615717633,
                45.972582969388
              ],
              [
                -10.386878599962396,
                45.919503844897314
              ],
              [
                -10.269982054750683,
                45.871389765601215
              ],
              [
                -10.148975317341497,
                45.828443874131516
              ],
              [
                -10.024335946044676,
                45.79084789970411
              ],
              [
                -9.89655583551641,
                45.75876124746622
              ],
              [
                -9.766139275475776,
                45.73232019509079
              ],
              [
                -9.633600960503598,
                45.711637202538626
              ],
              [
                -9.499463958778076,
                45.696800340115416
              ],
              [
                -9.364257647763646,
                45.6878728390993
              ],
              [
                -9.228515625000002,
                45.684892768315834
              ],
              [
                -9.092773602236358,
                45.6878728390993
              ],
              [
                -8.95756729122193,
                45.696800340115416
              ],
              [
                -8.823430289496406,
                45.711637202538626
              ],
              [
                -8.690891974524225,
                45.73232019509079
              ],
              [
                -8.560475414483594,
                45.75876124746622
              ],
              [
                -8.43269530395533,
                45.79084789970411
              ],
              [
                -8.308055932658508,
                45.828443874131516
              ],
              [
                -8.187049195249319,
                45.871389765601215
              ],
              [
                -8.07015265003761,
                45.919503844897314
              ],
              [
                -7.95782763428237,
                45.972582969388
              ],
              [
                -7.850517443504371,
                46.03040359427646
              ],
              [
                -7.7486455820012505,
                46.09272287714786
              ],
              [
                -7.652614091469531,
                46.15927986793656
              ],
              [
                -7.562801964329729,
                46.22979677595146
              ],
              [
                -7.479563648016411,
                46.3039803052013
              ],
              [
                -7.403227646136092,
                46.381523048960865
              ],
              [
                -7.334095222013593,
                46.46210493431348
              ],
              [
                -7.272439209743323,
                46.545394707297326
              ],
              [
                -7.218502937437762,
                46.63105144927073
              ],
              [
                -7.172499266922562,
                46.718726115193576
              ],
              [
                -7.134609753668168,
                46.808063084694076
              ],
              [
                -7.104983930273322,
                46.8987017170481
              ],
              [
                -7.083738716328214,
                46.990277901535556
              ],
              [
                -7.070957956986268,
                47.08242559504841
              ],
              [
                -7.066692092065635,
                47.17477833929903
              ]
            ]
          ]
        }
    }],
    newFeature: true,
    properties: {
        id: '36835090-23ad-11e8-9839-9bab136db9a3',
        circles: [0],
        isCircle: true
    },
    style: {
        type: 'Circle',
        Circle: {
            color: '#ffcc33',
            opacity: 1,
            weight: 3,
            fillColor: '#ffffff',
            fillOpacity: 0.2,
            radius: 10
        }
    }
};

describe('Test DrawSupport', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="map"></div><div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates a default style when none is specified', () => {
        // create layers
        const support = ReactDOM.render(
            <DrawSupport/>, document.getElementById("container"));

        expect(support).toExist();
        expect(support.toOlStyle()).toExist();
    });

    it('creates a drawing layer', () => {
        const fakeMap = {
            addLayer: () => {},
            getView: () => ({getProjection: () => ({getCode: () => "EPSG:3857"})})
        };
        const spy = expect.spyOn(fakeMap, "addLayer");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="create" drawMethod="Point"/>, document.getElementById("container"));
        expect(spy.calls.length).toBe(1);
    });

    it('starts drawing', () => {
        const fakeMap = {
            addLayer: () => {},
            getView: () => ({getProjection: () => ({getCode: () => "EPSG:3857"})}),
            disableEventListener: () => {},
            addInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            })
        };
        const spyAdd = expect.spyOn(fakeMap, "addLayer");
        const spyInteraction = expect.spyOn(fakeMap, "addInteraction");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Point"/>, document.getElementById("container"));
        expect(spyAdd.calls.length).toBe(1);
        expect(spyInteraction.calls.length).toBe(1);
    });

    it('starts drawing bbox', () => {
        const fakeMap = {
            addLayer: () => {},
            getView: () => ({getProjection: () => ({getCode: () => "EPSG:3857"})}),
            disableEventListener: () => {},
            addInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            })
        };
        const spyAdd = expect.spyOn(fakeMap, "addLayer");
        const spyInteraction = expect.spyOn(fakeMap, "addInteraction");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="BBOX"/>, document.getElementById("container"));
        expect(spyAdd.calls.length).toBe(1);
        expect(spyInteraction.calls.length).toBe(1);
    });

    it('starts drawing circle', () => {
        const fakeMap = {
            addLayer: () => {},
            getView: () => ({getProjection: () => ({getCode: () => "EPSG:3857"})}),
            disableEventListener: () => {},
            addInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            })
        };
        const spyAdd = expect.spyOn(fakeMap, "addLayer");
        const spyInteraction = expect.spyOn(fakeMap, "addInteraction");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Circle"/>, document.getElementById("container"));
        expect(spyAdd.calls.length).toBe(1);
        expect(spyInteraction.calls.length).toBe(1);
    });

    it('starts drawing with editing', () => {
        const fakeMap = {
            addLayer: () => {},
            getView: () => ({getProjection: () => ({getCode: () => "EPSG:3857"})}),
            disableEventListener: () => {},
            addInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            })
        };
        const spyAdd = expect.spyOn(fakeMap, "addLayer");
        const spyInteraction = expect.spyOn(fakeMap, "addInteraction");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Point" options={{editEnabled: true}}/>, document.getElementById("container"));
        expect(spyAdd.calls.length).toBe(1);
        expect(spyInteraction.calls.length).toBe(4);
    });

    it('select interaction', () => {
        const fakeMap = {
            addLayer: () => {},
            getView: () => ({getProjection: () => ({getCode: () => "EPSG:3857"})}),
            disableEventListener: () => {},
            addInteraction: () => {},
            on: () => {},
            getInteractions: () => ({
                getLength: () => 0
            })
        };

        const testHandlers = {
            onStatusChange: () => {}
        };
        const ft = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [1, 2]
            }
        };
        const spyChangeStatus = expect.spyOn(testHandlers, "onStatusChange");
        const support = ReactDOM.render(
            <DrawSupport features={[ft]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[ft]} map={fakeMap} drawStatus="drawOrEdit" drawMethod="Point"
                options={{editEnabled: true, selectEnabled: true}}
                onSelectFeatures={testHandlers.onStatusChange}/>, document.getElementById("container"));
        const feature = new ol.Feature({
              geometry: new ol.geom.Point(13.0, 43.0),
              name: 'My Point'
        });
        support.selectInteraction.dispatchEvent({
            type: 'select',
            feature: feature
        });
        expect(spyChangeStatus.calls.length).toBe(1);
    });

    it('translate interaction', () => {
        const fakeMap = {
            addLayer: () => {},
            getView: () => ({getProjection: () => ({getCode: () => "EPSG:3857"})}),
            disableEventListener: () => {},
            addInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            })
        };

        const testHandlers = {
            onStatusChange: () => {}
        };

        const spyChangeStatus = expect.spyOn(testHandlers, "onStatusChange");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Point" options={{editEnabled: true}}
                 onChangeDrawingStatus={testHandlers.onStatusChange}/>, document.getElementById("container"));
        const feature = new ol.Feature({
              geometry: new ol.geom.Point(13.0, 43.0),
              name: 'My Point'
        });
        support.translateInteraction.dispatchEvent({
            type: 'translateend',
            features: {
                getArray: () => ([feature])
            }
        });
        expect(spyChangeStatus.calls.length).toBe(1);
    });
    it('translate disabled when not editing', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };

        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                  [13, 43],
                  [15, 43],
                  [15, 44],
                  [13, 44]
                ]]
            },
            properties: {
                'name': "some name"
            }
        };


        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="drawOrEdit" drawMethod="Some" options={{
                    drawEnabled: false, editEnabled: false}}
                />, document.getElementById("container"));
        expect(support.translateInteraction).toNotExist();
    });
    it('translate disabled when Polygon', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            on: () => {},
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };

        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                  [13, 43],
                  [15, 43],
                  [15, 44],
                  [13, 44]
                ]]
            },
            properties: {
                'name': "some name"
            }
        };


        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="drawOrEdit" drawMethod="Polygon" options={{
                    drawEnabled: false, editEnabled: true}}
                />, document.getElementById("container"));
        expect(support.translateInteraction).toExist();
    });

    it('end drawing', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            addInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const testHandlers = {
            onEndDrawing: () => {},
            onStatusChange: () => {}
        };
        const feature = new ol.Feature({
              geometry: new ol.geom.Point(13.0, 43.0),
              name: 'My Point'
        });
        const spyEnd = expect.spyOn(testHandlers, "onEndDrawing");
        const spyChangeStatus = expect.spyOn(testHandlers, "onStatusChange");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Point" options={{stopAfterDrawing: true}}
                onEndDrawing={testHandlers.onEndDrawing} onChangeDrawingStatus={testHandlers.onStatusChange}/>, document.getElementById("container"));
        support.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: feature
        });
        expect(spyEnd.calls.length).toBe(1);
        expect(spyChangeStatus.calls.length).toBe(1);
    });

    it('end drawing with continue', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            addInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const testHandlers = {
            onEndDrawing: () => {},
            onStatusChange: () => {}
        };
        const feature = new ol.Feature({
              geometry: new ol.geom.Point(13.0, 43.0),
              name: 'My Point'
        });
        const spyEnd = expect.spyOn(testHandlers, "onEndDrawing");
        const spyChangeStatus = expect.spyOn(testHandlers, "onStatusChange");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Point" options={{stopAfterDrawing: false}}
                onEndDrawing={testHandlers.onEndDrawing} onChangeDrawingStatus={testHandlers.onStatusChange}/>, document.getElementById("container"));
        support.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: feature
        });
        expect(spyEnd.calls.length).toBe(1);
        expect(spyChangeStatus.calls.length).toBe(0);
    });

    it('stop drawing', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const spyRemove = expect.spyOn(fakeMap, "removeInteraction");
        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Point" options={{stopAfterDrawing: false}}
                />, document.getElementById("container"));
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="stop" drawMethod="Point" options={{stopAfterDrawing: true}}
                />, document.getElementById("container"));
        expect(spyRemove.calls.length).toBe(1);
    });

    it('replace features', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                  [13, 43],
                  [15, 43],
                  [15, 44],
                  [13, 44]
                ]]
            },
            featureProjection: "EPSG:4326",
            properties: {
                'name': "some name"
            },
            style: {type: "Polygon", "Polygon": DEFAULT_ANNOTATIONS_STYLES.Polygon}
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="create" drawMethod="Polygon" options={{stopAfterDrawing: false}}
                />, document.getElementById("container"));
        const spyAddFeature = expect.spyOn(support.drawSource, "addFeature");
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="replace" drawMethod="Polygon" options={{stopAfterDrawing: true}}
                />, document.getElementById("container"));
        expect(spyAddFeature.calls.length).toBe(1);
    });

    it('replace features multipolygon', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                  [13, 43],
                  [15, 43],
                  [15, 44],
                  [13, 44]
                ]]
            },
            featureProjection: "EPSG:4326",
            properties: {
                'name': "some name"
            }
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="create" drawMethod="MultiPolygon" options={{stopAfterDrawing: false}}
                />, document.getElementById("container"));
        const spyAddFeature = expect.spyOn(support.drawSource, "addFeature");
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="replace" drawMethod="MultiPolygon" options={{stopAfterDrawing: true}}
                />, document.getElementById("container"));
        expect(spyAddFeature.calls.length).toBe(1);
    });

    it('replace features point', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [13, 43]
            },
            featureProjection: "EPSG:4326",
            properties: {
                'name': "some name"
            }
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="create" drawMethod="Point" options={{stopAfterDrawing: false}}
                />, document.getElementById("container"));
        const spyAddFeature = expect.spyOn(support.drawSource, "addFeature");
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="replace" drawMethod="Point" options={{stopAfterDrawing: true}}
                />, document.getElementById("container"));
        expect(spyAddFeature.calls.length).toBe(1);
    });

    it('replace features linestring', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [[13, 43], [14, 44]]
            },
            featureProjection: "EPSG:4326",
            properties: {
                'name': "some name"
            }
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="create" drawMethod="LineString" options={{stopAfterDrawing: false}}
                />, document.getElementById("container"));
        const spyAddFeature = expect.spyOn(support.drawSource, "addFeature");
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="replace" drawMethod="LineString" options={{stopAfterDrawing: true}}
                />, document.getElementById("container"));
        expect(spyAddFeature.calls.length).toBe(1);
    });

    it('replace features multilinestring', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [[13, 43], [14, 44]]
            },
            featureProjection: "EPSG:4326",
            properties: {
                'name': "some name"
            }
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="create" drawMethod="MultiLineString" options={{stopAfterDrawing: false}}
                />, document.getElementById("container"));
        const spyAddFeature = expect.spyOn(support.drawSource, "addFeature");
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="replace" drawMethod="MultiLineString" options={{stopAfterDrawing: true}}
                />, document.getElementById("container"));
        expect(spyAddFeature.calls.length).toBe(1);
    });

    it('replace features no draw interaction', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [[13, 43], [14, 44]]
            },
            properties: {
                'name': "some name"
            }
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        const spyAddInteraction = expect.spyOn(support, "addInteractions");
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="replace" drawMethod="MultiLineString" options={{drawEnabled: false}}
                />, document.getElementById("container"));
        expect(spyAddInteraction.calls.length).toBe(0);
    });

    it('replace features with draw interaction', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [[13, 43], [14, 44]]
            },
            properties: {
                'name': "some name"
            }
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        const spyAddInteraction = expect.spyOn(support, "addInteractions");
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="replace" drawMethod="MultiLineString" options={{drawEnabled: true}}
                />, document.getElementById("container"));
        expect(spyAddInteraction.calls.length).toBe(1);
    });

    it('replace features circle', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Circle',
                coordinates: [[13, 43], [14, 44]]
            },
            featureProjection: "EPSG:4326",
            properties: {
                'name': "some name"
            }
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="create" drawMethod="Circle" options={{stopAfterDrawing: false}}
                />, document.getElementById("container"));
        const spyAddFeature = expect.spyOn(support.drawSource, "addFeature");
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="replace" drawMethod="Circle" options={{stopAfterDrawing: true}}
                />, document.getElementById("container"));
        expect(spyAddFeature.calls.length).toBe(1);
    });

    it('replace features with style', () => {
        const fakeMap = {
            addLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };
        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                  [13, 43],
                  [15, 43],
                  [15, 44],
                  [13, 44]
                ]]
            },
            featureProjection: "EPSG:4326",
            properties: {
                'name': "some name"
            }
        };

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="create" drawMethod="Polygon" options={{stopAfterDrawing: false}}
                />, document.getElementById("container"));
        const spyStyle = expect.spyOn(support.drawLayer, "setStyle");
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="replace" drawMethod="Polygon" options={{stopAfterDrawing: true}} style={{}}
                />, document.getElementById("container"));
        expect(spyStyle.calls.length).toBe(1);
    });

    it('styling fill color', () => {
        const support = ReactDOM.render(
            <DrawSupport/>, document.getElementById("container"));

        expect(support).toExist();
        const style = support.toOlStyle({
                fillColor: '#ff0'
            });
        expect(style).toExist();
        expect(style.getFill().getColor()).toExist();
        expect(style.getFill().getColor()[0]).toBe(255);
        expect(style.getFill().getColor()[1]).toBe(255);
        expect(style.getFill().getColor()[2]).toBe(0);
        expect(style.getFill().getColor()[3]).toBe(1);
    });

    it('styling fill transparency', () => {
        const support = ReactDOM.render(
            <DrawSupport/>, document.getElementById("container"));

        expect(support).toExist();
        const style = support.toOlStyle({
                fillColor: '#ff0',
                fillTransparency: 0.5
            });
        expect(style).toExist();
        expect(style.getFill().getColor()).toExist();
        expect(style.getFill().getColor()[0]).toBe(255);
        expect(style.getFill().getColor()[1]).toBe(255);
        expect(style.getFill().getColor()[2]).toBe(0);
        expect(style.getFill().getColor()[3]).toBe(0.5);
    });

    it('styling stroke color', () => {
        const support = ReactDOM.render(
            <DrawSupport/>, document.getElementById("container"));

        expect(support).toExist();
        const style = support.toOlStyle({
                strokeColor: '#ff0'
            });
        expect(style).toExist();
        expect(style.getStroke().getColor().length).toBe(4);
        expect(style.getStroke().getColor()[0]).toBe(255);
        expect(style.getStroke().getColor()[1]).toBe(255);
        expect(style.getStroke().getColor()[2]).toBe(0);
        expect(style.getStroke().getColor()[3]).toBe(1);
    });

    it('styling icon url', () => {
        const support = ReactDOM.render(
            <DrawSupport/>, document.getElementById("container"));

        expect(support).toExist();
        const style = support.toOlStyle({
                iconUrl: '#myUrl',
                shadowUrl: 'otherurl'
            });
        expect(style).toExist();
        expect(style.length).toBe(2);
    });

    it('styling icon glyph', () => {
        const support = ReactDOM.render(
            <DrawSupport/>, document.getElementById("container"));

        expect(support).toExist();
        const style = support.toOlStyle({
                iconGlyph: 'comment'
            });
        expect(style).toExist();
        expect(style.length).toBe(2);
    });

    it('clean', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            on: () => {},
            un: () => {},
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };


        const spyRemoveLayer = expect.spyOn(fakeMap, "removeLayer");
        const spyRemoveInteraction = expect.spyOn(fakeMap, "removeInteraction");

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Polygon" options={{editEnabled: true}}
                />, document.getElementById("container"));
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="clean" drawMethod="Polygon" options={{stopAfterDrawing: true}} style={{}}
                />, document.getElementById("container"));
        expect(spyRemoveLayer.calls.length).toBe(1);
        expect(spyRemoveInteraction.calls.length).toBe(4);
    });

    it('clean and continue', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };


        const spyRemoveLayer = expect.spyOn(fakeMap, "removeLayer");
        const spyRemoveInteraction = expect.spyOn(fakeMap, "removeInteraction");

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="start" drawMethod="Polygon" options={{editEnabled: true}}
                />, document.getElementById("container"));
        ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap} drawStatus="cleanAndContinueDrawing" drawMethod="Polygon" options={{stopAfterDrawing: true}} style={{}}
                />, document.getElementById("container"));
        expect(spyRemoveLayer.calls.length).toBe(1);
        expect(spyRemoveInteraction.calls.length).toBe(0);
    });

    it('draw or edit, only draw', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            on: () => {},
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };

        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                  [13, 43],
                  [15, 43],
                  [15, 44],
                  [13, 44]
                ]]
            },
            properties: {
                'name': "some name"
            }
        };

        const spyAddLayer = expect.spyOn(fakeMap, "addLayer");
        const spyAddInteraction = expect.spyOn(fakeMap, "addInteraction");

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="drawOrEdit" drawMethod="Polygon" options={{
                    drawEnabled: true}}
                />, document.getElementById("container"));
        expect(spyAddLayer.calls.length).toBe(1);
        expect(spyAddInteraction.calls.length).toBe(1);
    });

    it('draw or edit, both', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            on: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };

        const feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                  [13, 43],
                  [15, 43],
                  [15, 44],
                  [13, 44]
                ]]
            },
            properties: {
                'name': "some name"
            }
        };

        const spyAddLayer = expect.spyOn(fakeMap, "addLayer");
        const spyAddInteraction = expect.spyOn(fakeMap, "addInteraction");

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[feature]} map={fakeMap} drawStatus="drawOrEdit" drawMethod="Polygon" options={{
                    drawEnabled: true,
                    editEnabled: true
                }}
                />, document.getElementById("container"));
        expect(spyAddLayer.calls.length).toBe(1);
        expect(spyAddInteraction.calls.length).toBe(3);
    });

    it('draw or edit, endevent', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };

        const testHandlers = {
            onEndDrawing: () => {},
            onStatusChange: () => {},
            onGeometryChanged: () => {}
        };
        const geoJSON = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [13, 43]
            },
            properties: {
                'name': "some name"
            }
        };
        const feature = new ol.Feature({
              geometry: new ol.geom.Point(13.0, 43.0),
              name: 'My Point'
        });
        const spyEnd = expect.spyOn(testHandlers, "onEndDrawing");
        const spyChange = expect.spyOn(testHandlers, "onGeometryChanged");
        const spyChangeStatus = expect.spyOn(testHandlers, "onStatusChange");

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[geoJSON]} map={fakeMap} drawStatus="drawOrEdit" drawMethod="Point" options={{
                    drawEnabled: true}}
                    onEndDrawing={testHandlers.onEndDrawing}
                    onChangeDrawingStatus={testHandlers.onStatusChange}
                    onGeometryChanged={testHandlers.onGeometryChanged}
                />, document.getElementById("container"));
        support.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: feature
        });
        expect(spyEnd.calls.length).toBe(1);
        expect(spyChangeStatus.calls.length).toBe(1);
        expect(spyChange.calls.length).toBe(1);
    });
    it('draw or edit, update spatial field', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };

        const testHandlers = {
            onEndDrawing: () => {},
            onStatusChange: () => {},
            onGeometryChanged: () => {}
        };
        const geoJSON = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [13, 43]
            },
            properties: {
                'name': "some name"
            }
        };
        const feature = new ol.Feature({
              geometry: new ol.geom.Point(13.0, 43.0),
              name: 'My Point'
        });
        const spyEnd = expect.spyOn(testHandlers, "onEndDrawing");
        const spyChange = expect.spyOn(testHandlers, "onGeometryChanged");
        const spyChangeStatus = expect.spyOn(testHandlers, "onStatusChange");

        const support = ReactDOM.render(
            <DrawSupport features={[]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        ReactDOM.render(
            <DrawSupport features={[geoJSON]} map={fakeMap} drawStatus="drawOrEdit" drawMethod="Point" options={{
                    drawEnabled: true,
                    updateSpatialField: true
                }}
                    onEndDrawing={testHandlers.onEndDrawing}
                    onChangeDrawingStatus={testHandlers.onStatusChange}
                    onGeometryChanged={testHandlers.onGeometryChanged}
                />, document.getElementById("container"));
        support.drawInteraction.dispatchEvent({
            type: 'drawend',
            feature: feature
        });
        expect(spyEnd.calls.length).toBe(1);
        expect(spyChangeStatus.calls.length).toBe(1);
        expect(spyChange.calls.length).toBe(1);
    });
    it('drawsupport test for polygonCoordsFromCircle', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:4326'
                })
            })
        };

        const support = ReactDOM.render(
            <DrawSupport features={[CIRCLE]} map={fakeMap}/>, document.getElementById("container"));
        expect(support).toExist();
        const center = [1, 1];
        const radius = 100;
        const coords = support.polygonCoordsFromCircle(center, radius);

        expect(coords[0].length).toBe(101);

    });
    it('test createOLGeometry type Circle geodesic', () => {
        const support = ReactDOM.render(<DrawSupport options={{geodesic: true}}/>, document.getElementById("container"));
        const type = 'Circle';
        const coordinates = [];
        const radius = 50;
        const center = {
            x: 0,
            y: 0
        };
        const projection = 'EPSG:3857';
        const geometry = support.createOLGeometry({type, coordinates, radius, center, projection, options: { geodesic: true }});
        const geometryCoordinates = geometry.getCoordinates();
        expect(geometryCoordinates[0].length).toBe(101);
        const geometryProperties = geometry.getProperties();
        const geodesicCenter = geometryProperties.geodesicCenter;
        expect(geodesicCenter).toEqual([0, 0]);
    });

    it('test createOLGeometry type Circle missing param', () => {
        const support = ReactDOM.render(<DrawSupport options={{geodesic: true}}/>, document.getElementById("container"));
        const type = 'Circle';
        const radius = 50;
        const projection = 'EPSG:3857';
        const center = {
            x: 0,
            y: 0
        };

        const geometryMissingCenter = support.createOLGeometry({type, radius, projection, options: { geodesic: true }});
        let geometryCoordinates = geometryMissingCenter.getCoordinates();
        expect(geometryCoordinates.length).toBe(0);
        let geometryProperties = geometryMissingCenter.getProperties();
        let geodesicCenter = geometryProperties.geodesicCenter;
        expect(geodesicCenter).toBe(undefined);

        const geometryMissingProjection = support.createOLGeometry({type, radius, center, options: { geodesic: true }});
        geometryCoordinates = geometryMissingProjection.getCoordinates();
        expect(geometryCoordinates.length).toBe(0);
        geometryProperties = geometryMissingProjection.getProperties();
        geodesicCenter = geometryProperties.geodesicCenter;
        expect(geodesicCenter).toBe(undefined);

        const geometryMissingRadius = support.createOLGeometry({type, projection, center, options: { geodesic: true }});
        geometryCoordinates = geometryMissingRadius.getCoordinates();
        expect(geometryCoordinates.length).toBe(0);
        geometryProperties = geometryMissingRadius.getProperties();
        geodesicCenter = geometryProperties.geodesicCenter;
        expect(geodesicCenter).toBe(undefined);
    });

    it('test createOLGeometry type Circle wrong center', () => {
        const support = ReactDOM.render(<DrawSupport options={{geodesic: true}}/>, document.getElementById("container"));
        const type = 'Circle';
        const radius = 50;
        const center = {
            x: 'AAAA',
            y: 0
        };
        const projection = 'EPSG:3857';
        const geometry = support.createOLGeometry({type, radius, center, projection, options: { geodesic: true }});
        const geometryCoordinates = geometry.getCoordinates();
        expect(geometryCoordinates.length).toBe(0);
        const geometryProperties = geometry.getProperties();
        const geodesicCenter = geometryProperties.geodesicCenter;
        expect(geodesicCenter).toEqual(undefined);
    });
    it('test fromOLFeature verify radius', () => {

        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:3857'
                })
            })
        };

        const simplifiedCircle = new ol.Feature({
            geometry: new ol.geom.Polygon([[
                [1260844.6064174946, 5858067.29727681],
                [1260960.7874218025, 5857951.114737838],
                [1260844.6064174946, 5857834.9352681665],
                [1260728.4254131867, 5857951.114737838],
                [1260844.6064174946, 5858067.29727681]
            ]])
        });

        const support = ReactDOM.render(<DrawSupport drawMethod="Circle" map={fakeMap} options={{geodesic: true}}/>, document.getElementById("container"));
        const featureData = support.fromOLFeature(simplifiedCircle);

        expect(Math.round(featureData.radius)).toBe(80);
    });

    it('test endDrawing action', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:3857'
                })
            })
        };
        const actions = {
            onEndDrawing: () => {}
        };

        const spyonEndDrawing = expect.spyOn(actions, "onEndDrawing");

        ReactDOM.render(<DrawSupport
            drawMethod="Circle"
            map={fakeMap}
            features={[]}
            onEndDrawing={actions.onEndDrawing}
            options={{geodesic: true}}/>, document.getElementById("container"));

        ReactDOM.render(<DrawSupport
            drawMethod="Circle"
            map={fakeMap}
            features={[{
                center: {x: -11271098, y: 7748880},
                coordinates: [-11271098, 7748880],
                projection: 'EPSG:3857',
                radius: 2000000,
                type: 'Polygon'
            }]}
            drawStatus="endDrawing"
            onEndDrawing={actions.onEndDrawing}
            options={{geodesic: true}}/>, document.getElementById("container"));

        expect(spyonEndDrawing).toHaveBeenCalled();
    });

    it('test endDrawing action without features', () => {
        const fakeMap = {
            addLayer: () => {},
            removeLayer: () => {},
            disableEventListener: () => {},
            enableEventListener: () => {},
            addInteraction: () => {},
            removeInteraction: () => {},
            getInteractions: () => ({
                getLength: () => 0
            }),
            getView: () => ({
                getProjection: () => ({
                    getCode: () => 'EPSG:3857'
                })
            })
        };
        const actions = {
            onEndDrawing: () => {}
        };

        const spyonEndDrawing = expect.spyOn(actions, "onEndDrawing");

        ReactDOM.render(<DrawSupport
            drawMethod="Circle"
            map={fakeMap}
            features={[]}
            onEndDrawing={actions.onEndDrawing}
            options={{geodesic: true}}/>, document.getElementById("container"));

        ReactDOM.render(<DrawSupport
            drawMethod="Circle"
            map={fakeMap}
            features={[]}
            drawStatus="endDrawing"
            onEndDrawing={actions.onEndDrawing}
            options={{geodesic: true}}/>, document.getElementById("container"));

        expect(spyonEndDrawing).toNotHaveBeenCalled();
    });
});
