/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React, {useState, useMemo, useEffect} from "react";
import {toPng} from 'html-to-image';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import pdfMake from 'pdfmake';
import PropTypes from 'prop-types';
import { Row, Col, Nav, InputGroup, FormGroup, NavItem, ControlLabel, Button as ButtonRB, Glyphicon } from 'react-bootstrap';
import ContainerDimensions from 'react-container-dimensions';
import Select from 'react-select';
import { saveAs } from 'file-saver';
import DXFWriter from 'dxf-writer';


import Message from "../../components/I18N/Message";
import tooltip from "../../components/misc/enhancers/tooltip";
import LoadingView from "../../components/misc/LoadingView";
import ResponsivePanel from "../../components/misc/panels/ResponsivePanel";
import Toolbar from "../../components/misc/toolbar/Toolbar";
import Chart from "../../components/charts/WidgetChart";
import { reprojectGeoJson } from '../../utils/CoordinatesUtils';
import { getMessageById } from '../../utils/LocaleUtils';
import { DEFAULT_PANEL_WIDTH } from '../../utils/LayoutUtils';
import Portal from "../../components/misc/Portal";

const NavItemT = tooltip(NavItem);
const Button = tooltip(ButtonRB);

/**
 * Component used to show the chart
 * @param {Object} props properties of the component
 * @param {string} props.chartTitle
 * @param {Object} props.config some info related to the longitudinal profile plugin
 * @param {Object} props.dockStyle the style of the dock
 * @param {boolean} props.loading flag used to manage the loading time of the process
 * @param {boolean} props.maximized flag used to manage the maximized status of the chart
 * @param {Object} props.messages the locale messages
 * @param {Object[]} props.points the points of the long profile containing geom and other data
 * @param {string} props.projection crs used to
 * @param {Function} props.onToggleMaximize used to maximize the chart
 * @param {Function} props.onAddMarker used to show a marker in the map
 * @param {Function} props.onError used to display an error notification
 * @param {Function} props.onExportCSV used to export data in CSV
 * @param {Function} props.onHideMarker used to hide the marker
 */
