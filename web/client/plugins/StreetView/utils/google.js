export const googleToMapStoreLocation = (location) => ({
    pano: location?.pano,
    shortDescription: location?.shortDescription,
    description: location?.description,
    latLng: {
        lat: location?.latLng?.lat(),
        lng: location?.latLng?.lng()
    }
});
