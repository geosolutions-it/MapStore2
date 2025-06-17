/* eslint-disable react/prop-types */
import React from 'react';
import isEmpty from 'lodash/isEmpty';
import {
    GPT_TOOL_BUFFER,
    GPT_TOOL_INTERSECTION
} from '../../actions/geoProcessing';
import ConfirmModal from '../../components/resources/modals/ConfirmModal';
import Loader from '../../components/misc/Loader';
import Message from '../../components/I18N/Message';
import HTML from "../../components/I18N/HTML";
import Button from '../../components/misc/Button';
import InfoPopover from '../../components/widgets/widget/InfoPopover';
import { getMessageById } from '../../utils/LocaleUtils';

/* add here new processes */
export const processes = [
    {
        id: GPT_TOOL_BUFFER,
        optionItem: {
            value: GPT_TOOL_BUFFER,
            labelMsgId: "GeoProcessing.bufferTool"
        },
        actions: {
            isRunDisabled: (props) => {
                return props.runningProcess ||
                props.isSourceLayerInvalid ||
                !(props.sourceLayerId && props.distance && props.areAllWPSAvailableForSourceLayer);
            },
            runProcess: (props) => {
                if (props.showHighlightLayers) {
                    props.onToggleHighlightLayers();
                }
                if (isEmpty(props.sourceFeature)) {
                    props.onShowWarning(true);
                } else {
                    props.onRunProcess(GPT_TOOL_BUFFER);
                }
            },
            runProcessConfirm: (props) => {
                props.onShowWarning(false);
                props.onRunProcess(GPT_TOOL_BUFFER);

            }

        },
        RunComponent: (props) => {
            return (<div className="run">
                <Button
                    disabled={props.isRunDisabled(props)}
                    onClick={() => props.runProcess(props)}
                >
                    <Message msgId={"GeoProcessing.run"} />
                    {props.runningProcess ? <Loader size={14} style={{margin: '0 auto'}}/> : null}
                </Button>
                <InfoPopover
                    bsStyle={props.isSourceLayerInvalid ? "danger" : "info"}
                    text={
                        props.isSourceLayerInvalid ? getMessageById(props.messages, "GeoProcessing.tooltip.invalidLayers") : getMessageById(props.messages, "GeoProcessing.tooltip.fillRequiredDataBuffer")
                    }
                />
            </div>);
        },
        ConfirmModal: (props) => {
            return (<ConfirmModal
                show={props.showWarning}
                onClose={props.handleCloseWarningModal}
                onConfirm={props.handleConfirmRunProcess}
                title={<Message msgId="GeoProcessing.warningTitle" />}
                fitContent
                confirmText={<Message msgId="GeoProcessing.warningConfirmText" />}
                cancelText={<Message msgId="GeoProcessing.warningCancel" />}
            >
                <div className="ms-detail-body">
                    <HTML msgId="GeoProcessing.warningBody" />
                </div>
            </ConfirmModal>);
        }
    },
    {
        id: GPT_TOOL_INTERSECTION,
        optionItem: {
            value: GPT_TOOL_INTERSECTION,
            labelMsgId: "GeoProcessing.intersectionTool"
        },
        actions: {
            isRunDisabled: (props) => {
                return props.runningProcess ||
                    !(props.isIntersectionEnabled && props.intersectionLayerId && props.sourceLayerId && props.areAllWPSAvailableForSourceLayer && props.areAllWPSAvailableForIntersectionLayer) ||
                    props.isIntersectionLayerInvalid ||
                    props.isSourceLayerInvalid;
            },
            runProcess: (props) => {
                if (props.showHighlightLayers) {
                    props.onToggleHighlightLayers();
                }
                if (isEmpty(props.sourceFeature) || isEmpty(props.intersectionFeature)) {
                    props.onShowWarning(true);
                } else {
                    props.onRunProcess(GPT_TOOL_INTERSECTION);
                }
            },
            runProcessConfirm: (props) => {
                props.onShowWarning(false);
                props.onRunProcess(GPT_TOOL_INTERSECTION);

            }
        },
        RunComponent: (props) => {
            return (<div className="run">
                <Button
                    disabled={props.isRunDisabled(props)}
                    onClick={() => props.runProcess(props)}
                >
                    <Message msgId={"GeoProcessing.run"} />
                    {props.runningProcess ? <Loader size={14} style={{margin: '0 auto'}}/> : null}
                </Button>
                <InfoPopover
                    bsStyle={!props.isIntersectionEnabled || props.isIntersectionLayerInvalid || props.isSourceLayerInvalid ? "danger" : "info"}
                    text={
                        !props.isIntersectionEnabled ? getMessageById(props.messages, "GeoProcessing.tooltip.pointAndPolygon") :
                            props.isIntersectionLayerInvalid || props.isSourceLayerInvalid  ?
                                getMessageById(props.messages, "GeoProcessing.tooltip.invalidLayers") : getMessageById(props.messages, "GeoProcessing.tooltip.fillRequiredDataIntersection")
                    }
                />
            </div>);
        },
        ConfirmModal: (props) => {
            return (<ConfirmModal
                show={props.showWarning}
                onClose={props.handleCloseWarningModal}
                onConfirm={props.handleConfirmRunProcess}
                title={<Message msgId="GeoProcessing.warningTitle" />}
                fitContent
                confirmText={<Message msgId="GeoProcessing.warningConfirmText" />}
                cancelText={<Message msgId="GeoProcessing.warningCancel" />}
            >
                <div className="ms-detail-body">
                    <HTML msgId="GeoProcessing.warningBody" />
                </div>
            </ConfirmModal>);
        }
    }
];
