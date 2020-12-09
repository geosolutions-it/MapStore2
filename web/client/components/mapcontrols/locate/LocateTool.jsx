import {useEffect, useRef} from 'react';
import useMapTool from "../../../map/hooks/use-map-tool";
import { set } from '../../../utils/ImmutableUtils';

const defaultOpt = {
    follow: true, // follow with zoom and pan the user's location
    remainActive: true,
    metric: true,
    stopFollowingOnDrag: true,
    keepCurrentZoomLevel: false,
    locateOptions: {
        maximumAge: 2000,
        enableHighAccuracy: false,
        timeout: 10000,
        maxZoom: 18
    }
};

const LocateTool = ({map, mapType, status, messages, cfg, changeLocateState, onLocateError}) => {
    const locateInstance = useRef();
    const [loaded, Impl, error] = useMapTool(mapType, 'locate');
    useEffect(() => {
        if (error) {
            onLocateError(error);
        }
    }, [error]);
    const onStateChange = (state) => {
        if (status !== state) {
            changeLocateState(state);
        }
    };

    const onLocationError = (err) => {
        onLocateError(err.message);
        changeLocateState("DISABLED");
    };

    useEffect(() => {
        if (loaded) {
            const options = cfg.maxZoom ? set("locateOptions.maxZoom", cfg.maxZoom, defaultOpt) : defaultOpt;
            locateInstance.current = new Impl();
            locateInstance.current.start({
                map, options, messages, status, onStateChange, onLocationError
            });
        }
        return () => {
            locateInstance.current?.clear();
        };
    }, [loaded]);
    useEffect(() => {
        locateInstance.current?.update({status, messages});
    }, [status, messages, loaded]);

    return null;
};

export default LocateTool;

