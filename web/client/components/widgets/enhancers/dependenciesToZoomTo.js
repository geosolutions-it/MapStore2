import React, { useEffect, memo } from 'react';

const dependenciesToZoomTo = (WrappedCompoennet)=>{
    function DependenciesToZoomTo(props) {
        let tblWidgetWithExtentObj = props.widgets.find(i=>i?.dependencies?.extentObj);
        const extentObj = tblWidgetWithExtentObj?.dependencies?.extentObj;
        useEffect(()=>{
            if ( extentObj && extentObj ) {
                const hook = props?.hookRegister?.getHook("ZOOM_TO_EXTENT_HOOK");
                if (hook) {
                    // trigger "internal" zoom to extent
                    hook(extentObj.extent, {
                        crs: extentObj.crs, maxZoom: extentObj.maxZoom
                    });
                    // removeextentObj from state
                    props?.updateProperty(tblWidgetWithExtentObj.id, `dependencies.extentObj`, undefined);
                }
            }

        }, [extentObj?.extent?.join(",")]);
        return <WrappedCompoennet { ...props } />;
    }
    return memo(DependenciesToZoomTo);
};
export default dependenciesToZoomTo;
