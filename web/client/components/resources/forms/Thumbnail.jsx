
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const Message = require('../../../components/I18N/Message');
const BaseThumbnail = require('../../../components/misc/Thumbnail').default;

/**
 * A Dropzone area for a thumbnail.
 */

class Thumbnail extends React.Component {
    static propTypes = {
        glyphiconRemove: PropTypes.string,
        style: PropTypes.object,
        loading: PropTypes.bool,
        resource: PropTypes.object,
        thumbnail: PropTypes.string,
        onError: PropTypes.func,
        onUpdate: PropTypes.func,
        onRemove: PropTypes.func,
        maxFileSize: PropTypes.number,
        // I18N
        message: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        suggestion: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        loading: false,
        glyphiconRemove: "trash",
        resource: {},
        // CALLBACKS
        onError: () => {},
        onUpdate: () => {},
        onSaveAll: () => {},
        onRemove: () => {},
        // I18N
        message: <Message msgId="map.message"/>,
        suggestion: <Message msgId="map.suggestion"/>,
        maxFileSize: 500000
    };

    state = {};

    getThumbnailUrl = () => {
        return this.props.thumbnail && this.props.thumbnail !== "NODATA"
            // this decode is for backward compatibility with old linked resources`rest%2Fgeostore%2Fdata%2F2%2Fraw%3Fdecode%3Ddatauri` not needed for new ones `rest/geostore/data/2/raw?decode=datauri`
            ? decodeURIComponent(this.props.thumbnail)
            : null;
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

    getThumbnailDataUri = (callback) => {
        this.getDataUri(this.files, callback);
    };
    render() {
        return (
            <BaseThumbnail
                thumbnail={this.getThumbnailUrl()}
                className={null}
                dropZoneProps={{
                    className: 'dropzone alert alert-info',
                    rejectClassName: 'alert-danger'
                }}
                loading={this.props.loading}
                message={<>{this.props.message}<br />{this.props.suggestion}</>}
                maxFileSize={this.props.maxFileSize}
                style={{
                    pointerEvents: this.props.resource.saving ? "none" : "auto"
                }}
                label={<label className="control-label"><Message msgId="map.thumbnail"/></label>}
                onUpdate={(data, files) => {
                    // without errors
                    this.props.onError([], this.props.resource.id);
                    this.files  = files;
                    this.props.onUpdate(data, files?.[0]?.preview);
                }}
                onError={(errors, files) => {
                    // with at least one error
                    this.props.onError(errors, this.props.resource.id);
                    this.files  = files;
                }}
                onRemove={() => {
                    this.files = null;
                    this.props.onUpdate(null, null);
                    this.props.onRemove();
                    this.props.onError([], this.props.resource.id);
                }}
            />
        );
    }
}

module.exports = Thumbnail;
