# Custom search service
MapStore2 Searchbox uses [OpenStreetMap Nominatim](https://wiki.openstreetmap.org/wiki/Nominatim) service but you can set it up to use your own WFS service.  
The results will be fetched from every service you set, plus OSM Nominatim, and displayed in the order you specified.

## How to use

    We assume you already have a WFS service set up.
    For example it can be on the same server you are using to display your data, so you can make the data easily searchable.

1. Open the Burger Menu (top right corner) and select "Settings"
1. In the Settings popup you should see a big button "Configure Search Settings", click it
1. You will see a list of services, click "Add"
1. Here you have to input the info on how the search will be performed
1. Input a name for the new service, it will not be displayed as it is for your own reference
1. Input the url to your WFS service. For example, if you are using GeoServer on the same host you can just omit the hostname: `/geoserver/wfs`
1. Input the layername where to search
1. Input a comma-separated list of attribute names where to search
1. Hit Next
1. Here you have to define how the results will be displayed
1. Input the title template, to show a feature property (must be a string) the syntax is `${properties.nameoftheproperty}`.  
  For example you can create complex templates like: `Woo, I found a ${properties.buildingname} with ${properties.animaltypes} in it!`, but you probably want to just have a simple string like `${properties.title}`
1. Input the description template, it will displayed underneath the title in a different font, the syntax is the same as the title
1. Input the priority of this service, the results from all the services will be ordered by the service priority. Higher priority results will be displayed on top of the list (Priority 5 is higher than priority 1)
1. In the next page there are some optional settings
  - Order By: Input the feature attribute to order the results of this specific service
  - Max Features: Input the maximum number of features to fetch when searching on this service
1. Save

Once saved, the service will be queried by the search box.
