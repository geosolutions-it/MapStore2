const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const ShapefileUploadAndStyle = require('../ShapefileUploadAndStyle');

describe("Test ShapefileUploadAndStyle component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates component with defaults', () => {
        const cmp = ReactDOM.render(<ShapefileUploadAndStyle/>, document.getElementById("container"));
        expect(cmp).toExist();
    });

    it('creates component loading', () => {
        const cmp = ReactDOM.render(<ShapefileUploadAndStyle loading />, document.getElementById("container"));
        expect(cmp).toExist();
    });

    it('test parser error', done => {
        const onShapeError = (error) => {
            try {
                expect(error).toBe('shapefile.error.shapeFileParsingError');
            } catch (e) {
                done(e);
            }
            done();
        };

        const cmp = ReactDOM.render(<ShapefileUploadAndStyle useDefaultStyle onShapeError={onShapeError} readFiles={() => {
            return ['{ "error":  }'].map(s => new Promise(() => JSON.parse(s)));
        }} />, document.getElementById("container"));
        expect(cmp).toExist();
        cmp.addShape();
    });

    it('test generic error', done => {
        const onShapeError = (error) => {
            try {
                expect(error).toBe('shapefile.error.genericLoadError');
            } catch (e) {
                done(e);
            }
            done();
        };

        const cmp = ReactDOM.render(<ShapefileUploadAndStyle useDefaultStyle onShapeError={onShapeError} readFiles={() => {
            return ["100"].map(() => new Promise(() => decodeURIComponent('%')));
        }} />, document.getElementById("container"));
        expect(cmp).toExist();
        cmp.addShape();
    });

    it('test adding a file.json in a zip archive', (done) => {
        const handlers = {
            onShapeChoosen: () => {},
            onShapeError: () => {},
            shapeLoading: () => {}
        };
        fetch('base/web/client/test-resources/LineGeoJSON.zip')
            .then((response) => {
                return response.blob();
            })
            .then(zip => {
                const fileZip = new File([ zip ], 'file.zip', { type: 'application/zip' });
                const spyOnShapeChoosen = expect.spyOn(handlers, 'onShapeChoosen');
                const spyShapeLoading = expect.spyOn(handlers, 'shapeLoading');

                const cmp = ReactDOM.render(<ShapefileUploadAndStyle useDefaultStyle {...handlers} />, document.getElementById("container"));
                expect(cmp).toExist();
                cmp.addShape([fileZip]);
                expect(spyShapeLoading).toHaveBeenCalled();
                expect(spyShapeLoading).toHaveBeenCalledWith(true);

                setTimeout(() => {
                    expect(spyOnShapeChoosen).toHaveBeenCalled();
                    const args = spyOnShapeChoosen.calls[0].arguments;
                    const layer = args[0][0];
                    expect(layer.type).toEqual("vector");
                    expect(layer.visibility).toEqual(true);
                    expect(layer.group).toEqual("Local shape");
                    expect(layer.name).toEqual("LineGeoJSON");
                    expect(layer.hideLoading).toEqual(true);
                    expect(layer.bbox).toEqual({
                        "bounds": {
                            "minx": 0,
                            "miny": 39,
                            "maxx": 28,
                            "maxy": 48
                        },
                        "crs": "EPSG:4326"
                    });
                    expect(layer.features[0].geometry).toEqual({
                        "type": "LineString",
                        "coordinates": [[ 0, 39 ], [ 28, 48 ] ]
                    });
                    expect(layer.features[0].type).toEqual("Feature");
                    expect(layer.features[0].id.length).toEqual("1e63efb0-6b37-11e9-8359-eb9aa043350b".length);
                    expect(spyShapeLoading).toHaveBeenCalled();
                    expect(spyShapeLoading).toHaveBeenCalledWith(false);
                    expect(spyShapeLoading.calls.length).toBe(2);
                    done();
                }, 100);
            })
            .catch(() => {
                expect(true).toBe(false);
            });
    });
});
