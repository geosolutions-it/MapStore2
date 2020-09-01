import React from 'react';
import LocationListItemEditable from './LocationListItemEditable';

const LocationList = (props) => {
    let mapLocations = (<span className="ms-geostory-map-locations-item ">No Locations added</span>);
    if (props.locationFeatures.length > 0) {
        mapLocations = props.locationFeatures.map(location => (
            <LocationListItemEditable
                currentMapLocation={props.currentMapLocation}
                onChangeMap={props.onChangeMap}
                onChange={props.onChange}
                onDeleteFromMap={props.onDeleteFromMap}
                key={location.id}
                locationId={location.id}
                locationName={location.properties.locationName} />
        ));
    }

    return <div className="ms-geostory-map-locations">{mapLocations}</div>;
};

export default LocationList;
