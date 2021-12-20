import React from "react";
import PropTypes from "prop-types";

import MapPreviewComp from "../../components/print/MapPreview";

export const MapPreview = ({mapSize, layout, layoutName, resolutions, useFixedScales,
    localizedLayerStylesEnv, mapPreviewOptions, mapType,
    map, capabilities, onRefresh, ...rest}) => {
    const scales = capabilities.scales.slice(0).reverse().map((scale) => parseFloat(scale.value)) || [];
    return (
        <MapPreviewComp
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
            {...rest}
            {...mapPreviewOptions}
        />
    );
};

MapPreview.contextTypes = {
    messages: PropTypes.object
};

