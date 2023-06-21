/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React, {useState, useMemo, useEffect} from "react";
import {toPng} from 'html-to-image';
// import PropTypes from 'prop-types';
import {ButtonGroup, Col, Glyphicon, Nav, NavItem, Row} from 'react-bootstrap';
import ContainerDimensions from 'react-container-dimensions';
import ReactDOM from 'react-dom';

import Message from "../../components/I18N/Message";
import Button from "../../components/misc/Button";
import tooltip from "../../components/misc/enhancers/tooltip";
import LoadingView from "../../components/misc/LoadingView";
import ResponsivePanel from "../../components/misc/panels/ResponsivePanel";
import Toolbar from "../../components/misc/toolbar/Toolbar";
import Chart from "./Chart";
import Properties from "./Properties";

import {reproject} from "../../utils/CoordinatesUtils";

const NavItemT = tooltip(NavItem);

const ChartData = ({
    chartTitle,
    crsSelected,
    config,
    points,
    projection,
    messages,
    loading,
    maximized,
    toggleMaximize,
    dockStyle,
    onAddMarker,
    onExportCSV,
    onHideMarker
}) => {
    const data = useMemo(() => points ? points.map((point) => ({
        distance: point[0],
        x: point[1],
        y: point[2],
        altitude: point[3],
        incline: point[4]
    })) : [], [points]);
    const [marker, setMarker] = useState([]);

    useEffect(() => {
        if (marker.length) {
            const point = reproject([marker[0], marker[1]], marker[2], 'EPSG:4326');
            onAddMarker({lng: point.y, lat: point.x, projection: 'EPSG:4326'});
        } else {
            onHideMarker();
        }
    }, [marker]);

    const series = [{dataKey: "altitude", color: `#078aa3`}];
    const xAxis = {dataKey: "distance", show: false, showgrid: true};
    const options = {
        xAxisAngle: 0,
        yAxis: true,
        yAxisLabel: messages.longitudinalProfile.elevation,
        legend: false,
        tooltip: false,
        cartesian: true,
        popup: false,
        xAxisOpts: {
            hide: false
        },
        yAxisOpts: {
            tickSuffix: ' m'
        },
        xAxisLabel: messages.longitudinalProfile.distance
    };

    const content = loading
        ? <LoadingView />
        : (
            <><div className="longitudinal-container" onMouseOut={() => marker.length && setMarker([])}>
                {chartTitle}
                <Toolbar
                    btnGroupProps={{
                        className: "chart-toolbar"
                    }}
                    btnDefaultProps={{
                        className: 'no-border',
                        bsSize: 'xs',
                        bsStyle: 'link'
                    }}
                    buttons={[
                        {
                            glyph: maximized ? 'resize-small' : 'resize-full',
                            target: 'icons',
                            tooltipId: `widgets.widget.menu.${maximized ? 'minimize' : 'maximize'}`,
                            tooltipPosition: 'left',
                            visible: true,
                            onClick: () => toggleMaximize()
                        }
                    ]}
                />
                <ContainerDimensions>
                    {({ width, height }) => (
                        <div onMouseOut={() => marker.length && setMarker([])}>
                            <Chart
                                onHover={(info) => {
                                    const idx = info.points[0].pointIndex;
                                    const point = data[idx];
                                    setMarker([ point.x, point.y, projection]);
                                }}
                                {...options}
                                height={maximized ? height - 115 : 400}
                                width={maximized ? width - (dockStyle?.right ?? 0) - (dockStyle?.left ?? 0) : 520 }
                                data={data}
                                series={series}
                                xAxis={xAxis}
                            />
                            <table className="data-used">
                                <tr>
                                    <td><Message msgId="longitudinalProfile.uom" /></td>
                                    <td><Message msgId="longitudinalProfile.uomMeters" /></td>
                                </tr>
                                <tr>
                                    <td><Message msgId="longitudinalProfile.CRS" /></td>
                                    <td>{crsSelected}</td>
                                </tr>
                                <tr>
                                    <td><Message msgId="longitudinalProfile.source" /></td>
                                    <td>{config.referential}</td>
                                </tr>
                            </table>

                        </div>
                    )}
                </ContainerDimensions>
            </div>
            {data.length ? (
                <ButtonGroup className="downloadButtons">
                    <Button bsStyle="primary" onClick={() => onExportCSV({data, title: 'Test'})} className="export">
                        <Glyphicon glyph="download"/> <Message msgId="longitudinalProfile.downloadCSV" />
                    </Button>
                    <Button
                        className="export"
                        bsStyle="primary"
                        onClick={() => {
                            const toolbar = document.querySelector('.chart-toolbar');
                            const chartToolbar = document.querySelector('.modebar-container');
                            toolbar.className = toolbar.className + " hide";
                            chartToolbar.className = chartToolbar.className + " hide";

                            toPng(document.querySelector('.longitudinal-container'))
                                .then(function(dataUrl) {
                                    let link = document.createElement('a');
                                    link.download = 'my-image-name.png';
                                    link.href = dataUrl;
                                    link.click();
                                    toolbar.className = toolbar.className.replace(" hide", "");
                                    chartToolbar.className = chartToolbar.className.replace(" hide", "");
                                })
                                .catch(function(error) {
                                    console.error('oops, something went wrong!', error);
                                    alert(error);
                                });

                        }}>
                        <Glyphicon glyph="download"/> <Message msgId="longitudinalProfile.downloadPNG" />
                    </Button>
                </ButtonGroup>
            ) : null}
            </>
        );

    if (maximized) {
        return ReactDOM.createPortal(
            content,
            document.getElementById('dock-chart-portal'));
    }
    return content;
};
const Information = ({infos, messages, loading}) => {
    const infoConfig = [
        {
            glyph: '1-layer',
            prop: 'referentiel'
        },
        {
            glyph: 'line',
            prop: 'distance',
            round: true,
            suffix: ' m'
        },
        {
            glyph: 'chevron-up',
            prop: 'denivelepositif',
            suffix: ' m'
        },
        {
            glyph: 'chevron-down',
            prop: 'denivelenegatif',
            suffix: ' m'
        },
        {
            glyph: 'cog',
            prop: 'processedpoints',
            suffix: ` ${messages.longitudinalProfile.points ?? 'points'}`
        }
    ];

    return loading ? <LoadingView /> : (<div className="longitudinal-container">
        {
            infoConfig.map((conf) => (
                <div className="stats-entry" key={conf.prop}>
                    <Glyphicon glyph={conf.glyph} />
                    <span className="stats-value">
                        {
                            [
                                ...[conf.round ? [Math.round(infos[conf.prop])] : [infos[conf.prop]]],
                                ...[conf.suffix ? [conf.suffix] : []]
                            ]
                        }
                    </span>
                </div>))
        }
    </div>);
};

