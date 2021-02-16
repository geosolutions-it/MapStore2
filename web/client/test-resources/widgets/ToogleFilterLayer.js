export const layerFilter = {
    "layerFilter": {
        "searchUrl": null,
        "featureTypeConfigUrl": null,
        "showGeneratedFilter": false,
        "attributePanelExpanded": true,
        "spatialPanelExpanded": true,
        "crossLayerExpanded": true,
        "showDetailsPanel": false,
        "groupLevels": 5,
        "useMapProjection": false,
        "toolbarEnabled": true,
        "groupFields": [
            {
                "id": 1,
                "logic": "OR",
                "index": 0
            }
        ],
        "maxFeaturesWPS": 5,
        "filterFields": [
            {
                "rowId": 1613414722261,
                "groupId": 1,
                "attribute": "STATE_NAME",
                "operator": "=",
                "value": "Arizona",
                "type": "string",
                "fieldOptions": {
                    "valuesCount": 0,
                    "currentPage": 1
                },
                "exception": null,
                "loading": false,
                "openAutocompleteMenu": false,
                "options": {
                    "STATE_NAME": []
                }
            }
        ],
        "spatialField": {
            "method": null,
            "operation": "INTERSECTS",
            "geometry": null,
            "attribute": "the_geom"
        },
        "simpleFilterFields": [],
        "crossLayerFilter": null,
        "autocompleteEnabled": true,
        "disabled": false
    }
};

export const emptyLayerFilter = {

}