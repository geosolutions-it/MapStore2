# Timeline
**********

The Timeline is a [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) tool for managing layers with a time dimension.
It makes possible to observe the layers' evolution over time, to inspect the layer configuration at a specific time instant (or in a time range) and to view different layer configurations time by time dynamically through animations.<br>

!!! Warning
    Timeline actually works only with [WMTS-Multidim extension](https://docs.geoserver.org/stable/en/user/community/wmts-multidimensional/index.html) (WMS time in capabilities is not fully supported) and at least **GeoServer 2.14.5**. Anyway to support all the functionality you need **GeoServer 2.15.2**.
    From now on, the layers that the Timeline can manage will be addressed as *time layers*.


When a layer with a time dimension is added to the map, the Timeline panel becomes automatically visible and it allows the user to browse the layer over time.

<img src="../img/timeline/timeline-base.jpg" class="ms-docimage"/>

!!! Note
    Widgets and Timeline cannot be expanded on the same map at the same time. See [this section](widgets.md#widgets-tray) to learn more about this. 

## Timeline histogram

The Histogram panel opens through the **Expand time slider** button <img src="../img/button/timeline-expand-button.jpg" class="ms-docbutton"/>.

<img src="../img/timeline/timeline-histogram.jpg" class="ms-docimage"/>

In the Histogram panel some of the most relevant elements are the following ones:

* A list of layers present in map with the time dimension available. It is possible to hide this list with the **Hide layers names** button <img src="../img/button/timeline-layers-list-button.jpg" class="ms-docbutton"/>

* The relative histogram that shows the layer' data for each time in which it is defined. In order to manage the panel the user can zoom in/out on the histogram, scroll the time axis and drag the current time cursor along it

!!! Note
    The highlighted layer is the one whose histogram is displayed on the panel.

!!! Note
    The highlighted layer in the *time layers* ' list drives the time management, from now on it will be addressed as *guide layer* (See in the [Animation Settings](#animation-settings) > **Timeline Settings** >  **Snap to guide layer** option ).

## Set a Time Range

In order to see a layer in a specific time instant the user can insert a data and a time in the panel, as follows:

<img src="../img/timeline/timeline-current-time.jpg" class="ms-docimage"/>

!!! Note
    The current time cursor changes its position according to the selected date and viceversa: when the user drag that cursor along the time axis the date/time cells will update their values.

In order to observe the layers in a finite fixed time interval the user can set a time range through the **Time range** button <img src="../img/button/timeline-range-button.jpg" class="ms-docbutton"/>. A date/time control panel opens to set the range limits either by directly entering values in those cells or by dragging the limits cursors along the histogram time axis, as follows:

<img src="../img/timeline/timeline-current-time-range.jpg" class="ms-docimage"/>

## Show times available on map

Sometimes you might be interested to show in the timeline histogram only the times instants currently visible on the map, especially when you are exploring a big data set. This feature can be enabled by clicking the **Map Sync** button <img src="../img/button/timeline-sync-button.jpg" class="ms-docbutton"/> . When this tool is active the timeline will show only the times of the features available in the current map viewport.

<img src="../img/timeline/timeline-sync-example.jpg" class="ms-docimage"/>

!!! Note
    Map Sync feature need at least GeoServer 2.15.2

## Animations

The user can start a time animation by using the timeline tool through the following buttons (by default the animation of layers in map is based on time values related the **guide layer**, see the [Animation Settings](#animation-settings) section > **Timeline Settings** > **Snap to guide layer** option):

<img src="../img/timeline/timeline-animation-buttons.jpg" class="ms-docimage"/>

In order to start the animation the user can click on **Play** button <img src="../img/button/timeline-play-button.jpg" class="ms-docbutton"/>.  Once the animation is started, the temporal layers in map are updated accordingly and the user can see the animation progress also in the timeline histogram. Following the sequence of steps, the cursor will shift each time to the next step in a certain time interval, the *frame duration*.
<br>
Through the **Stop** button <img src="../img/button/timeline-stop-button.jpg" class="ms-docbutton"/> the user can stop the animation and the current time cursor remains in the last position reached.
<br>
The **Step backward** button <img src="../img/button/timeline-step-backward-button.jpg" class="ms-docbutton"/> and the **Step forward** button <img src="../img/button/timeline-step-forward-button.jpg" class="ms-docbutton"/> allow the user to change the current time. Therefore, by clicking on one of them, the cursor changes its position (to the previous or the next step) on the histogram, the date/time values of the control cells will be updated accordingly and the layers in map are updated too.
<br>
The user can pause the animation through the **Pause** button <img src="../img/button/timeline-pause-button.jpg" class="ms-docbutton"/>, as follows:

<img src="../img/timeline/timeline-animation.gif" class="ms-docimage"  style="max-width:700px;" />


!!! Note
    The user can also specify a *time range*. During the animation, the whole range will be shifted step by step along the time axis and, in each step, the layers in map will show data corresponding to that range of time.
    <img src="../img/timeline/timeline-animation-range.gif" class="ms-docimage"  style="max-width:700px;"/>

### Animation Settings

The animation behavior can be customized through the **Settings** button <img src="../img/button/timeline-playback-settings-button.jpg" class="ms-docbutton"/>. It allows the user to tune the *Timeline* and the *Playback* options. 

<img src="../img/timeline/timeline-animation-settings.jpg" class="ms-docimage"  style="max-width:500px;" />

By default, the **Snap to guide layer** is enabled. It allows to force the time cursor to snap to the selected layer's data. The user can disable *Snap to guide level* to select the preferred time step through the **Animation Step** option. For example, the process could be similar to the following one: 

<img src="../img/timeline/animation-passage.jpg" class="ms-docimage"/>

The user can set the number of second between one animation frame and another through the **Frame Duration** and enable the **Follow the animation** to visualize the animation process also inside the histogram: the histogram will automatically move to follow the animation.

<img src="../img/timeline/frame-duration.jpg" class="ms-docimage"/>

Enabling the  **Animation Range** the user can bound the animation execution to a fixed time interval, the *green range*. The *green range* can be defined both dragging the *play/stop cursors* directly on the histogram or filling the *date/time control cells* of the extra panel displayed, as follows:

<img src="../img/timeline/timeline-animation-green-range.gif" class="ms-docimage"/>

In order to properly set the Animation Ranger, some controls are available to help the user:

* Zoom the histogram until it fits the animation's *green range* time extension through the  **Zoom to the current playback range** button <img src="../img/button/timeline-zoom-playback-range.jpg" class="ms-docbutton"/>

* Extend the animation's *green range* until it fits the current view range of the histogram through the **Set to current view range** button <img src="../img/button/timeline-zoom-current-view-range.jpg" class="ms-docbutton"/>

* Extend the animation's green range until it fits the guide layer time extension through the **Fit to selected layer's range** button <img src="../img/button/timeline-fit-layer-range.jpg" class="ms-docbutton"/>
