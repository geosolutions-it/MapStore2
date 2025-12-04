# Itinerary Tool

*******************

The **Itinerary** tool allows the user to compute and visualize routes in [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) using different supported routing providers, such as [GraphHopper](https://www.graphhopper.com/).

!!! note
    The **Itinerary** plugin is not enabled by default. However, it can be configured within [application contexts](application-context.md#configure-plugins) using the desired provider.

By clicking the **Itinerary** <img src="../img/button/itinerary-button.jpg" class="ms-docbutton"/> button available in the [Side Toolbar](mapstore-toolbars.md#side-toolbar), the tool is activated, allowing the user to select destination points and compute the route, which is then displayed on the map

<img src="../img/itinerary/itinerary-panel.jpg" class="ms-docimage" width="500px"/>

The user can select the starting point and the destination in two ways:

* Typing the address into the text box
* Selecting a point on the map using the <img src="../img/button/coordinates-button.jpg" class="ms-docbutton"/> button

<video class="ms-docimage" controls><source src="../img/itinerary/create.itinerary.mp4"/></video>

The user can also add an additional destination using the <img src="../img/button/++++.jpg" class="ms-docbutton"/> button.

<video class="ms-docimage" controls><source src="../img/itinerary/add-destination.mp4"/></video>

The itinerary can be further customized using the following options:

<img src="../img/itinerary/itinerary-options.jpg" class="ms-docimage" width="500px"/>

* Choose the **Travel Mode**, either *walking* or *driving*
* Enable **Optimize Route** to reorder the available routes from fastest to slowest
* Select one or more options to avoid: *Motorways & Highways*, *Trunk Roads & Major Arterials*, *Ferry Crossings*, *Tunnels & Underground Passages*, and/or *Bridges & Elevated Roads*

Once at least two points are defined, the available routes are listed at the bottom of the panel and displayed on the map.

<img src="../img/itinerary/route-itinerary.jpg" class="ms-docimage" width="500px"/>

For each listed route, the main path and the estimated travel time are highlighted. The user can also:

* View the full itinerary using the <img src="../img/button/collapse-all-child-nodes.jpg" class="ms-docbutton"/> button

* **Export as GeoJSON** using the dropdown menu available through the <img src="../img/button/three-dots-button.jpg" class="ms-docbutton"/> button

* **Add as layer** using the same dropdown menu accessible from the <img src="../img/button/three-dots-button.jpg" class="ms-docbutton"/> button
