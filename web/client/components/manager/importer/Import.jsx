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
const TaskProgress = require('./TaskProgress');
const ImporterUtils = require('../../../utils/ImporterUtils');
const {Grid, Row, Panel, Label, Table, Button, Glyphicon} = require('react-bootstrap');
require("./style/importer.css");

const Task = React.createClass({
    propTypes: {
        timeout: React.PropTypes.number,
        "import": React.PropTypes.object,
        loadImport: React.PropTypes.func,
        loadTask: React.PropTypes.func,
        loadStylerTool: React.PropTypes.func,
        runImport: React.PropTypes.func,
        updateProgress: React.PropTypes.func,
        deleteImport: React.PropTypes.func,
        deleteTask: React.PropTypes.func
    },
    contextTypes: {
        router: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            timeout: 10000,
            "import": {},
            loadTask: () => {},
            runImport: () => {},
            loadImport: () => {},
            loadStylerTool: () => {},
            updateProgress: () => {},
            deleteImport: () => {},
            deleteTask: () => {}
        };
    },
    componentDidMount() {
        if (this.props.import.state === "RUNNING") {
            // Check if some task is running the update is not needed
            if ( this.props.import.tasks && !(this.props.import.tasks.findIndex((task) => task.state === "RUNNING") >= 0)) {
                this.interval = setInterval(this.props.loadImport.bind(null, this.props.import.id), this.props.timeout);
            }

        }
    },
    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    },
    getbsStyleForState(state) {
        return ImporterUtils.getbsStyleForState(state);
    },
    renderGeneral(importObj) {
        return (<dl className="dl-horizontal">
              <dt><Message msgId="importer.import.status" /></dt>
              <dd><Label bsStyle={this.getbsStyleForState(importObj.state)}>{importObj.state}</Label></dd>
              <dt><Message msgId="importer.import.archive" /></dt>
              <dd>{importObj.archive}</dd>
            </dl>);
    },
    renderProgressTask(task) {
        if ( task.state === "RUNNING") {
            return <TaskProgress progress={task.progress} total={task.total} state={task.state} update={this.props.updateProgress.bind(null, this.props.import.id, task.id)} />;
        }
    },
    renderTask(task) {

        return (<tr key={task && task.id}>
            <td><a onClick={(e) => {e.preventDefault(); this.props.loadTask(task.id); }} >{task.id}</a></td>
            <td><Label bsStyle={this.getbsStyleForState(task.state)}>{task.state}</Label>{this.renderProgressTask(task)}{this.renderLoadingTask(task)}</td>
            <td key="actions">
                <Button className="importer-button" bsSize="xsmall" onClick={(e) => {e.preventDefault(); this.props.deleteTask(this.props.import.id, task.id); }}>
                    <Glyphicon glyph="remove-circle"/>
                    <Message msgId="importer.import.delete" />
                </Button>
                {task.state === "COMPLETE" ?
                    <Button className="importer-button" bsSize="xsmall" onClick={this.editDefaultStyle.bind(null, task.id)}>
                        <Glyphicon glyph="pencil"/>Edit Default Style</Button>
                : null}
            </td>
        </tr>);
    },
    renderLoading() {
        if (this.props.import.loading) {
            return <div style={{"float": "left"}}><Spinner noFadeIn spinnerName="circle"/></div>;
        }
    },
    renderLoadingMessage(task) {
        switch (task.message) {
            case "applyPresets":
                return <Message msgId="importer.import.applyingPreset"/>;
            case "deleting":
                return <Message msgId="importer.import.deleting" />;
            case "analyzing":
                return <Message msgId="importer.import.analyzing" />;
            default:
                return null;
        }
    },
    renderLoadingTask(task) {
        if (task.loading) {
            return (<div style={{"float": "right"}}>
                {this.renderLoadingMessage(task)}
                <Spinner noFadeIn spinnerName="circle"/></div>);
        }
        return null;
    },
    render() {
        return (
            <Panel header={<span><Message msgId="importer.importN" msgParams={{id: this.props.import.id}}/>{this.renderLoading()}</span>} >
            <Grid fluid>
                <Row>
                    {this.renderGeneral(this.props.import)}
                </Row>
                <Row>
                    <h3><Message msgId="importer.import.tasks" /></h3>
                    <Table striped bordered condensed hover>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th><Message msgId="importer.import.status" /></th>
                            <th><Message msgId="importer.import.actions" /></th>
                          </tr>
                        </thead>
                        <tbody>
                            {this.props.import.tasks.map(this.renderTask)}
                        </tbody>
                    </Table>
                </Row>
                <Row style={{"float": "right"}}>
                    {
                        this.props.import.tasks.reduce((prev, cur) => (prev || (cur.state === "READY")), false) ?
                        (<Button bsStyle="success" onClick={() => {this.props.runImport(this.props.import.id); }}><Message msgId="importer.import.runImport" /></Button>)
                        : null
                    }
                    <Button bsStyle="danger" onClick={() => {this.props.deleteImport(this.props.import.id); }}><Message msgId="importer.import.deleteImport" /></Button>
                </Row>
            </Grid>
            </Panel>
        );
    },
    editDefaultStyle(taskId) {
        this.context.router.push("/styler/openlayers");
        this.props.loadStylerTool(taskId);
    }
});
module.exports = Task;
