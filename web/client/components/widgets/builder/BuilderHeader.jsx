/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { Button, Row, Col, Glyphicon } = require('react-bootstrap');
const Message = require('../../I18N/Message');
const Toolbar = require('../../misc/toolbar/Toolbar');

const getBackTooltipId = step => {
    switch (step) {
        case 1:
            return "widgets.builder.wizard.backToTypeSelection";
        case 2:
            return "widgets.builder.wizard.backToChartOptions";
        default:
            return "back";

    }
};

const getNextTooltipId = step => {
    switch (step) {
        case 0:
            return "widgets.builder.wizard.configureChartOptions";
        case 1:
            return "widgets.builder.wizard.configureWidgetOptions";
        default:
            return "next";
    }
};

const getSaveTooltipId = (step, {id} = {}) => {
    if (id) {
        return "widgets.builder.wizard.updateWidget";
    }
    return "widgets.builder.wizard.addToTheMap";
};

module.exports = ({onClose = () => {}, openFilterEditor = () => {}, step = 0, editorData = {}, valid, setPage = () => {}, onFinish = () => {}} = {}) =>
(<div className="mapstore-flex-container">
    <div className="m-header">
        <Row>
        <Col md={12} className="text-center" style={{overflow: 'hidden', lineHeight: '52px'}}>
             <Button onClick={() => onClose()} className="pull-left square-button no-border ">
                <Glyphicon glyph="1-close"/>
            </Button>
        <span style={{padding: '50px 0 0 0', fontSize: 16}}><Message msgId="widgets.builder.header.title" /></span>
            {<Button style={{pointerEvents: "none"}} className="square-button pull-right no-border">
                <Glyphicon glyph="stats"/>
            </Button>}
        </Col>
        </Row>
        <Row className="text-center">
            <div className="m-padding-md">
                <Toolbar btnDefaultProps={{
                        bsStyle: "primary",
                        bsSize: "sm"
                    }}
                    buttons={[{
                        onClick: () => setPage(Math.max(0, step - 1)),
                        visible: step > 0,
                        glyph: "arrow-left",
                        tooltipId: getBackTooltipId(step)
                    }, {
                        visible: step > 0,
                        onClick: openFilterEditor,
                        glyph: "filter",
                        tooltipId: "widgets.builder.setupFilter"
                    }, {
                        onClick: () => setPage(Math.min(step + 1, 2)),
                        visible: !!(step === 0 && (!editorData.type || editorData.type.indexOf("WI") !== 0)) || step === 1,
                        disabled: step === 1 && !valid,
                        glyph: "arrow-right",
                        tooltipId: getNextTooltipId(step)
                    }, {
                        onClick: () => onFinish(Math.min(step + 1, 1)),
                        visible: step === 2,
                        glyph: "floppy-disk",
                        tooltipId: getSaveTooltipId(step, editorData)
                    }]} />
            </div>
        </Row>
    </div>
</div>
);
