import AttributeFilter from "./AttributeFilter";
import SpatialFilter from "./SpatialFilter";
import CrossLayerFilter from "./CrossLayerFilter";
import SpatialFilterMap from './SpatialFilterMap';

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
    end: [],
    map: [{
        id: "spatialFilterMap",
        plugin: SpatialFilterMap,
        cfg: {
            targetContainerSelector: "#page-dashboard > .ms2-border-layout-body"
        },
        position: 1
    }]
};

export default standardItems;