const ChartData = ({
    chartTitle,
    config,
    dockStyle,
    defaultDownloadFormat = "json",
    downloadFormat = ["dxf", "json", "png", "pdf", "csv"],
    loading,
    maximized,
    messages,
    points,
    projection,
    onToggleMaximize,
    onAddMarker,
    onError,
    onExportCSV,
    onHideMarker
}) => {

    const generateChartImageUrl = () => {
        const toolbar = document.querySelector('.chart-toolbar');
        const chartToolbar = document.querySelector('.modebar-container');
        toolbar.className = toolbar.className + " hide";
        chartToolbar.className = chartToolbar.className + " hide";

        return toPng(document.querySelector('.longitudinal-tool-container'))
            .then(function(dataUrl) {
                toolbar.className = toolbar.className.replace(" hide", "");
                chartToolbar.className = chartToolbar.className.replace(" hide", "");
                return dataUrl;
            });
    };
    const [marker, setMarker] = useState({});
    const [isTainted, setIsTainted] = useState(false);
    const [selectedDownloadFormat, setSelectedDownloadFormat] = useState(defaultDownloadFormat);

    const downloadOptions = {
        "dxf": {
            onDownload: (data) => {
                try {
                    let d = new DXFWriter();
                    d.setUnits('meters');
                    d.addLayer('profile', DXFWriter.ACI.LAYER, 'CONTINUOUS')
                        .setActiveLayer('profile')
                        .drawPolyline3d(data.map(point => ([point.x, point.y, point.altitude])));
                    const file = d.toDxfString();
                    saveAs(new Blob([file], {type: 'image/x-dxf;charset=utf-8' }), `${chartTitle}.dxf`);
                } catch (e) {
                    console.error(e);
                }
            },
            label: "longitudinalProfile.downloadDXF"
        },
        "json": {
            onDownload: (data) => {
                try {
                    let features = data.map((point) => {
                        return reprojectGeoJson({
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: [point.x, point.y]
                            },
                            properties: {
                                ...(omit(point, ["x", "y"]))
                            }
                        }, projection);
                    });

                    const geoJSON = {
                        type: "FeatureCollection",
                        features: features
                    };
                    saveAs(new Blob([JSON.stringify(geoJSON)], {type: 'application/json;charset=utf-8' }), `${chartTitle}.json`);
                } catch (e) {
                    console.error(e);
                }
            },
            label: "longitudinalProfile.downloadGeoJSON"
        },
        "png": {
            onDownload: () => {
                generateChartImageUrl()
                    .then(function(dataUrlChart) {
                        let link = document.createElement('a');
                        link.download = `${chartTitle}.png`;
                        link.href = dataUrlChart;
                        link.click();
                    })
                    .catch(function(error) {
                        console.error('oops, something went wrong!', error);
                        onError('longitudinalProfile.errors.cannotDownloadPNG');
                    });
            },
            label: "longitudinalProfile.downloadPNG"
        },
        "pdf": {
            onDownload: () => {
                toPng(document.querySelector('.ol-unselectable canvas'))
                    .then(function(dataUrlMap) {
                        generateChartImageUrl()
                            .then((dataUrlChart) => {
                                try {
                                    pdfMake.createPdf({
                                        content: [
                                            {
                                                image: "chart",
                                                width: 450
                                            },
                                            {
                                                image: "map",
                                                width: 555,
                                                margin: [0, 60]
                                            }
                                        ],
                                        pageMargins: [ 20, 40, 20, 40 ],
                                        images: {
                                            chart: dataUrlChart,
                                            map: dataUrlMap
                                        }
                                    }).download(`${chartTitle}.pdf`);
                                } catch (err) {
                                    console.error('oops, something went wrong!', err);
                                    onError('longitudinalProfile.errors.cannotDownloadPDF');

                                }

                            });

                    })
                    .catch(function(error) {
                        console.error('oops, something went wrong!', error);
                        onError('longitudinalProfile.errors.cannotDownloadPDF');
                        setIsTainted(true);
                    });
            },
            label: "longitudinalProfile.downloadPDF"
        },
        "csv": {
            onDownload: (data) => {
                onExportCSV({data, title: `${chartTitle}`});
            },
            label: "longitudinalProfile.downloadCSV"
        }
    };

    const data = useMemo(() => points ? points.map((point) => ({
        distance: point.totalDistanceToThisPoint,
        x: point.x,
        y: point.y,
        altitude: point.altitude,
        incline: point.slope
    })) : [], [points]);


    useEffect(() => {
        if (!isEmpty(marker)) {
            onAddMarker({lng: marker.x, lat: marker.y, projection: 'EPSG:4326'});
        } else {
            onHideMarker();
        }
    }, [marker]);

    const options = {
        traces: [{
            id: 'longitudinal-profile-trace',
            type: 'line',
            style: {
                line: {
                    color: `#078aa3`
                }
            },
            options: {
                groupByAttributes: 'distance',
                aggregationAttribute: 'altitude'
            }
        }],
        xAxisOpts: [{
            id: 0,
            angle: 0,
            hide: false,
            title: messages.longitudinalProfile.distance,
            fontSize: 11
        }],
        yAxisOpts: [{
            id: 0,
            title: messages.longitudinalProfile.elevation,
            tickSuffix: ' m',
            hide: false,
            fontSize: 11
        }],
        legend: false,
        cartesian: true
    };


    const content = loading
        ? <LoadingView />
        : (
            <><div className={`longitudinal-tool-container ${maximized ? "maximized" : ""}`} onMouseOut={() => marker.length && setMarker({})}>
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
                            onClick: () => onToggleMaximize()
                        }
                    ]}
                />
                <ContainerDimensions>
                    {({ width, height }) => (
                        <div onMouseOut={() => !isEmpty(marker) && setMarker({})} style={{ width }}>
                            <Chart
                                onHover={(info) => {
                                    const idx = info.points[0].pointIndex;
                                    const point = data[idx];
                                    setMarker({x: point.x, y: point.y, projection});
                                }}
                                {...options}
                                height={maximized ? height - 115 : 400}
                                width={maximized ? width - (dockStyle?.right ?? 0) - (dockStyle?.left ?? 0) : width }
                                // using multiple traces data is array of arrays of data
                                data={[data]}
                            />
                            {config.referential && projection ? <table className="data-used">
                                <tr>
                                    <td><Message msgId="longitudinalProfile.uom" /></td>
                                    <td><Message msgId="longitudinalProfile.uomMeters" /></td>
                                </tr>
                                <tr>
                                    <td><Message msgId="longitudinalProfile.CRS" /></td>
                                    <td>{projection}</td>
                                </tr>
                                <tr>
                                    <td><Message msgId="longitudinalProfile.source" /></td>
                                    <td>{config.referential}</td>
                                </tr>
                            </table> : null}

                        </div>
                    )}
                </ContainerDimensions>
            </div>
            {data.length ? (
                <FormGroup className="form-group-flex" style={{padding: "0px 15px"}}>
                    <ControlLabel><Message msgId="layerdownload.format" /></ControlLabel>
                    <InputGroup style={{ zIndex: 0 }}>
                        <Select
                            value={selectedDownloadFormat}
                            options={downloadFormat.map(key => ({
                                value: key,
                                label: getMessageById(messages, downloadOptions[key].label),
                                disabled: key === "pdf" && isTainted
                            }))}
                            onChange={(val) => {
                                setSelectedDownloadFormat(val?.value);
                            }}
                        />
                        <InputGroup.Button>
                            <Button
                                bsStyle="primary"
                                onClick={() => {
                                    downloadOptions?.[selectedDownloadFormat]?.onDownload(data);
                                }}
                                className="export"
                            >
                                <Glyphicon glyph="download"/> <Message msgId="longitudinalProfile.export" />
                            </Button>
                        </InputGroup.Button>
                    </InputGroup>
                </FormGroup>
            ) : null}

            </>
        );

    if (maximized) {
        return (
            <Portal>
                <div
                    id="dock-chart-portal"
                    className={maximized ? "visible" : ""}
                    style={{
                        height: dockStyle?.height || '100vh'
                    }}
                >
                    {content}
                </div>
            </Portal>);
    }
    return content;
};
const Information = ({
    infos,
    loading,
    messages
}) => {
    const infoConfig = [
        {
            glyph: '1-layer',
            prop: 'layer',
            label: <Message msgId="longitudinalProfile.info.layer" />
        },
        {
            glyph: 'line',
            prop: 'totalDistance',
            round: true,
            suffix: ' m',
            label: <Message msgId="longitudinalProfile.info.line" />
        },
        {
            glyph: 'chevron-up',
            prop: 'altitudePositive',
            suffix: ' m',
            label: <Message msgId="longitudinalProfile.info.up" />
        },
        {
            glyph: 'chevron-down',
            prop: 'altitudeNegative',
            suffix: ' m',
            label: <Message msgId="longitudinalProfile.info.down" />
        },
        {
            glyph: 'cog',
            prop: 'processedPoints',
            suffix: messages.longitudinalProfile.points ?? <Message msgId="longitudinalProfile.info.points" />,
            label: <Message msgId="longitudinalProfile.info.totalPoints" />
        }
    ];

    return loading ? <LoadingView /> : (<div className={"longitudinal-tool-container"}>
        {
            !isEmpty(infos) ? infoConfig.map((conf) => (
                <div className="stats-entry" key={conf.prop}>
                    <Glyphicon glyph={conf.glyph} />
                    <span className="stats-value">
                        <span className="info-label">
                            {[
                                ...[conf.label ? [conf.label] : []]
                            ]}
                        </span>
                        <div className="info-value">
                            {[
                                ...[conf.round ? [Math.round(infos[conf.prop])] : [infos[conf.prop]]],
                                ...[conf.suffix ? [conf.suffix] : []]
                            ]}
                        </div>
                    </span>
                </div>)) : <Message msgId="longitudinalProfile.info.noInfos"/>
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
    }
];

const Dock = ({
    chartTitle,
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
    onAddMarker,
    onError,
    onExportCSV,
    onHideMarker,
    onToggleMaximize
}) => {

    const [activeTab, onSetTab] = useState('chart');

    return showDock ? (
        <ResponsivePanel
            dock
            containerId="longitudinal-profile-tool-container"
            containerClassName={maximized ? " maximized" : null}
            containerStyle={dockStyle}
            bsStyle="primary"
            position="right"
            title={<Message key="title" msgId="longitudinalProfile.title"/>}
            glyph="1-line"
            size={DEFAULT_PANEL_WIDTH}
            open={showDock}
            onClose={onCloseDock}
            style={dockStyle}
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
                    maximized={maximized}
                    messages={messages}
                    points={points}
                    projection={projection}
                    onAddMarker={onAddMarker}
                    onError={onError}
                    onExportCSV={onExportCSV}
                    onHideMarker={onHideMarker}
                    onToggleMaximize={onToggleMaximize}
                /> : null}
            {activeTab === "info" ?
                <Information
                    key="ms-tab-settings-body-info"
                    infos={infos}
                    messages={messages}
                    loading={loading}
                /> : null}
        </ResponsivePanel>
    ) : null;
};

