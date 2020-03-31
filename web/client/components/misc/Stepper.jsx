/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {Button, ButtonToolbar, Label} from 'react-bootstrap';
import Message from '../I18N/Message';
import BorderLayout from '../layout/BorderLayout';
import CloseButton from '../buttons/CloseButton';
import Loader from '../misc/Loader';

export default ({
    loading = false,
    steps = [],
    hideNamesExceptCurrent = false,
    currentStepId,
    onSetStep = () => {},
    onSave = () => {},
    onShowBackToPageConfirmation = () => { },
    showBackToPageConfirmation = false,
    backToPageConfirmationMessage = 'contextCreator.undo',
    onConfirmBackToPage = () => { }
}) => {
    const curStepIndex = steps.findIndex(step => step.id === currentStepId);

    const footer = (
        <div className="ms2-stepper">
            <div className="footer-button-toolbar-div">
                <ButtonToolbar className="footer-button-toolbar-extra">
                    {(steps[curStepIndex].extraToolbarButtons || []).map(({onClick = () => {}, label, id}, idx) =>
                        <Button key={id || label || idx} bsStyle="primary" bsSize="sm" onClick={onClick}>
                            <Message msgId={label}/>
                        </Button>
                    )}
                </ButtonToolbar>
                <ButtonToolbar className="footer-button-toolbar">
                    <Button
                        bsStyle="primary"
                        bsSize="sm"
                        disabled={steps[curStepIndex].disableNext || loading}
                        onClick={() => curStepIndex < steps.length - 1 ? onSetStep(steps[curStepIndex + 1].id) : onSave()}>
                        <Message msgId={curStepIndex < steps.length - 1 ? "stepper.next" : "save"}/>
                    </Button>
                    <Button
                        style={{height: '100%'}}
                        bsSize="sm"
                        className="no-border"
                        disabled={curStepIndex === 0 || loading}
                        onClick={() => onSetStep(steps[curStepIndex - 1].id)}>
                        <Message msgId="stepper.back"/>
                    </Button>
                    <CloseButton
                        style={{height: '100%'}}
                        className="no-border"
                        title={loading ? <Loader size={14}/> : <Message msgId="close"/>}
                        showConfirm={showBackToPageConfirmation}
                        onShowConfirm={onShowBackToPageConfirmation}
                        onConfirm={onConfirmBackToPage}
                        onClick={() => onShowBackToPageConfirmation(true)}
                        confirmMessage={backToPageConfirmationMessage}/>
                </ButtonToolbar>
            </div>
            <div className="footer-step-bar">
                {steps.map((step, idx) => {
                    const localizedLabel = <Message msgId={step.label}/>;
                    return (
                        <>
                            {idx > 0 &&
                            <div key={'line' + step.id} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                <div
                                    style={{
                                        backgroundColor: idx <= curStepIndex ? '#777' : '#ddd',
                                        height: 1,
                                        width: '100%'
                                    }}/>
                            </div>}
                            <div key={'label' + step.id} style={{ padding: 8, display: 'flex', alignItems: 'center' }}>
                                <Label
                                    bsStyle={idx === curStepIndex ? 'success' : 'primary'}
                                    style={idx <= curStepIndex ? {} : { backgroundColor: '#aaa'}}>
                                    {idx + 1}
                                </Label>
                                {(!hideNamesExceptCurrent || idx === curStepIndex) && <span style={{ padding: 8 }}>
                                    {idx === curStepIndex
                                        ? <strong>{localizedLabel}</strong>
                                        : localizedLabel}
                                </span>}
                            </div>
                        </>
                    );
                })}
            </div>
        </div>
    );

    return curStepIndex > -1 ?
        <BorderLayout
            footer={footer}>
            {steps[curStepIndex].component}
        </BorderLayout> : null;
};
