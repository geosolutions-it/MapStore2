import Map from "./Map";
import Layer from "./Layer";
import Feature from "./Feature";
import Locate from "./Locate";
import MeasurementSupport from "./MeasurementSupport";
import Overview from "./Overview";
import ScaleBar from "./ScaleBar";
import DrawSupport from "./DrawSupport";
import HighlightFeatureSupport from "./HighlightFeatureSupport";
import SelectionSupport from "./SelectionSupport";
import PopupSupport from "./PopupSupport";
import SnapshotSupport from "./SnapshotSupport";

export default {
    Map,
    Layer,
    Feature,
    tools: {
        measurement: MeasurementSupport,
        locate: Locate,
        overview: Overview,
        scalebar: ScaleBar,
        draw: DrawSupport,
        highlight: HighlightFeatureSupport,
        selection: SelectionSupport,
        popup: PopupSupport,
        snapshot: SnapshotSupport
    }
};
