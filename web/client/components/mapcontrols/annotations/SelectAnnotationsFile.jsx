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


const Message = require('../../I18N/Message');
const ResizableModal = require('../../misc/ResizableModal');

const FileUtils = require('../../../utils/FileUtils');
const {ANNOTATION_TYPE} = require('../../../utils/AnnotationsUtils');
const {Promise} = require('es6-promise');

class SelectAnnotationsFile extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        onFileChoosen: PropTypes.func,
        error: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        errorMessage: PropTypes.string,
        onClose: PropTypes.func,
        title: PropTypes.node,
        closeGlyph: PropTypes.string,
        disableOvveride: PropTypes.bool
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        show: false,
        text: <Message msgId="annotations.selectfiletext"/>,
        onFileChoosen: () => {},
        onClose: () => {},
        closeGlyph: "",
        errorMessage: "annotations.loaderror",
        title: <Message msgId="annotations.loadtitle" />,
        disableOvveride: false
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
                    <Dropzone onDropRejected={this.checkfile} rejectClassName="ms-alert ms-alert-center text-center alert-danger" className="ms-alert ms-alert-center text-center" onDrop={this.checkfile}>
                        <div className="alert alert-info" role="alert" style={{margin: 15, flex: 1}}>{this.state.loading && <Spinner spinnerName="circle" overrideSpinnerClassName="spinner"/>}{this.props.text}</div>
                    </Dropzone>
                    <div style={{margin: 15, flex: 1}}>
                        <Checkbox disabled={this.props.disableOvveride} checked={this.state.override} onChange={() => this.setState(() => ({override: !this.state.override}))}>
                            <Message msgId="annotations.loadoverride" />
                        </Checkbox>
                    </div>
                </div>
            </ResizableModal>
        );
    }
    setError = () => {
        this.setState(() => ({error: this.props.errorMessage, loading: false}));
    }
    // Modificare per accettare file json ma non devono per forza avere ext.json
    // inoltre può accettare qualsiasi collezione di features inoltre filtrare le features che hanno medesimo id
    checkfile = (files) => {
        this.setState(() => ({loading: true}));
        Promise.all(files.map(file => FileUtils.readGeoJson(file))).then((contents) => {
            if (this.state.error) {
                this.setState(() => ({error: null}));
            }
            // Get only features
            const annotations = contents.filter(({geoJSON, errors = []}) => errors.length === 0 || geoJSON.type === ANNOTATION_TYPE).reduce((acc, {geoJSON}) => acc.concat(geoJSON.features || geoJSON), []);
            if (annotations.length === 0) {
                throw new Error();
            }
            this.props.onFileChoosen(annotations, this.state.override);
            this.setState(() => ({loading: false}));
            this.props.onClose();
        }).catch(() => {
            this.setError();
        });
    };
}

module.exports = SelectAnnotationsFile;
