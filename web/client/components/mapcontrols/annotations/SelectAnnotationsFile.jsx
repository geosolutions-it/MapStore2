/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');

const Dropzone = require('react-dropzone');
const Spinner = require('react-spinkit');
const {Checkbox} = require("react-bootstrap");

const {isEmpty} = require("lodash");

const Message = require('../../I18N/Message');
const ResizableModal = require('../../misc/ResizableModal');

const LocaleUtils = require('../../../utils/LocaleUtils');

const FileUtils = require('../../../utils/FileUtils');
const {Promise} = require('es6-promise');

class SelectAnnotationsFile extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        onFileChoosen: PropTypes.func,
        error: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        errorMessage: PropTypes.string,
        onClose: React.PropTypes.func,
        title: PropTypes.node,
        closeGlyph: PropTypes.string,
        diableOvveride: React.PropTypes.bool
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        show: false,
        text: "Drop your file here or click to select the Annotation File to import. (supported files: JSON)",
        onFileChoosen: () => {},
        onClose: () => {},
        closeGlyph: "",
        errorMessage: "annotations.loaderror",
        title: <Message msgId="annotations.loadtitle" />,
        diableOvveride: false
    };
    state = {
        override: false,
        loading: false
    }
    renderError = () => (
        <div className="ms-alert-center text-center">
            <div className="alert alert-danger" role="alert" style={{margin: 15, flex: 1}}>
                <Message msgId={this.state.error}/>
            </div>
        </div>)
    render() {
        return (
            <ResizableModal title={this.props.title} bodyClassName="ms-flex" show={this.props.show} showClose onClose={this.props.onClose} size="sm">
                    <div className="" style={{flexDirection: "column"}}>
                    {this.state.error && this.renderError()}
                        <Dropzone accept="application/json" onDropRejected={this.checkfile} rejectClassName="ms-alert ms-alert-center text-center alert-danger" className="ms-alert ms-alert-center text-center" onDrop={this.checkfile}>
                            <div className="alert alert-info" role="alert" style={{margin: 15, flex: 1}}>{this.state.loading && <Spinner spinnerName="circle" overrideSpinnerClassName="spinner"/>}{this.props.text}</div>
                        </Dropzone>
                        <div style={{margin: 15, flex: 1}}>
                        <Checkbox disabled={this.props.diableOvveride} checked={this.state.override} onChange={() => this.setState(() => ({override: !this.state.override}))}>
                                <Message msgId="annotations.loadoverride" />
                        </Checkbox>
                        </div>
                    </div>
            </ResizableModal>
        );
    }

    checkFileType = (file) => {
        return new Promise((resolve, reject) => {
            const ext = FileUtils.recognizeExt(file.name);
            const type = file.type || FileUtils.MIME_LOOKUPS[ext];
            if (type === 'application/json') {
                resolve();
            } else {
                reject();
            }
        });
    }
    readFiles = files => Promise.all(files.map(file => FileUtils.readJson(file)))
    setError = () => {
        const error = LocaleUtils.getMessageById(this.context.messages, this.props.errorMessage);
        this.setState(() => ({error: error || this.props.errorMessage, loading: false}));
    }
    checkfile = (files) => {
        this.setState(() => ({loading: true}));
        Promise.all(files.map(file => this.checkFileType(file))).then(() => {
            if (this.state.error) {
                this.setState(() => ({error: null}));
            }
            this.readFiles(files).then((features) => {
                const annotations = features.reduce((acc, fts) => acc.concat(fts), []).filter(f => f.type === "Feature" && !isEmpty(f.geometry) && !isEmpty(f.properties) && !isEmpty(f.style));
                if (annotations.length === 0) {
                    throw new Error();
                }
                this.props.onFileChoosen(annotations, this.state.override);
                this.setState(() => ({loading: false}));
                this.props.onClose();
            }).catch(() => {
                this.setError();
            });
        }).catch(() => {
            this.setError();
        });
    };
}

module.exports = SelectAnnotationsFile;
