import AttributeFilter from "./AttributeFilter";
import SpatialFilter from "./SpatialFilter";
import CrossLayerFilter from "./CrossLayerFilter";

const standardItems = {
    start: [],
    attributes: [
        {
            id: "attributeFilter",
            plugin: AttributeFilter,
            cfg: {},
            position: 1
        }
    ],
    afterAttributes: [],
    spatial: [
        {
            id: "spatialFilter",
            plugin: SpatialFilter,
            cfg: {},
            position: 1
        }
    ],
    afterSpatial: [],
    layers: [
        {
            id: "crossLayer",
            plugin: CrossLayerFilter,
            cfg: {},
            position: 1
        }
    ],
    end: []
};

export default standardItems;
