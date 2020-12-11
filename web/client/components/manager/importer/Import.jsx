/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Spinner from 'react-spinkit';
import OverlayTrigger from '../../misc/OverlayTrigger';

import Message from '../../I18N/Message';
import TaskProgress from './TaskProgress';
import { getbsStyleForState } from '../../../utils/ImporterUtils';
import { Grid, Row, Panel, Label, Table, Glyphicon, Tooltip } from 'react-bootstrap';
import './style/importer.css';
import Button from '../misc/Button';

class Task extends React.Component {
    static propTypes = {
        timeout: PropTypes.number,
        "import": PropTypes.object,
        loadImport: PropTypes.func,
        loadTask: PropTypes.func,
        loadStylerTool: PropTypes.func,
        runImport: PropTypes.func,
        updateProgress: PropTypes.func,
        deleteImport: PropTypes.func,
        deleteTask: PropTypes.func,
        deleteAction: PropTypes.node,
        placement: PropTypes.string
    };

    static contextTypes = {
        router: PropTypes.object,
        messages: PropTypes.object
    };

    static defaultProps = {
        placement: "bottom",
        deleteAction: <Message msgId="importer.task.delete"/>,
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

    componentDidMount() {
        if (this.props.import.state === "RUNNING") {
            // Check if some task is running the update is not needed
            this.interval = setInterval(this.props.loadImport.bind(null, this.props.import.id), this.props.timeout);

        }
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    renderGeneral = (importObj) => {
        return (<dl className="dl-horizontal">
            <dt><Message msgId="importer.import.status" /></dt>
            <dd><Label bsStyle={getbsStyleForState(importObj.state)}>{importObj.state}</Label></dd>
            <dt><Message msgId="importer.import.archive" /></dt>
            <dd>{importObj.archive}</dd>
        </dl>);
    };

    renderProgressTask = (task) => {
        if ( task.state === "RUNNING") {
            return <TaskProgress progress={task.progress} total={task.total} state={task.state} update={this.props.updateProgress.bind(null, this.props.import.id, task.id)} />;
        }
        return null;
    };

    renderTask = (task) => {
        let tooltipDelete = <Tooltip id="import-delete-action">{this.props.deleteAction}</Tooltip>;
        return (<tr key={task && task.id}>
            <td><a onClick={(e) => {e.preventDefault(); this.props.loadTask(task.id); }} >{task.id}</a></td>
            <td><Label bsStyle={getbsStyleForState(task.state)}>{task.state}</Label>{this.renderProgressTask(task)}{this.renderLoadingTask(task)}</td>
            <td key="actions">
                <OverlayTrigger overlay={tooltipDelete} placement={this.props.placement}>
                    <Button className="importer-button" bsSize="xsmall" onClick={(e) => {e.preventDefault(); this.props.deleteTask(this.props.import.id, task.id); }}>
                        <Glyphicon glyph="remove"/>
                    </Button>
                </OverlayTrigger>
            </td>
        </tr>);
    };

    renderLoading = () => {
        if (this.props.import.loading) {
            return <div style={{"float": "left"}}><Spinner noFadeIn overrideSpinnerClassName="spinner" spinnerName="circle"/></div>;
        }
        return null;
    };

    renderLoadingMessage = (task) => {
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
    };

    renderLoadingTask = (task) => {
        if (task.loading) {
            return (<div style={{"float": "right"}}>
                {this.renderLoadingMessage(task)}
                <Spinner noFadeIn overrideSpinnerClassName="spinner" spinnerName="circle"/></div>);
        }
        return null;
    };

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
                                    <th><Message msgId="importer.number"/></th>
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
                            this.props.import.tasks.reduce((prev, cur) => prev || cur.state === "READY", false) ?
                                <Button bsStyle="success" onClick={() => {this.props.runImport(this.props.import.id); }}><Message msgId="importer.import.runImport" /></Button>
                                : null
                        }
                        <Button bsStyle="danger" onClick={() => {this.props.deleteImport(this.props.import.id); }}><Message msgId="importer.import.deleteImport" /></Button>
                    </Row>
                </Grid>
            </Panel>
        );
    }

    editDefaultStyle = (taskId) => {
        this.context.router.history.push("/styler/openlayers");
        this.props.loadStylerTool(taskId);
    };
}

export default Task;