export default Dock;

ChartData.propTypes = {
    chartTitle: PropTypes.string,
    config: PropTypes.object,
    dockStyle: PropTypes.object,
    loading: PropTypes.bool,
    maximized: PropTypes.bool,
    messages: PropTypes.object,
    points: PropTypes.array,
    projection: PropTypes.string,
    onAddMarker: PropTypes.func,
    onError: PropTypes.func,
    onExportCSV: PropTypes.func,
    onHideMarker: PropTypes.func,
    onToggleMaximize: PropTypes.func
};

Dock.propTypes = {
    chartTitle: PropTypes.string,
    config: PropTypes.object,
    dockStyle: PropTypes.object,
    infos: PropTypes.object,
    loading: PropTypes.bool,
    maximized: PropTypes.bool,
    messages: PropTypes.object,
    points: PropTypes.array,
    projection: PropTypes.string,
    showDock: PropTypes.bool,
    onAddMarker: PropTypes.func,
    onCloseDock: PropTypes.func,
    onError: PropTypes.func,
    onExportCSV: PropTypes.func,
    onHideMarker: PropTypes.func,
    onToggleMaximize: PropTypes.func
};

Information.propTypes = {
    infos: PropTypes.object,
    loading: PropTypes.bool,
    messages: PropTypes.object
};
