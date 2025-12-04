# Isochrone Tool

*******************

The **Isochrone** tool allows the user to compute and visualize isochrones and isodistances in [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) using different supported routing providers, such as [GraphHopper Isochrones API](https://docs.graphhopper.com/openapi/isochrones).

!!! note
    The **Isochrone** plugin is not enabled by default. However, it can be configured within [application contexts](application-context.md#configure-plugins) using the desired provider.

By clicking the **Isochrone** <img src="../img/button/isochrone-button.jpg" class="ms-docbutton"/> button available in the [Side Toolbar](mapstore-toolbars.md#side-toolbar), the tool is activated, allowing the user to select a point and display the computed isochrones or isodistances on the map.

<img src="../img/isochrone/isochrone-panel.jpg" class="ms-docimage" width="500px"/>

The user can select the starting point in two ways:

* Typing the address into the text box
* Selecting a point on the map using the <img src="../img/button/coordinates-button.jpg" class="ms-docbutton"/> button

<video class="ms-docimage" controls><source src="../img/isochrone/add-isochrone-point.mp4"/></video>

The *Isochrone* can be further customized using the following options:

<img src="../img/isochrone/isochrone-options.jpg" class="ms-docimage" width="500px"/>

* Choose the **Travel Mode**, either *walking* or *driving*
* Choose the `Distance` in the dropdown menu for *Isodistance* or `Time` for *Isochrone* as the basis for the **Range**
* Choose the **Direction** between `Departure` or `Arrival`
* Define the number of intervals within the chosen *Range* using the **Buckets** option
* Select the **Colors** for the *Buckets* using the *Color Picker*

Once all options are set, the user can click the <img src="../img/button/run-blue-button.jpg" class="ms-docbutton"/> button to visualize the computed isochrones or isodistances at the bottom of the panel and on the map.

<video class="ms-docimage" controls><source src="../img/isochrone/isochrone-result.mp4"/></video>

For each result, the latitude and longitude of the point and the corresponding distance/time are highlighted. The user can also:

* Enable/disable layer visibility by using the checkbox on the right side <img src="../img/button/check-box.jpg" class="ms-docbutton"/>

* Tune the result transparency in map by scrolling the opacity slider

* **Use run parameters** via the dropdown menu accessed through the <img src="../img/button/three-dots-button.jpg" class="ms-docbutton"/> button. This option allows the user to reuse the results of a previous run to clone the parameters for a new run

* **Export as GeoJSON** using the same dropdown menu

* **Add as layer** using the same dropdown menu. This option allows the user to add the selected run result as a vector layer to the TOC

* **Delete result** using the same dropdown menu
