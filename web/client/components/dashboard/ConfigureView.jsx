import React, { useEffect, useState } from 'react';
import Dialog from '../misc/Dialog';
import { Button, ControlLabel, FormControl, FormGroup, Glyphicon, InputGroup } from 'react-bootstrap';
import Message from '../I18N/Message';
import ColorSelector from '../style/ColorSelector';
import Select from 'react-select';
import Portal from '../misc/Portal';
import { getCatalogResources } from '../../api/persistence';
import withTooltip from '../misc/enhancers/tooltip';
import FlexBox from '../layout/FlexBox';

const GlyphiconIndicator = withTooltip(Glyphicon);

const ConfigureView = ({ active, onToggle, data, onSave, user, monitoredState }) => {
    const [setting, setSetting] = useState({ name: null, color: null });
    const [dashboardOptions, setDashboardOptions] = useState([]);

    useEffect(() => {
        setSetting(data);
    }, [data]);

    useEffect(() => {
        if (!active || !user || !monitoredState) return;
        const args = [{ params: { pageSize: 9999999 }, monitoredState }, { user }, ["DASHBOARD"]];
        const catalogResources = getCatalogResources(...args).toPromise();
        catalogResources.then(res => {
            const options = res.resources.map(d => ({
                value: d.id || d.pk,
                label: d.name
            }));
            setDashboardOptions(options);
        });
    }, [active, user, monitoredState]);

    const canAddLayout = !data.dashboard
        ? (data.layoutsData?.md?.length === 0 && data.layoutsData?.xxs?.length === 0)
        : true;

    return active && (
        <Portal>
            <Dialog
                id="mapstore-export-data-results"
                draggable={false}
                style={{ marginTop: '150px' }}
                containerClassName="configure-view-dialog-container"
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
                    <FormGroup className="ms-flex-box _flex _flex-gap-sm _flex-center-v form-group-inline-content _relative">
                        <ControlLabel><Message msgId="dashboard.view.color" /></ControlLabel>
                        <InputGroup className="dashboard-color-picker _relative">
                            <ColorSelector
                                format="rgb"
                                color={setting.color}
                                onChangeColor={(colorVal) => colorVal && setSetting(prev =>({
                                    ...prev,
                                    color: colorVal
                                }))}
                                placement="right"
                            />
                        </InputGroup>
                    </FormGroup>
                    <FormGroup className="ms-flex-box _flex _flex-gap-sm _flex-center-v form-group-inline-content">
                        <ControlLabel>Link existing dashboard</ControlLabel>
                        <FlexBox centerChildrenVertically gap="sm">
                            <FormControl
                                key={setting.linkExistingDashboard}
                                type="checkbox"
                                disabled={!canAddLayout}
                                checked={setting.linkExistingDashboard}
                                onChange={event => {
                                    const { checked } = event.target || {};
                                    setSetting(prev => ({ ...prev, linkExistingDashboard: checked }));
                                }}
                            />
                            {!canAddLayout && (
                                <GlyphiconIndicator
                                    glyph="info-sign"
                                    tooltipId="dashboard.view.cannotAddExistingDashboard"
                                />
                            )}
                        </FlexBox>
                    </FormGroup>
                    {setting.linkExistingDashboard && (
                        <FormGroup>
                            <ControlLabel>Select dashboard</ControlLabel>
                            <Select
                                value={setting.dashboard || ''}
                                options={dashboardOptions}
                                name="dashboard"
                                onChange={selected => setSetting(prev => ({...prev, dashboard: selected?.value }))}
                            />
                        </FormGroup>
                    )}
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
        </Portal>
    );
};

export default ConfigureView;
