/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Spinner from 'react-spinkit';
import PropTypes from 'prop-types';
import { Table, Glyphicon, Label, Tooltip } from 'react-bootstrap';
import { findIndex } from 'lodash';

import Button from '../misc/Button';
import Message from '../../I18N/Message';
import { getbsStyleForState } from '../../../utils/ImporterUtils';
import OverlayTrigger from '../../misc/OverlayTrigger';

class ImportsGrid extends React.Component {
    static propTypes = {
        loading: PropTypes.bool,
        timeout: PropTypes.number,
        loadImports: PropTypes.func,
        loadImport: PropTypes.func,
        deleteImport: PropTypes.func,
        imports: PropTypes.array,
        deleteAction: PropTypes.object,
        placement: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        timeout: 5000,
        loadImports: () => {},
        placement: "bottom",
        deleteAction: <Message msgId="importer.import.deleteImport" />,
        loadImport: () => {},
        deleteImport: () => {},
        imports: []
    };

    componentDidMount() {
        this.interval = setInterval(() => {this.update(); }, this.props.timeout);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    renderLoadingMessage = (importObj) => {
        switch (importObj.message) {
        case "deleting":
            return <Message msgId="importer.import.deleting" />;
        default:
            return null;
        }
    };

    renderLoadingImport = (importObj) => {
        if (importObj.loading) {
            return <div style={{"float": "right"}}>{this.renderLoadingMessage(importObj)}<Spinner noFadeIn overrideSpinnerClassName="spinner" spinnerName="circle"/></div>;
        }
        return null;
    };

    renderImportErrorMessage = (imp) => {
        if (imp && imp.error) {
            return <Label bsStyle="danger">{"Could not delete import, please try to delete all its content first"}</Label>;
        }
        return null;
    };

    renderImport = (importObj) => {
        let tooltip = <Tooltip id="import-delete-action">{this.props.deleteAction}</Tooltip>;
        return (<tr key={importObj && importObj.id}>
            <td key="id"><a onClick={(e) => {e.preventDefault(); this.props.loadImport(importObj.id); }} >{importObj.id}</a></td>
            <td key="state"><Label bsStyle={getbsStyleForState(importObj.state)}>{importObj.state}</Label>
                {this.renderLoadingImport(importObj)}
                {this.renderImportErrorMessage(importObj)}
            </td>
            <td key="actions">
                <OverlayTrigger overlay={tooltip} placement={this.props.placement}>
                    <Button bsSize="xsmall" onClick={(e) => {e.preventDefault(); this.props.deleteImport(importObj.id); }}><Glyphicon glyph="remove"/></Button>
                </OverlayTrigger>
            </td>
        </tr>);
    };

    render() {
        if (this.props.loading && this.props.imports.length === 0) {
            return <Spinner noFadeIn overrideSpinnerClassName="spinner" spinnerName="circle"/>;
        }
        return (
            <Table striped bordered condensed hover>
                <thead>
                    <tr>
                        <th><Message msgId="importer.number"/></th>
                        <th><Message msgId="importer.import.status" /></th>
                        <th><Message msgId="importer.import.actions" /></th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.imports.map(this.renderImport)}
                </tbody>
            </Table>
        );
    }

    update = () => {
        if (this.props.imports) {
            let i = findIndex(this.props.imports, (importObj) => importObj.state === "RUNNING");
            if ( i >= 0 ) {
                this.props.loadImports();
            }
        }
    };
}

export default ImportsGrid;
