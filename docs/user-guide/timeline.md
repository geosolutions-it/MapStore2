# Timeline
************************

The Timeline is an useful tool for managing layers with a time dimension.
It makes possible to observe the layers' evolution over time, to inspect the layer configuration at a specific time instant (or in a time range) and to view different layer configurations time by time dynamically through animations.<br>

!!! warning
    Timeline actually works only with **WMTS-Multidim extension** (WMS time in capabilities is not fully supported). From now on, the layers that the Timeline can manage will be addressed as ***time layers***.

When you load ***time layers*** the Timeline panel becomes automatically visible and allows you to take a look at the main functionalities.

<img src="../img/timeline-base.jpg" />

Widgets and Timeline cannot be expanded on the same map at the same time. See [this section](widgets.md#widgets-tray) to learn more about this.

Timeline histogram
------------------

The Timeline panel can be expanded through the **Expand time slider** button <img src="../img/timeline-expand-button.jpg" style="max-width:24px;"/>. By clicking it another section appears under the main panel.

<img src="../img/timeline-histogram.jpg" />

The ***time layers***' list, on the left, can be shown/hidden by clicking the **Show/Hide layers names** button <img src="../img/timeline-layers-list-button.jpg" style="max-width:24px;"/>.
Once a layer is loaded, a new row is added in the list and its relative histogram appears in the right side.
<br>
The histogram shows the layers' data for each time in which they are defined. You can zoom on the histogram, scroll the time axis and drag the current time cursor along it.


Handling the time
-----------------

In the left side of the main panel there are some control cells in which you can set the date/time of interest and watch the layers' configurations at that specific instant.

<img src="../img/timeline-current-time.jpg" />

The current time cursor changes its position according to the selected date and viceversa: when you drag that cursor along the time axis the date/time cells will update their values.

!!! Note
    The highlighted layer in the ***time layers***' list drives the time management, from now on it will be addressed as ***guide layer*** (See the [Animation Settings](#animation-settings) > ***Timeline Settings*** > **Snap to guide layer** option).
    When you move the current time cursor to a time value for which no data are available the cursor is snapped to the closest time with data.

If you want to observe the layers in a finite fixed time interval you can set a *time range* by clicking the **Enable time range** button <img src="../img/timeline-range-button.jpg" style="max-width:24px;"/>. This will opens an extra panel with date/time control cells so you can set the range limits either by directly entering values in those cells or by dragging the limits cursors along the histogram time axis.

<img src="../img/timeline-current-time-range.jpg" />


Animations
----------

Animations are based on ordered sequences of steps, by default each step represents a configuration of the selected layer (***guide layer***).
<br>
The right side of the main panel contains the buttons responsible for managing the animations.

<img src="../img/timeline-animation-buttons.jpg" />

The following list describes the functions performed by each button.

* **Step backward** <img src="../img/timeline-step-backward-button.jpg" style="max-width:24px;"/> : return to the previous step
* **Play** <img src="../img/timeline-play-button.jpg" style="max-width:24px;"/> : play the animation
* **Stop** <img src="../img/timeline-stop-button.jpg" style="max-width:24px;"/> : stop the animation
* **Step forward** <img src="../img/timeline-step-forward-button.jpg" style="max-width:24px;"/> : go ahead to the next step
* **Settings** <img src="../img/timeline-playback-settings-button.jpg" style="max-width:24px;"/> : open the [Animation Settings](#animation-settings) panel

Clicking the **Play** button, by default, the current time cursor reach the initial time of the ***guide layer*** and the animation starts. You will see the layers' configurations changes on the map and the time progress on the histogram. Following the step sequence, the cursor will shift each time to the next step in a certain time interval, the *frame duration*.
<br>
The **Stop** button obviously stops the animation and the current time cursor remains in the last position reached.
<br>
The **Step backward** or the **Step forward** buttons allow you to statically change the current time, so by clicking on one of them the cursor changes its position (to the previous or the next step) on the histogram and the date/time values of the control cells will be update accordingly.
<br>
You can pause the animation with the **Pause** button <img src="../img/timeline-pause-button.jpg" style="max-width:24px;"/>.

<img src="../img/timeline-animation.gif" />

You can also specify a *time range*. During the animation, the whole range will be shifted step by step along the time axis and in each step the layers' configurations will be consider the total amount of data in that range.

<img src="../img/timeline-animation-range.gif" />


### Animation Settings

The animation behavior can be customized through the **Settings**. If you click on the button <img src="../img/timeline-playback-settings-button.jpg" style="max-width:24px;"/> a panel with two different sections appears.

<img src="../img/timeline-animation-settings.jpg" />

***Timeline Settings***

* **Snap to guide layer**: this option is active by default. It forces the time cursor to snap to the selected layer's data. Disabling this option the **Animation Step** selection in the ***Playback Settings*** section becomes available.

***Playback Settings***

* **Frame Duration**: it indicates how fast the time cursor switch to the next step in the steps sequence
* **Animation Step**: it defines the step width and so all the steps positions along the time axis. By default this option is disabled and the step sequence is defined by the ***guide layer***'s data. If activated, a fixed time unit (in terms of seconds, minutes, hours, days, months or years) can be defined as the step width and the whole steps sequence will be reconfigured.
* **Animation Range**: if activated, it basically bounds the animation execution to a fixed time interval, the *green range*. The *green range* can be defined both dragging the *play/stop cursors* directly on the histogram or filling the *date/time control cells* of the extra panel displayed.
    <br>Other settings:
    * **Zoom to the current playback range** <img src="../img/timeline-zoom-playback-range.jpg" style="max-width:24px;"/> : zoom the histogram until it fits the animation's *green range* time extension.
    * **Set to current view range** <img src="../img/timeline-zoom-current-view-range.jpg" style="max-width:24px;"/> : extend the animation's *green range* until it fits the current view range of the histogram.
    * **Fit to selected layer's range** <img src="../img/timeline-fit-layer-range.jpg" style="max-width:24px;"/> : extend the animation's *green range* until it fits the ***guide layer*** time extension

    <br><img src="../img/timeline-animation-green-range.gif" />

* **Follow the animation**: if activated the histogram is always centered on the time cursor during the animation.
