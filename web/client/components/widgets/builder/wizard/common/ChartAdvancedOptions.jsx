import React from 'react';
import { isNil } from 'lodash';
import { Col, FormGroup, FormControl, ControlLabel, Glyphicon } from 'react-bootstrap';
import Message from '../../../../I18N/Message';
import Select from 'react-select';
import Slider from 'react-nouislider';
import SwitchPanel from '../../../../misc/switch/SwitchPanel';
import SwitchButton from '../../../../misc/switch/SwitchButton';

function Header({data}) {
    return (<span>
        <span style={{ cursor: "pointer" }}><Message msgId="widgets.advanced.title"/></span>
        <button className="close">
            {data.panel ? <Glyphicon glyph="glyphicon glyphicon-collapse-down" /> : <Glyphicon glyph="glyphicon glyphicon-expand" />}
        </button>
    </span>);
}

export default function ChartAdvancedOptions({
    data,
    onChange = () => {}
}) {
    return (<SwitchPanel id="displayCartesian"
        header={<Header data={data}/>}
        collapsible
        expanded={data.panel}
        onSwitch={(val) => { onChange("panel", val); }}
    >
        <FormGroup controlId="AdvancedOptions">
            <Col componentClass={ControlLabel} sm={6}>
                <Message msgId="widgets.advanced.displayCartesian" />
            </Col>
            <Col sm={6}>
                <SwitchButton
                    checked={data.cartesian || data.cartesian === false ? !data.cartesian : false}
                    onChange={(val) => { onChange("cartesian", !val); }}
                />
            </Col>
            <Col componentClass={"label"} sm={12}>
                <Message msgId="widgets.advanced.yAxis" />
            </Col>
            <Col componentClass={ControlLabel} sm={6}>
                <Message msgId="widgets.advanced.xAxisType" />
            </Col>
            <Col sm={6}>
                <Select
                    value={data.yAxisOpts && data.yAxisOpts.type || '-'}
                    options={[{
                        value: '-',
                        label: 'auto'
                    }, {
                        value: 'linear',
                        label: 'Linear'
                    }, {
                        value: 'category',
                        label: 'Category'
                    }, {
                        value: 'log',
                        label: 'Log'
                    }, {
                        value: 'date',
                        label: 'Date'
                    }]}
                    onChange={(val) => {
                        onChange("yAxisOpts.type", val && val.value);
                    }}
                />
            </Col>
            <Col componentClass={ControlLabel} sm={6}>
                <Message msgId="widgets.advanced.hideLabels" />
            </Col>
            <Col sm={6}>
                <SwitchButton
                    checked={data.yAxis || data.yAxis === false ? !data.yAxis : true}
                    onChange={(val) => { onChange("yAxis", !val); }}
                />
            </Col>
            {/* X Axis */}
            <Col componentClass={"label"} sm={12}>
                <Message msgId="widgets.advanced.xAxis" />
            </Col>
            <Col componentClass={ControlLabel} sm={6}>
                <Message msgId="widgets.advanced.xAxisType" />
            </Col>
            <Col sm={6}>
                <Select
                    value={data?.xAxisOpts?.type ?? '-'}
                    options={[{
                        value: '-',
                        label: 'auto'
                    }, {
                        value: 'linear',
                        label: 'Linear'
                    }, {
                        value: 'category',
                        label: 'Category'
                    }, {
                        value: 'log',
                        label: 'Log'
                    }, {
                        value: 'date',
                        label: 'Date'
                    }]}
                    onChange={(val) => {
                        onChange("xAxisOpts.type", val && val.value);
                    }}
                />
            </Col>
            <Col componentClass={ControlLabel} sm={6}>
                <Message msgId="widgets.advanced.hideLabels" />
            </Col>
            <Col sm={6}>
                <SwitchButton
                    checked={!data?.xAxisOpts?.hide}
                    onChange={(val) => { onChange("xAxisOpts.hide", !val); }}
                />
            </Col>
            <Col componentClass={ControlLabel} sm={6}>
                <Message msgId="widgets.advanced.forceTicks" />
            </Col>
            <Col sm={6}>
                <SwitchButton
                    checked={data?.xAxisOpts?.forceTicks}
                    onChange={(val) => { onChange("xAxisOpts.forceTicks", val); }}
                />
            </Col>
            <Col componentClass={ControlLabel} sm={6}>
                <Message msgId="widgets.advanced.xAxisAngle" />
            </Col>
            <Col sm={6} style={{ display: "flex" }}>
                <SwitchButton
                    checked={data.xAxisAngle === undefined}
                    onChange={(val) => { onChange("xAxisAngle", val ? undefined : 0); }}
                />
                <div style={{ flexGrow: 1, padding: 5 }}>
                    {data.xAxisAngle !== undefined
                        ? <div

                            className="mapstore-slider with-tooltip"
                            onClick={(e) => { e.stopPropagation(); }}
                        ><Slider
                                key="priority"
                                format={{
                                    // this is needed to remove the 2 decimals that this comp adds by default
                                    to: value => `${parseInt(value, 10)}°`,
                                    from: value => Number(value)
                                }}
                                onSlide={(values) => { onChange("xAxisAngle", parseInt(values[0], 10)); }}
                                range={{ min: -90, max: 90 }}
                                start={[!isNil(data.xAxisAngle) ? data.xAxisAngle : 0]}
                                step={15}
                                tooltips={[true]}
                            /></div>
                        : <div style={{ textAlign: "center" }}>Auto</div>}
                </div>
            </Col>

        </FormGroup>
        <FormGroup controlId="yAxisLabel">
            <Col componentClass={"label"} sm={12}>
                <Message msgId="widgets.advanced.legend" />
            </Col>
            <Col componentClass={ControlLabel} sm={6}>
                <Message msgId="widgets.advanced.yAxisLabel" />
            </Col>
            <Col sm={6}>
                <FormControl value={data.yAxisLabel} type="text" onChange={e => onChange("yAxisLabel", e.target.value)} />
            </Col>
        </FormGroup>
    </SwitchPanel>);
}
