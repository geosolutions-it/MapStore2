/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React, { useEffect } from "react";

import Dock from "./Dock";
import HelpInfo from "./HelpInfo";
import Import from "./Import";
import SettingsPanel from "./SettingsPanel";

const Main = ({
    additionalCRS,
    chartTitle,
    crsSelectedDXF,
    config,
    currentLocale,
    dataSourceMode,
    distance,
    dockStyle,
    filterAllowedCRS,
    helpStyle,
    infos,
    initialized,
    isSupportedLayer,
    loading,
    maximized,
    messages,
    pluginCfg,
    points,
    projection,
    referential,
    selectedLayer,
    showDock,
    onToggleMaximize,
    onAddMarker,
    onChangeCRS,
    onChangeDistance,
    onChangeGeometry,
    onChangeReferential,
    onCloseDock,
    onError,
    onExportCSV,
    onHideMarker,
    onSetup,
    onTearDown,
    onToggleSourceMode,
    onWarning
}) => {
    useEffect(() => {
        onSetup(pluginCfg?.config);
        return () => {
            onTearDown();
        };
    }, []);

    return initialized ? [
        <HelpInfo
            key="help"
            style={helpStyle}
            dataSourceMode={dataSourceMode}
            messages={messages}
            selectedLayer={selectedLayer}
            isSupportedLayer={isSupportedLayer}
            currentLocale={currentLocale}
        />,
        <Dock
            chartTitle={chartTitle}
            config={config}
            distance={distance}
            dockStyle={dockStyle}
            infos={infos}
            key="profile-data"
            loading={loading}
            isSupportedLayer={isSupportedLayer}
            maximized={maximized}
            messages={messages}
            points={points}
            projection={projection}
            referential={referential}
            showDock={showDock}
            onAddMarker={onAddMarker}
            onChangeDistance={onChangeDistance}
            onChangeReferential={onChangeReferential}
            onCloseDock={() => {
                onCloseDock();
                onTearDown();
            }}
            onError={onError}
            onExportCSV={onExportCSV}
            onHideMarker={onHideMarker}
            onToggleMaximize={onToggleMaximize}
        />,
        <SettingsPanel/>,
        (dataSourceMode === 'import' ?
            <Import
                additionalCRS={additionalCRS}
                crsSelectedDXF={crsSelectedDXF}
                filterAllowedCRS={filterAllowedCRS}
                loading={loading}
                onChangeCRS={onChangeCRS}
                onChangeGeometry={onChangeGeometry}
                onClose={() => onToggleSourceMode("import")}
                onWarning={onWarning}
            /> : null)
    ] : false;
};

export default Main;
