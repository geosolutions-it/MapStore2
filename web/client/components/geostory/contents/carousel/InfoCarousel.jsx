import React from 'react';
import Message from "../../../../components/I18N/HTML";

const renderInfo = (type) => {
    let className = ''; let msgId = '';
    if (type === "addMap") {
        className = 'ms-carousel-map-info';
        msgId = 'geostory.carouselAddMapInfo';
    } else if (type === "addMarker") {
        className = 'ms-carousel-marker-info';
        msgId = 'geostory.carouselPlaceMarkerInfo';
    } else {
        className = 'ms-carousel-add-info';
        msgId = 'geostory.carouselAddItemInfo';
    }
    return <div className={className}><Message msgId={msgId}/></div>;
};

export default ({type}) => renderInfo(type);