const tabs = [
    {
        id: 'chart',
        titleId: 'longitudinalProfile.chart',
        tooltipId: 'longitudinalProfile.chart',
        glyph: 'stats',
        visible: true,
        Component: ChartData
    },
    {
        id: 'info',
        titleId: 'longitudinalProfile.infos',
        tooltipId: 'longitudinalProfile.infos',
        glyph: 'info-sign',
        visible: true,
        Component: Information
    },
    {
        id: 'props',
        titleId: 'longitudinalProfile.preferences',
        tooltipId: 'longitudinalProfile.preferences',
        glyph: 'cog',
        visible: true,
        Component: Properties
    }
];

const Dock = ({
    chartTitle,
    crsSelected,
    config,
    dockStyle,
    infos,
    loading,
    maximized,
    messages,
    onCloseDock,
    points,
    projection,
    showDock,
    toggleMaximize,
    onAddMarker,
    onExportCSV,
    onHideMarker
}) => {

    const [activeTab, onSetTab] = useState('chart');

    return showDock ? (
        <ResponsivePanel
            dock
            containerId="longitudinal-profile-container"
            containerClassName={maximized ? "maximized" : null}
            containerStyle={dockStyle}
            bsStyle="primary"
            position="right"
            title={<Message key="title" msgId="longitudinalProfile.title"/>}
            glyph={<div className="longitudinal-profile" />}
            size={550}
            open={showDock}
            onClose={onCloseDock}
            style={dockStyle}
            siblings={
                <div id="dock-chart-portal"
                    className={maximized ? "visible" : ""}
                    style={{
                        transform: `translateX(${(dockStyle?.right ?? 0)}px)`,
                        height: dockStyle?.height
                    }} />
            }
            header={[
                <Row key="longitudinal-dock-navbar" className="ms-row-tab">
                    <Col xs={12}>
                        <Nav bsStyle="tabs" activeKey={activeTab} justified>
                            {tabs.map(tab =>
                                (<NavItemT
                                    key={'ms-tab-settings' + tab.id}
                                    tooltip={<Message msgId={tab.tooltipId}/> }
                                    eventKey={tab.id}
                                    onClick={() => {
                                        onSetTab(tab.id);
                                        if (tab.onClick) { tab.onClick(); }
                                    }}>
                                    <Glyphicon glyph={tab.glyph}/>
                                </NavItemT>)
                            )}
                        </Nav>
                    </Col>
                </Row>
            ]}
        >
            {activeTab === "chart" ?
                <ChartData
                    key="ms-tab-settings-body-chart"
                    chartTitle={chartTitle}
                    config={config}
                    crsSelected={crsSelected}
                    messages={messages}
                    points={points}
                    projection={projection}
                    toggleMaximize={toggleMaximize}
                    onAddMarker={onAddMarker}
                    onExportCSV={onExportCSV}
                    onHideMarker={onHideMarker}
                /> : null}
            {activeTab === "info" ?
                <Information
                    key="ms-tab-settings-body-info"
                    infos={infos}
                    messages={messages}
                    loading={loading}
                /> : null}
            {activeTab === "props" ? <Properties/> : null}
        </ResponsivePanel>
    ) : null;
};

// Dock.propTypes = {
//     size: PropTypes.number
// };

export default Dock;
