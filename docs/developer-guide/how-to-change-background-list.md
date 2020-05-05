# How to change the background list

In order to edit the background list of the new map configuration you have to:

- open **new.json** file
- edit the **layers** property

You can add a new background layer by adding an entry in the layers list (array).

An important thing is that the layer group must be **"background"** and only one *background* layer must have visibility set to `true`

[Here](../maps-configuration/#layers-options) you can find more info on how a layer can be configured.

```
"layers": [
    ...
    ...
	{
	    "type": "osm",
		"title": "Open Street Map",
		"name": "mapnik",
        "source": "osm",
		"group": "background", <--- see here
        "visibility": true     <--- only this one is visible by default
	},
    {
        "type": "tileprovider",
        "title": "NASAGIBS Night 2012",
        "provider": "NASAGIBS.ViirsEarthAtNight2012",
        "name": "Night2012",
        "source": "nasagibs",
        "group": "background",  <--- see here
        "visibility": false     <--- see here
      }
]
```


This is the current configuration of new.json for mapstore framework
