const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Spinner = require('react-spinkit');
const Message = require('../../I18N/Message');
const ImportsGrid = require('./ImportsGrid');
const Workspace = require('./Workspace');
const FileUploader = require('../../file/FileUploader');
const Task = require('./Task');
const Import = require('./Import');
const Transform = require('./Transform');
const {Grid, Col, Row, Alert} = require('react-bootstrap');
const BreadCrumb = require('./BreadCrumb');
const {head} = require('lodash');

class Importer extends React.Component {
    static propTypes = {
        loading: PropTypes.bool,
        taskCreationError: PropTypes.object,
        error: PropTypes.object,
        defaultPresets: PropTypes.string,
        /**
         * Presets: {PRESET_ID: [changes: [{target: {}, layer: {}}], match: function() {...}, transforms: [{}, {}] }]}
         */
        presets: PropTypes.object,
        uploading: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
        createImport: PropTypes.func,
        runImport: PropTypes.func,
        loadWorkspaces: PropTypes.func,
        workspaces: PropTypes.array,
        selectedWorkSpace: PropTypes.object,
        selectWorkSpace: PropTypes.func,
        workspaceCreationStatus: PropTypes.object,
        dismissWorkspaceCreationStatus: PropTypes.func,
        createWorkspace: PropTypes.func,
        datastoreTemplates: PropTypes.array,
        deleteImport: PropTypes.func,
        updateTask: PropTypes.func,
        deleteTask: PropTypes.func,
        loadImports: PropTypes.func,
        loadImport: PropTypes.func,
        loadTask: PropTypes.func,
        updateProgress: PropTypes.func,
        loadLayer: PropTypes.func,
        updateLayer: PropTypes.func,
        loadStylerTool: PropTypes.func,
        loadTransform: PropTypes.func,
        updateTransform: PropTypes.func,
        editTransform: PropTypes.func,
        deleteTransform: PropTypes.func,
        uploadImportFiles: PropTypes.func,
        selectedImport: PropTypes.object,
        selectedTask: PropTypes.object,
        selectedTransform: PropTypes.object,
        imports: PropTypes.array,
        onMount: PropTypes.func
    };

    static defaultProps = {
        createImport: () => {},
        loadImport: () => {},
        loadTask: () => {},
        loadLayer: () => {},
        loadTransform: () => {},
        editTransform: () => {},
        updateTransform: () => {},
        loadImports: () => {},
        updateProgress: () => {},
        deleteTransform: () => {},
        uploadImportFiles: () => {},
        loadWorkspaces: () => {},
        dismissWorkspaceCreationStatus: () => {},
        createWorkspace: () => {},
        onMount: () => {},
        imports: []
    };

    componentDidMount() {
        this.props.onMount();
    }

    getPresets = () => {
        return this.props.presets && this.props.presets[this.props.defaultPresets];
    };

    getImportCreationDefaults = () => {
        let presets = this.getPresets();
        if (!presets) {
            return {
                importCreationDefaults: {
                    "import": {
                        "targetWorkspace": {
                            "workspace": {
                                "name": "cite"
                            }
                        }
                    }
                }
            };
        } else if (this.props.selectedWorkSpace) {
            return {
                "import": {
                    "targetWorkspace": {
                        "workspace": {
                            "name": this.props.selectedWorkSpace.value
                        }
                    }
                }
            };
        }
        return head(presets.filter((preset) => preset.import ));
    };

    getTargetWorkspace = (selectedImport) => {
        let targetWorkspace = selectedImport && selectedImport.targetWorkspace;
        if (targetWorkspace) {
            return targetWorkspace && targetWorkspace.workspace && targetWorkspace.workspace.name;
        }
        let creationDefaults = this.getImportCreationDefaults();
        let importObj = creationDefaults && creationDefaults.import || creationDefaults && creationDefaults.importCreationDefaults && creationDefaults.importCreationDefaults.import;
        return importObj && importObj.targetWorkspace && importObj.targetWorkspace.workspace && importObj.targetWorkspace.workspace.name;


    };

    renderError = () => {
        if (this.props.error) {
            return <Alert bsStyle="danger">There was an error during the import list loading: {this.props.error.statusText}</Alert>;
        }
    };

    renderLoading = () => {
        if (this.props.loading) {
            return <div style={{"float": "right"}}><Spinner noFadeIn overrideSpinnerClassName="spinner" spinnerName="circle"/></div>;
        }
        return null;
    };

