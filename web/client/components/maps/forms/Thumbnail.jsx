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
const { getResourceIdFromURL } = require('../../../utils/ResourceUtils');
const Thumbnail = require('../../misc/Thumbnail').default;

const errorMessages = {
    "FORMAT": <Message msgId="map.errorFormat" />,
    "SIZE": <Message msgId="map.errorSize" />
};
/**
 * A Dropzone area for a thumbnail.
 */

class MapThumbnail extends React.Component {
    static propTypes = {
        glyphiconRemove: PropTypes.string,
        style: PropTypes.object,
        thumbnailErrors: PropTypes.array,
        loading: PropTypes.bool,
        withLabel: PropTypes.bool,
        map: PropTypes.object,
        maxFileSize: PropTypes.number,
        // CALLBACKS
        onDrop: PropTypes.func,
        onError: PropTypes.func,
        onUpdate: PropTypes.func,
        onSaveAll: PropTypes.func,
        onCreateThumbnail: PropTypes.func,
        onDeleteThumbnail: PropTypes.func,
        onRemoveThumbnail: PropTypes.func,
        // I18N
        message: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        suggestion: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        loading: false,
        withLabel: true,
        glyphiconRemove: "remove-circle",
        maxFileSize: 500000,
        // CALLBACKS
        onDrop: () => {},
        onError: () => {},
        onUpdate: () => {},
        onSaveAll: () => {},
        onRemoveThumbnail: () => {},
        onCreateThumbnail: () => {},
        onDeleteThumbnail: () => {},
        // I18N
        message: <Message msgId="map.message"/>,
        suggestion: <Message msgId="map.suggestion"/>,
        map: {},
        thumbnailErrors: []
    };

    state = {};

    getThumbnailUrl = () => {
        return this.props.map && this.props.map.newThumbnail && this.props.map.newThumbnail !== "NODATA"
            // this decode is for backward compatibility with old linked resources`rest%2Fgeostore%2Fdata%2F2%2Fraw%3Fdecode%3Ddatauri` not needed for new ones `rest/geostore/data/2/raw?decode=datauri`
            ? decodeURIComponent(this.props.map.newThumbnail)
            : null;
    };

    getDataUri = (images, callback) => {
        let filesSelected = images;
        if (filesSelected && filesSelected.length > 0) {
            let fileToLoad = filesSelected[0];
            let fileReader = new FileReader();
            fileReader.onload = (event) => callback(event.target.result, fileToLoad.size);
            return fileReader.readAsDataURL(fileToLoad);
        }
        return callback(null);
    };

    getThumbnailDataUri = (callback) => {
        this.getDataUri(this.files, callback);
    };

    renderThumbnailErrors() {

        return this.props.thumbnailErrors && this.props.thumbnailErrors.length > 0 ? (
            <div className="dropzone-errorBox alert-danger">
                <p><Message msgId="map.error"/></p>
                {(this.props.thumbnailErrors.map(err =>
                    <div id={"error" + err} key={"error" + err} className={"error" + err}>
                        {errorMessages[err]}
                    </div>
                ))}
            </div>
        ) : null;
    }

    render() {
        return (
            <Thumbnail
                ref="imgThumbnail"
                thumbnail={this.getThumbnailUrl()}
                className={null}
                dropZoneProps={{
                    className: 'dropzone alert alert-info',
                    rejectClassName: 'alert-danger'
                }}
                loading={this.props.loading}
                maxFileSize={this.props.maxFileSize}
                style={{
                    pointerEvents: this.props.map.saving ? "none" : "auto"
                }}
                label={this.props.withLabel && <label className="control-label"><Message msgId="map.thumbnail"/></label>}ù
                message={<>{this.props.message}<br/>{this.props.suggestion}</>}
                error={this.renderThumbnailErrors()}
                onUpdate={(data, files) => {
                    // without errors
                    this.props.onError([], this.props.map.id);
                    this.files  = files;
                    this.props.onUpdate(data, files?.[0]?.preview);
                }}
                onError={(errors, files) => {
                    // with at least one error
                    this.props.onError(errors, this.props.map.id);
                    this.files  = files;
                    this.props.onUpdate(null, null);
                }}
                onRemove={() => {
                    this.files = null;
                    this.props.onUpdate(null, null);
                    this.props.onRemoveThumbnail();
                    this.props.onError([], this.props.map.id);
                }}
            />
        );
    }

    generateUUID = () => {
        // TODO this function should be removed when the unique rule of name of a resource will be dropped
        // and a not unique can be associated to the new thumbnail resources
        let d = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function") {
            d += performance.now(); // use high-precision timer if available
        }
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
        });
        return uuid;
    };

    processUpdateThumbnail = (map, metadata, data) => {
        const name = this.generateUUID(); // create new unique name
        const category = "THUMBNAIL";
        // user removed the thumbnail (the original url is present but not the preview)
        if (this.props.map && !data && this.props.map.thumbnail && !this.refs.imgThumbnail && !metadata) {
            this.deleteThumbnail(this.props.map.thumbnail, this.props.map.id, true);
        // there is a thumbnail to upload
        }
        if (this.props.map && !data && this.props.map.newThumbnail && !this.refs.imgThumbnail && metadata) {
            this.deleteThumbnail(this.props.map.thumbnail, this.props.map.id, false);
            this.props.onSaveAll(map, metadata, name, data, category, this.props.map.id);
        // there is a thumbnail to upload
        }
        // remove old one if present
        if (this.props.map.newThumbnail && data && this.refs.imgThumbnail) {
            this.deleteThumbnail(this.props.map.thumbnail, null, false);
            // create the new one (and update the thumbnail attribute)
            this.props.onSaveAll(map, metadata, name, data, category, this.props.map.id);
        }
        // nothing dropped it will be closed the modal
        if (this.props.map.newThumbnail && !data && this.refs.imgThumbnail) {
            this.props.onSaveAll(map, metadata, name, data, category, this.props.map.id);
        }
        if (!this.props.map.newThumbnail && !data && !this.refs.imgThumbnail) {
            if (this.props.map.thumbnail && metadata) {
                this.deleteThumbnail(this.props.map.thumbnail, this.props.map.id, false);
            }
            this.props.onSaveAll(map, metadata, name, data, category, this.props.map.id);
        }
    }

    updateThumbnail = (map, metadata) => {
        if (!this.props.map.errors || !this.props.map.errors.length ) {
            this.getDataUri(this.files, (data) => {
                this.processUpdateThumbnail(map, metadata, data);
                return data;
            });
        }
    };

    deleteThumbnail = (thumbnail, mapId) => {
        if (thumbnail && thumbnail.indexOf("geostore") !== -1) {
            const idThumbnail = getResourceIdFromURL(thumbnail);
            // delete the old thumbnail
            if (idThumbnail) {
                // with mapId != null it will override thumbnail attribute with NODATA value for that map
                this.props.onDeleteThumbnail(idThumbnail, mapId);
            }
        }
    };
}

module.exports = MapThumbnail;
