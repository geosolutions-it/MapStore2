const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Dropzone = require('react-dropzone');
const Spinner = require('react-spinkit');

const LocaleUtils = require('../../utils/LocaleUtils');

const JSZip = require('jszip');
const FileUtils = require('../../utils/FileUtils');
const {Promise} = require('es6-promise');

class SelectShape extends React.Component {
    static propTypes = {
        text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        loading: PropTypes.bool,
        onShapeChoosen: PropTypes.func,
        onShapeError: PropTypes.func,
        error: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        errorMessage: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        text: "Drop or click to import a local Shape",
        onShapeChoosen: () => {},
        onShapeError: () => {},
        errorMessage: "shapefile.error.select"
    };

    render() {
        return (
            this.props.loading ? <div className="btn btn-info" style={{"float": "center"}}> <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner"/></div> :
                <Dropzone rejectClassName="alert-danger" className="alert alert-info" onDrop={this.checkfile}>
                    <div className="dropzone-content" style={{textAlign: "center"}}>{this.props.text}</div>
                </Dropzone>
        );
    }

    tryUnzip = (file) => {
        return FileUtils.readZip(file).then((buffer) => {
            var zip = new JSZip();
            return zip.loadAsync(buffer);
        });
    };

    checkFileType = (file) => {
        return new Promise((resolve, reject) => {
            const ext = FileUtils.recognizeExt(file.name);
            const type = file.type || FileUtils.MIME_LOOKUPS[ext];
            if (type === 'application/x-zip-compressed' ||
                type === 'application/zip' ||
                type === 'application/vnd.google-earth.kml+xml' ||
                type === 'application/vnd.google-earth.kmz' ||
                type === 'application/gpx+xml') {
                resolve();
            } else {
                this.tryUnzip(file).then(resolve).catch(reject);
            }
        });
    };

    checkfile = (files) => {
        Promise.all(files.map(file => this.checkFileType(file))).then(() => {
            if (this.props.error) {
                this.props.onShapeError(null);
            }
            this.props.onShapeChoosen(files);
        }).catch(() => {
            const error = LocaleUtils.getMessageById(this.context.messages, this.props.errorMessage);
            this.props.onShapeError(error);
        });
    };
}

module.exports = SelectShape;
