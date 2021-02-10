import {useEffect, useRef} from 'react';
import useMapTool from "../../../map/hooks/useMapTool";

const LocateTool = ({map, mapType, status, messages, maxZoom, changeLocateState, onLocateError, rateControl}) => {
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

    function getOptions() {
        return {
            locateOptions: {
                ...(maxZoom !== undefined && { maxZoom }),
                ...(rateControl !== undefined && { rateControl })

            }
        };
    }

    useEffect(() => {
        if (loaded) {
            const options = getOptions();
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
        const options = getOptions();
        locateInstance.current?.update({ status, messages, options });
    }, [status, messages, loaded, maxZoom]);

    return null;
};

export default LocateTool;
