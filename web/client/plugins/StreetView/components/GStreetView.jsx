import { isEqual } from "lodash";
import React, { useRef, useState, useEffect } from "react";
import { googleToMapStoreLocation } from "../googleMapsUtils";

const registerEvents = (panorama, {location, setLocation, setPov}) => {
    const handles = [];
    handles.push(panorama.addListener("position_changed", () => {
        const newLocation = googleToMapStoreLocation(panorama.getLocation());
        if (!isEqual(location?.latLng, newLocation?.latLng)) {
            setLocation(newLocation);
        }
    }));
    handles.push(panorama.addListener("pov_changed", () => {
        const {heading, pitch} = panorama.getPov();
        setPov({heading, pitch});
    }));
    return handles;
};
const unregisterEvents = (panorama, handles = []) => {
    if (panorama) {
        handles.forEach(h => panorama.removeListener(h));
    }
};

const GStreetViewPanel = (props) => {
    const {
        size,
        google,
        position,
        location,
        pov,
        className = "google-street-view",
        style = {}
    } = props;
    const divRef = useRef();
    const [panorama, setPanorama] = useState();
    // initialize components
    useEffect(() => {
        if (google) {
            setPanorama(new google.maps.StreetViewPanorama(
                divRef.current,
                {
                    position,
                    pov,
                    zoom: 1
                }
            ));
        }
    }, [google]);

    // register and unregister events
    const [handles, setHandles] = useState();
    useEffect(() => {
        if (panorama) {
            setHandles(registerEvents(panorama, props));
        }
        return unregisterEvents(panorama, handles);
    }, [panorama]);

    useEffect(() => {
        if (google) {
            google.maps.event.trigger(panorama, 'resize');
        }
    }, [size]);
    useEffect(() => {
        if (panorama && location.pano) {
            panorama.setPano(location.pano);
        }
    }, [location?.pano]);
    return (
        <div className={className} style={style} ref={divRef}></div>
    );

};

export default GStreetViewPanel;

