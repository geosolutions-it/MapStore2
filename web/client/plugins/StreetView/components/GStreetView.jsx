import { isEqual } from "lodash";
import React, { useRef, useState, useEffect } from "react";
import { googleToMapStoreLocation } from "../googleMapsUtils";
import EmptyStreetView from './EmptyStreetView';


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
        style = {},
        panoramaOptions = {}
    } = props;
    const divRef = useRef();
    const [panorama, setPanorama] = useState();
    // initialize components
    useEffect(() => {
        if (google && location && !panorama) {
            // console.log("New panorama instance created. This is billed"); // this is billed.
            const streetViewPanorama = new google.maps.StreetViewPanorama(
                divRef.current,
                {
                    position,
                    pov,
                    zoom: 1,
                    ...panoramaOptions
                }
            );
            // first panorama initialization.
            if (location.pano) {
                streetViewPanorama.setPano(location.pano);
            }
            setPanorama(streetViewPanorama);
        }
    }, [google, location, panorama, panoramaOptions]);

    // register and unregister events
    const [handles, setHandles] = useState();
    useEffect(() => {
        if (panorama) {
            setHandles(registerEvents(panorama, props));
        }
        return unregisterEvents(panorama, handles);
    }, [panorama]);
    // handle resize events to resize the panorama
    useEffect(() => {
        if (google) {
            google.maps.event.trigger(panorama, 'resize');
        }
    }, [size]);
    // update panorama on panorama change
    useEffect(() => {
        if (panorama && location.pano) {
            panorama.setPano(location.pano);
        }
    }, [location?.pano]);
    return (<>
        <div className={className} style={{display: !panorama ? "block" : "none", ...style}} ><EmptyStreetView /></div>
        <div className={className} style={{display: panorama ? "block" : "none", ...style}} ref={divRef}></div>
    </>);


};

export default GStreetViewPanel;

