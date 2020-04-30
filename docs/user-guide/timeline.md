# Timeline
**********

The Timeline is a [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) tool for managing layers with a time dimension.
It makes possible to observe the layers' evolution over time, to inspect the layer configuration at a specific time instant (or in a time range) and to view different layer configurations time by time dynamically through animations.<br>

When a layer with a time dimension is added to the map the Timeline panel becomes automatically visible and allows the user to set the time of the layer.

<img src="../img/timeline/timeline-base.jpg" class="ms-docimage"/>

## Timeline histogram

The Histogram panel opens through the **Expand time slider** button <img src="../img/button/timeline-expand-button.jpg" class="ms-docbutton"/>.

<img src="../img/timeline/timeline-histogram.jpg" class="ms-docimage"/>

On the Histogram panel are show:

* A list of layers with the time dimension present on map. It is possible hidden those list with the **Hide layers names** button <img src="../img/button/timeline-layers-list-button.jpg" class="ms-docbutton"/>

* The relative histogram that shows the layer' data for each time in which it is defined. In order to manage the panel the user can zoom in/out on the histogram, scroll the time axis and drag the current time cursor along it

!!! Note
    The highlighted layer is the one whose histogram is displayed on the panel.

## Set a Time Range

In order to configure a specific instant in the layer the user can insert a data and a time in the panel, as follows:

<img src="../img/timeline/timeline-current-time.jpg" class="ms-docimage"/>

!!! Note
    The current time cursor changes its position according to the selected date and viceversa: when the user drag that cursor along the time axis the date/time cells will update their values.

In order to observe the layers in a finite fixed time interval the user can set a time range through the **Time range** button <img src="../img/button/timeline-range-button.jpg" class="ms-docbutton"/>. A date/time control panel opens to set the range limits either by directly entering values in those cells or by dragging the limits cursors along the histogram time axis, as follows:

<img src="../img/timeline/timeline-current-time-range.jpg" class="ms-docimage"/>

## Show times available on map

It is possible to show, on the timeline, only the times actually visible on the current map viewport through the **Map Sync Button** <img src="../img/button/timeline-sync-button.jpg" class="ms-docbutton"/>, as follows:

<img src="../img/timeline/timeline-sync-example.jpg" class="ms-docimage"/>

## Animations

The user is allowed to navigate in the timeline of the layer selected through the following buttons: 

<img src="../img/timeline/timeline-animation-buttons.jpg" class="ms-docimage"/>

In order to start the animation the user can click on **Play** button <img src="../img/button/timeline-play-button.jpg" class="ms-docbutton"/>. Once the animation is starts, the layer configuration changes on the map and the time progress on the histogram. Following the sequence of the step, the cursor will shift each time to the next step in a certain time interval, the *frame duration*.
<br>
Through the **Stop** button <img src="../img/button/timeline-stop-button.jpg" class="ms-docbutton"/> the user can stop the animation and the current time cursor remains in the last position reached.
<br>
The **Step backward** button <img src="../img/button/timeline-step-backward-button.jpg" class="ms-docbutton"/> and the **Step forward** button <img src="../img/button/timeline-step-forward-button.jpg" class="ms-docbutton"/> allow the user to statically change the current time, so by clicking on one of them the cursor changes its position (to the previous or the next step) on the histogram and the date/time values of the control cells will be update accordingly.
<br>
The user can pause the animation through the **Pause** button <img src="../img/button/timeline-pause-button.jpg" class="ms-docbutton"/>, as follows:

<img src="../img/timeline/timeline-animation.gif" class="ms-docimage"  style="max-width:700px;" />


!!! Note
    The user can also specify a *time range*. During the animation, the whole range will be shifted step by step along the time axis and in each step the layer configuration will be consider the total amount of data in that range.
    <img src="../img/timeline/timeline-animation-range.gif" class="ms-docimage"  style="max-width:700px;"/>

### Animation Settings

The animation behavior can be customized through the **Settings** button <img src="../img/button/timeline-playback-settings-button.jpg" class="ms-docbutton"/> allowing the user to setting the *Timeline* and the *Playback*. 

<img src="../img/timeline/timeline-animation-settings.jpg" class="ms-docimage"  style="max-width:500px;" />

By default, the **Snap to guide layer** is enabled allows to force the time cursor to snap to the selected layer's data. The user can disable *Snap to guide level* to select the time cursor he prefers through the section **Animation passage**, for example, the process could be similar to the following: 

<img src="../img/timeline/animation-passage.jpg" class="ms-docimage"/>

The user can set the second between one frame and another through the **Frame Duration** and enable the **Follow the animation** to visualize the animation also on the histogram.

<img src="../img/timeline/frame-duration.jpg" class="ms-docimage"/>

Enabling the  **Animation Range** the user can bound the animation execution to a fixed time interval, the *green range*. The *green range* can be defined both dragging the *play/stop cursors* directly on the histogram or filling the *date/time control cells* of the extra panel displayed, as follows:

<img src="../img/timeline/timeline-animation-green-range.gif" class="ms-docimage"/>

In order to set this filter the user can:

* Zoom the histogram until it fits the animation's *green range* time extension through the  **Zoom to the current playback range** button <img src="../img/button/timeline-zoom-playback-range.jpg" class="ms-docbutton"/>

* Extend the animation's *green range* until it fits the current view range of the histogram through the **Set to current view range** button <img src="../img/button/timeline-zoom-current-view-range.jpg" class="ms-docbutton"/>


