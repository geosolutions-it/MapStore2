import React from "react";
import PropTypes from "prop-types";

import MapPreviewComp from "../../components/print/MapPreview";
import Message from "../../components/I18N/Message";

export const MapPreview = ({mapSize, layout, layoutName, resolutions, useFixedScales,
    localizedLayerStylesEnv, mapPreviewOptions, mapType,
    map, capabilities, onRefresh, validation = {valid: true}, ...rest}) => {
    const scales = capabilities.scales.slice(0).reverse().map((scale) => parseFloat(scale.value)) || [];
    return validation.valid ? (
        <MapPreviewComp
            {...rest}
            map={map}
            layers={map?.layers ?? []}
            scales={scales}
            width={mapSize.width} height={mapSize.height} mapType={mapType}
            onMapRefresh={onRefresh}
            layout={layoutName}
            layoutSize={layout && layout.map || {width: 10, height: 10}}
            resolutions={resolutions}
            useFixedScales={useFixedScales}
            env={localizedLayerStylesEnv}
            {...mapPreviewOptions}
        />
    ) : <div id="map-preview-disabled-message"><Message msgId="print.disabledpreview"/></div>;
};

MapPreview.contextTypes = {
    messages: PropTypes.object
};