    renderDetails = () => {
        let breadcrumb = (<BreadCrumb
            selectedImport={this.props.selectedImport}
            selectedTask={this.props.selectedTask}
            selectedTransform={this.props.selectedTransform}
            loadImports={this.props.loadImports}
            loadImport={this.props.loadImport}
            loadTask={this.props.loadTask}
            loadTransform={this.props.loadTransform}
            />);
        if ( this.props.selectedImport && this.props.selectedTask && this.props.selectedTransform) {
            return (<div>
            {breadcrumb}
            <h2>Transform {this.props.selectedTransform.id}</h2>
            <Transform
                transform={this.props.selectedTransform}
                editTransform={this.props.editTransform}
                updateTransform={this.props.updateTransform.bind(null, this.props.selectedImport.id, this.props.selectedTask.id, this.props.selectedTransform.id)}/>
            </div>);
        }
        if ( this.props.selectedImport && this.props.selectedTask) {
            return (<div>
            {breadcrumb}
            <Task
                task={this.props.selectedTask}
                updateTask={this.props.updateTask.bind(null, this.props.selectedImport.id, this.props.selectedTask.id)}
                deleteTask={this.props.deleteTask.bind(null, this.props.selectedImport.id, this.props.selectedTask.id)}
                deleteTransform={this.props.deleteTransform.bind(null, this.props.selectedImport.id, this.props.selectedTask.id)}
                loadTransform={this.props.loadTransform.bind(null, this.props.selectedImport.id, this.props.selectedTask.id)}
                loadLayer={this.props.loadLayer.bind(null, this.props.selectedImport.id, this.props.selectedTask.id)}
                updateLayer={this.props.updateLayer.bind(null, this.props.selectedImport.id, this.props.selectedTask.id)}
                />
            </div>);
        }
        if (this.props.selectedImport) {
            return (<div>
                {breadcrumb}
                <Import
                    loadStylerTool={this.props.loadStylerTool.bind(null, this.props.selectedImport.id)}
                    import={this.props.selectedImport}
                    loadTask={this.props.loadTask.bind(null, this.props.selectedImport.id)}
                    loadLayer={this.props.loadLayer.bind(null, this.props.selectedImport.id)}
                    runImport={this.props.runImport}
                    loadImport={this.props.loadImport}
                    updateProgress={this.props.updateProgress}
                    deleteTask={this.props.deleteTask}
                    deleteImport={this.props.deleteImport}
                     />
                </div>);
        }
        return (<div>
                {breadcrumb}
                <ImportsGrid
                loadImports={this.props.loadImports}
                deleteImport={this.props.deleteImport}
                loadImport={this.props.loadImport}
                imports={this.props.imports} />
            </div>);
    };

    render() {
        let message = this.props.selectedImport ? "importer.dropfileImport" : "importer.dropfile";
        return (
            <Grid fluid>
                <Row>
                    <Col md={6}>
                    <FileUploader
                        dropZoneStyle={{
                            borderStyle: "dashed",
                            minHeight: "100px",
                            borderWidth: "3px",
                            verticalAlign: "middle",
                            transition: "all 0.3s ease-in-out"
                        }}
                        dropZoneActiveStyle={{
                            backgroundColor: "#eee",
                            borderWidth: "5px",
                            boxShadow: "0px 0px 25px 14px #d9edf7"

                        }}
                        error={this.props.taskCreationError}
                        beforeUploadMessage={<Message msgId="importer.creatingImportProcess" />}
                        dropMessage={<Message msgId={message} />}
                        uploading={this.props.uploading}
                        allowUpload={this.props.selectedImport}
                        onBeforeUpload={this.props.createImport.bind(null, this.getImportCreationDefaults())}
                        onUpload={this.props.uploadImportFiles.bind(null, this.props.selectedImport && this.props.selectedImport.id)}
                        uploadAdditionalParams={this.getPresets()} />
                    </Col>
                    <Col md={6}>
                        <Workspace
                            onStatusDismiss={this.props.dismissWorkspaceCreationStatus}
                            status={this.props.workspaceCreationStatus}
                            enabled={!!this.props.selectedImport}
                            createWorkspace={this.props.createWorkspace}
                            datastoreTemplates={this.props.datastoreTemplates}
                            selectWorkSpace={this.props.selectWorkSpace}
                            selectedWorkSpace={this.getTargetWorkspace(this.props.selectedImport)}
                            workspaces={this.props.workspaces}
                            loadWorkspaces={this.props.loadWorkspaces}/>
                    </Col>
                </Row>
                <Row>
                    {this.renderLoading()}
                    {this.renderDetails()}
                    {this.renderError()}
                </Row>
            </Grid>);
    }

    createUpdateFunction = () => {
        return;
    };
}

module.exports = Importer;
