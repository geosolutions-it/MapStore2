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
            addLayer: () => {}
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
        support.selectInteraction.dispatchEvent({
            type: 'select',
            feature: feature
        });
        expect(spyChangeStatus.calls.length).toBe(1);
    });

    it('translate interaction', () => {
        const fakeMap = {
            addLayer: () => {},
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
        expect(support.translateInteraction).toNotExist();
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
        expect(style.getFill().getColor()[3]).toNotExist();
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
        expect(style.getStroke().getColor()).toBe('#ff0');
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
        expect(spyAddInteraction.calls.length).toBe(2);
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
