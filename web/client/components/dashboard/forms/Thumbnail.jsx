const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Glyphicon} = require('react-bootstrap');
const Dropzone = require('react-dropzone');
const Spinner = require('react-spinkit');
const Message = require('../../../components/I18N/Message');
/**
 * A Dropzone area for a thumbnail.
 */

class Thumbnail extends React.Component {
    static propTypes = {
        glyphiconRemove: PropTypes.string,
        style: PropTypes.object,
        loading: PropTypes.bool,
        resource: PropTypes.object,
        onError: PropTypes.func,
        onUpdate: PropTypes.func,
        onRemove: PropTypes.func,
        // I18N
        message: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        suggestion: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        loading: false,
        glyphiconRemove: "remove-circle",
        resource: {},
        // CALLBACKS
        onError: () => {},
        onUpdate: () => {},
        onSaveAll: () => {},
        onRemove: () => {},
        // I18N
        message: <Message msgId="map.message"/>,
        suggestion: <Message msgId="map.suggestion"/>
    };

    state = {};

    onRemoveThumbnail = (event) => {
        if (event !== null) {
            event.stopPropagation();
        }

        this.files = null;
        this.props.onError([]);
        this.props.onRemove();
    };

    getThumbnailUrl = () => {
        return this.props.thumbnail && this.props.thumbnail !== "NODATA" ? decodeURIComponent(this.props.thumbnail) : null;
    };

    isImage = (images) => {
        return images && images[0].type === "image/png" || images && images[0].type === "image/jpeg" || images && images[0].type === "image/jpg";
    };

    getDataUri = (images, callback) => {
        let filesSelected = images;
        if (filesSelected && filesSelected.length > 0) {
            let fileToLoad = filesSelected[0];
            let fileReader = new FileReader();
            fileReader.onload = (event) => callback(event.target.result);
            return fileReader.readAsDataURL(fileToLoad);
        }
        return callback(null);
    };

    onDrop = (images) => {
        // check formats and sizes
        const isAnImage = this.isImage(images);
        let errors = [];

        this.getDataUri(images, (data) => {
            if (isAnImage && data && data.length < 500000) {
                // without errors
                this.props.onError([], this.props.resource.id);
                this.files = images;
                this.props.onUpdate(data, images && images[0].preview);
            } else {
                // with at least one error
                if (!isAnImage) {
                    errors.push("FORMAT");
                }
                if (data && data.length >= 500000) {
                    errors.push("SIZE");
                }
                this.props.onError(errors, this.props.resource.id);
                this.files = images;
                this.props.onUpdate(null, null);
            }
        });
    };
    getThumbnailDataUri = (callback) => {
        this.getDataUri(this.files, callback);
    };
    render() {
        return (
            this.props.loading ? <div className="btn btn-info" style={{"float": "center"}}> <Spinner spinnerName="circle" overrideSpinnerClassName="spinner"/></div> :

                <div className="dropzone-thumbnail-container" style={{
                        pointerEvents: this.props.resource.saving ? "none" : "auto"
                    }}>
                    <label className="control-label"><Message msgId="map.thumbnail"/></label>
                    <Dropzone multiple={false} className="dropzone alert alert-info" rejectClassName="alert-danger" onDrop={this.onDrop}>
                    { this.getThumbnailUrl()
                        ? <div>
                                <img src={this.getThumbnailUrl()} />
                                <div className="dropzone-content-image-added">{this.props.message}<br/>{this.props.suggestion}</div>
                                <div className="dropzone-remove" onClick={this.onRemoveThumbnail}>
                                    <Glyphicon glyph={this.props.glyphiconRemove} />
                                </div>
                          </div>
                        : <div className="dropzone-content-image">{this.props.message}<br />{this.props.suggestion}</div>
                    }
                    </Dropzone>
                </div>

        );
    }
}

module.exports = Thumbnail;
