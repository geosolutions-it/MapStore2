import React, { useEffect, useState } from 'react';
import Dialog from '../misc/Dialog';
import { Button, ControlLabel, FormControl, FormGroup, Glyphicon } from 'react-bootstrap';
import Message from '../I18N/Message';
import ColorSelector from '../style/ColorSelector';

const ConfigureView = ({ active, onToggle, name, color, onSave }) => {
    const [setting, setSetting] = useState({ name: null, color: null });
    useEffect(() => {
        setSetting({ name, color });
    }, [name, color]);
    return (
        <div>
            {active && (
                <Dialog
                    id="mapstore-export-data-results"
                    draggable={false}
                    modal>
                    <span role="header">
                        <span className="modal-title about-panel-title"><Message msgId="dashboard.view.configure"/></span>
                        <button onClick={() => onToggle()} className="settings-panel-close close">
                            <Glyphicon glyph="1-close"/>
                        </button>
                    </span>
                    <div role="body" className="_padding-lg">
                        <FormGroup className="_padding-b-sm">
                            <ControlLabel><Message msgId="dashboard.view.name" /></ControlLabel>
                            <FormControl
                                type="text"
                                value={setting.name}
                                onChange={event => {
                                    const { value } = event.target || {};
                                    setSetting(prev => ({ ...prev, name: value }));
                                }}
                            />
                        </FormGroup>
                        <FormGroup className="ms-flex-box _flex _flex-gap-sm _flex-center-v">
                            <ControlLabel><Message msgId="dashboard.view.color" /></ControlLabel>
                            <div className="dashboard-color-picker">
                                <ColorSelector
                                    format="rgb"
                                    color={setting.color}
                                    onChangeColor={(colorVal) => colorVal && setSetting(prev =>({
                                        ...prev,
                                        color: colorVal
                                    }))}
                                />
                            </div>
                        </FormGroup>
                    </div>
                    <div role="footer">
                        <Button
                            bsStyle="default"
                            onClick={() => onToggle()}
                        >Cancel</Button>
                        <Button
                            bsStyle="primary"
                            onClick={() => onSave(setting)}
                        >Save</Button>
                    </div>
                </Dialog>
            )}
        </div>
    );
};

export default ConfigureView;
