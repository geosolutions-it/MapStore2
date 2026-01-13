# Layer Settings

****************

In this section, you will learn how to manage the layer settings in terms of general information, display mode, style and feature Info. <br>
Since a layer is added to the [TOC](toc.md#table-of-contents) it is possible to access its settings with the dedicated button <img src="../img/button/properties.jpg" class="ms-docbutton"/> that appears selecting a layer:

<img src="../img/layer-settings/layer-settings.jpg" class="ms-docimage"  style="max-width:300px;"/>

The layer settings panel is composed of four sections:

<img src="../img/layer-settings/panel_sections.jpg" class="ms-docimage"  style="max-width:500px;"/>

* General information

* Display

* Fields

* Style

* Feature Info

!!!warning
    For WMTS layers the Fields, the Style and the Feature Info sections are not implemented. Moreover the Display section is limited to the Transparency layer parameter.

## General information

By default, as soon as the user opens the layer settings panel the General information section appears:

<img src="../img/layer-settings/layer_general_settings.jpg" class="ms-docimage"  style="max-width:500px;"/>

In this page it is possible to:

* Change the **Title**

* Set the translation of the layer title by opening the **Localize Text** popup through the <img src="../img/button/localize_button.jpg" class="ms-docbutton"/> button. This way the language of the title changes according to the  current language setting in [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/)

<video class="ms-docimage" controls><source src="../img/layer-settings/lacalize-layer-title.mp4"/></video>

* Take a look at the **Name** of the layer

* Edit the layer's **Description**

* Set the layer **Group**

* Configure the **Tooltip** that appears moving the cursor over the layer's item in TOC. In this case the user can decide that the *Title*, the *Description*, both or nothing will be displayed. Moreover you can set the *Placement* of the tooltip, choosing between *Top*, *Right* or *Bottom*:

<img src="../img/layer-settings/tooltip_options.jpg" class="ms-docimage"  style="max-width:400px;"/>

Setting a tooltip that shows the Title and the Description on the Right, for example, it can be similar to the following:

<img src="../img/layer-settings/custom_tooltip.jpg" class="ms-docimage"/>

* **Disable editing on attribute table**. This option allows to disable [the editing function](attributes-table.md#editing-and-removing-existing-features) in Attribute Table. In case a layer has been set as read-only through this option, the <img src="../img/button/edit_button.jpg" class="ms-docbutton"/> icon will not be available in the Attribute Table and in the[Identify](navigation-toolbar.md#identify-tool) panel for the selected layer. This option is unchecked by default and it can be controlled only by users with editing permissions on the map.

## Display

Through the second section of the layer settings panel it is possible to change the display settings:

<img src="../img/layer-settings/display.jpg" class="ms-docimage"  style="max-width:450px;"/>

In particular, the user is allowed to:

* Set the image format: choosing between `png`, `png8`, `jpeg`, `vnd.jpeg-png`, `vnd.jpeg-png8` and `gif`

!!! note
    The list of available format is the same of the related [catalog source](catalog.md#catalog-types). Therefore, for WMS services, the updated list of formats supported by the WMS server is used.

* Set the size of layer tiles: choosing between `256` or `512`

!!!Warning
    The *Format* and *Layer tile size* options are available only for the layers added from CSW and WMS catalog sources.

* Set the opacity value of the layer (in %)

* Enable/disable the **Visibility limits** to display the layer only within certain scale limits. The user is allowed to request the `MinScaleDenominator` and  `MaxScaleDenominator` value present on the *WMS GetCapabilities* of the layer though the <img src="../img/button/sync_to_server.jpg" class="ms-docbutton"/> button or set the *Max value* and the *Min value* and select the *Limits type* choosing between `Scale` or `Resolution`.

* Enable/disable the transparency for that layer

* Decide to display the image as a single tile or as multiple tiles

* Enable/disable the localized style. If enabled allows to include the MapStore's locale in each **GetMap**, **GetLegendGraphic** and **GetFeatureInfo** requests to the server, as explained in the [WMS Catalog Settings](catalog.md#wmswmts-catalog)

* Enable/disable the *Force proxy* layer option. If enabled, forces the application to check the source and applies proxy if needed.

* Enable/disable the use of the layer cached tiles. If checked, the *Tiled=true* URL parameter will be added to the WMS request to [use tiles cached with GeoWebCache](https://docs.geoserver.org/latest/en/user/geowebcache/using.html#direct-integration-with-geoserver-wms).
When the *Use cache options* is enabled, more controls are enabled so that it is possible for the user to check if the current map settings match any GWC ***standard*** Gridset defined on the server side for the given WMS layer (**Check available tile grids information** <img src="../img/button/update_button.jpg" class="ms-docbutton"/>). At the same time, it is also possible to change the setting strategy (based on the WMTS service response) to strictly adapt layer settings on the client side to the ones matching any remote ***custom*** Gridset defined for the current map settings (**Use remote custom tile grids** <img src="../img/button/tile_grid.jpg" class="ms-docbutton"/> button).

!!!note

    When the **Check available tile grids information** <img src="../img/button/update_button.jpg" class="ms-docbutton"/> button is clicked, an info icon <img src="../img/button/info_ion.jpg" class="ms-docbutton"/> appears to inform the user if the current map settings (Projection, Tile size, Image Format) are properly matching the ones of the given Tile Grids defined on the server side configuration for the layer.

    <img src="../img/layer-settings/default_gridset_info.jpg" class="ms-docimage"  style="max-width:300px;"/>

    When the **Use remote custom tile grids** button is enabled, it turns green <img src="../img/button/tile_grid_green.jpg" class="ms-docbutton"/> and a WMTS request is performed by MapStore to fetch precise information to more finely adapt the layer settings on the client side to the ones of the matching Tile Grid defined on the server. The scope of the info icon <img src="../img/button/info_ion.jpg" class="ms-docbutton"/> in this case is still the same but through this strategy MapStore provides a finer tuning of the client side layer settings to better fit the tile grid defined on the server side and so provide better accuracy of cache matching.

    <img src="../img/layer-settings/green_info.jpg" class="ms-docimage"  style="max-width:300px;"/>

    In case the current map/layer settings (Projection, Tile size, Image Format) do not match any of the server-side defined Tile Grids for the given layer the Info panel shows a warning message to indicate the reason for the mismatch so that it is possible for the user to change the needed setting accordingly (for example changing the [map projection](footer.md#crs-selector) or selecting a different [tile size and/or tile format](layer-settings.md#display)).

    <img src="../img/layer-settings/warning_info.jpg" class="ms-docimage"  style="max-width:300px;"/>

!!!warning
    The Gridset compatibility check made by MapStore whose result is shown by the Info tooltip, is usually quite reliable but should be considered anyway only to provide general matching indicators aimed at highlighting possible compatibility issues between the current layer/map settings and the remote Tile Grid. Due to the cache tolerance considered on the server side by GWC, it might even happen in some cases that the settings available on the client side don't HIT the tile cache even if all the checks listed are successful. At the same time, when the standard gridset is used, gridsets check may fail even if all WMS request are effectively HITTING the cache (e.g. because the WMTS reports a list of origins).

* Enable/disable the **Interactive legend**. If this option is enabled, legend entries with an associated valid filter are displayed as toggleable items inside the TOC, a user can click on these legend items to filter the content of the layer. An example can be the following one:

<video class="ms-docimage"  style="max-width:700px;" controls><source src="../img/layer-settings/interactive-legend.mp4"></video>

!!! Note
    Any type of [Filter](filtering-layers.md#filter-types) applied to the layer remains active when the legend filter is activated on the same layer.

* Enable/disable the **Dynamic legend**. If this option is enable, legend will be filtered based on the map viewport and layer [Filter](filtering-layers.md#filter-types).An example can be the following one:

<video class="ms-docimage"  style="max-width:700px;" controls><source src="../img/layer-settings/dynamic-legend.mp4"></video>

* Set the layer *Legend* with custom *Width* and *Height* options. Both of these field values if greater than the default legend's size of 12, then the custom values gets applied on the legend width and height display property

* A preview of the legend is shown with the applied custom values from Legend fields above.

!!!Warning
    The *Format* and *Layer tile size* options are available only for the layers added from CSW and WMS catalog sources.

### Display tab for other layer types

#### 3D Tiles layer

On the *Display* tab, only the following options are available for a **3D Tile** layer:

<img src="../img/layer-settings/display-3d-tiles.jpg" class="ms-docimage"  style="max-width:450px;"/>

* The **Visibility limits** to display the layer only within certain scale limits, as reported above.

* The **Imagery Layers Overlay** to drape imagery layers, such as `WMS`, `TMS`, or `WMTS`, on top of `3D Tiles` and rendering them sequentially in the order defined in the TOC. An example can be the following one:

<img src="../img/layer-settings/imagery-layers.jpg" class="ms-docimage"style="max-width:600px;"/>

* The **Height Offset** above the ground.

* The **Format** choosing between `3D Model` and `Point Cloud`. The *Point Cloud* option allows the user to customize the `Maximum Attenuation` of the points based on the distance from the current viewpoint and customize the `Lighting strength` and the `Lighting radius` to improve visualization of the point cloud.

<img src="../img/layer-settings/display-point-cloud.jpg" class="ms-docimage"  style="max-width:450px;"/>

#### COG layer

On the *Display* tab, only the following options are available for a **COG** layer:

<img src="../img/layer-settings/display-cog.jpg" class="ms-docimage"  style="max-width:450px;"/>

* The **Opacity** to change the layer opacity.

* The **Visibility limits** to display the layer only within certain scale limits, as reported above.

#### IFC layer

On the *Display* tab, only the following options are available for a **IFC** layer:

<img src="../img/layer-settings/display-ifc.jpg" class="ms-docimage"  style="max-width:450px;"/>

* The **Visibility limits** to display the layer only within certain scale limits, as reported above.

* The **Center Longitude** to change the center longitude of the layer (`DD`).

* The **Center Latitude** to change the center latitude of the layer (`DD`).

* The **Height** to set the layer height from the ground (`m`).

* The **Heading** to set the layer heading (`DD`).

## Fields

From this section of the *Settings* panel, [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows the user to add aliases to layer fields.

<img src="../img/layer-settings/fields_settings.jpg" class="ms-docimage"  style="max-width:500px;"/>

The panel shows the fields (feature attributes) of the layer. For each field the following are specified:

* the **Name** of the field
* the **Alias** of the field, which by default is empty
* the **Type** of field

The *Name* and the *Type* of the field cannot be modified, while the alias can be specified by the user.

Using the **Localize** <img src="../img/button/localize_button.jpg" class="ms-docbutton"/> button, a popup opens so that it is possible to configure the alias of the field as well as its translations.

<img src="../img/layer-settings/localize-popup.jpg" class="ms-docimage"  style="max-width:500px;"/>

Setting the aliases, it is possible to configure the desired attribute names to be shown in all supported [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) tools for this functionality and manage related translations accordingly.

The aliases configured in Layers Settings will be used for the following supported [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) tools:

* [Attribute Table](attributes-table.md)

<video class="ms-docimage" controls><source src="../img/layer-settings/lacalize-attribute-table.mp4"/></video>

* [Filter layer](filtering-layers.md#layer-filter)

<video class="ms-docimage" controls><source src="../img/layer-settings/localize-filter.mp4"/></video>

* [Identify](navigation-toolbar.md#identify-tool) (only `properties` output format)

<video class="ms-docimage" controls><source src="../img/layer-settings/localize-identify.mp4"/></video>

* [Visual Style Editor](layer-settings.md#visual-editor-style)

<video class="ms-docimage" controls><source src="../img/layer-settings/localize-style.mp4"/></video>

* [Charts Widget](widgets.md#chart) and [Table Widget](widgets.md#table)

<video class="ms-docimage" controls><source src="../img/layer-settings/localize-widget.mp4"/></video>

Through the toolbar available on the top-center of the *Fields* panel, it is possible to:

<img src="../img/layer-settings/fields_toolbar.jpg" class="ms-docimage"  style="max-width:500px;"/>

* **Reload** the list of fields from the data source using the <img src="../img/button/reload_button.jpg" class="ms-docbutton"/> button

* **Clear all customization** in the UI by using the <img src="../img/button/clear_button.jpg" class="ms-docbutton"/> button

## Style

The third section, dedicated to the layer style, displays like the following:

<img src="../img/layer-settings/ls-style.jpg" class="ms-docimage" style="max-width:450px"/>

In this case the user is allowed to:

* Search through the available layer styles and select the desired one

* Create a new style

* Edit an existing style

* Delete an existing style

!!!note
    By the default [service security rules](https://docs.geoserver.org/stable/en/user/security/service.html#service-security) the GeoServer's REST APIs are available only for the GeoServer administrators, so a basic authentication form will appears in MapStore to enter the *Admin* credentials. Without Admin rights, the editing capabilities on styles are not available and only the list of available styles will appear to allow the user to select one of them to the layer.

    Take a look at the [User Integration with GeoServer](../developer-guide/integrations/users/geoserver.md#geoserver-integrations) section of [Developer Guide](../developer-guide/index.md#quick-setup-and-run) in order to understand how to configure the way MapStore and GeoServer share users, groups and roles. If the users integration between GeoServer and MapStore is configured, the editing functionalities of the styles will be available according to the role of the authenticated user in MapStore in a more transparent way.

### Create a new style

It is possible to create a new style with a click on the <img src="../img/button/style_editor_new_style_button.jpg" class="ms-docbutton"/> button. At this stage the user can choose between different types of template from which the customization will start:

* *CSS - Cascading Style Sheet* (a language used for describing the presentation of a document written in a markup language like the HTML)

* *SLD - Styled Layer Descriptor* (an XML schema specified by the [Open Geospatial Consortium OGC](http://www.opengeospatial.org/) for describing the appearance of map layers)

<img src="../img/layer-settings/style_editor_add_style_template.jpg" class="ms-docimage" style="max-width:500px;">

!!!note
    The availability of the style formats depends, firstly, from the [GeoServer](http://geoserver.org/). [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/), by default, will add all the supported format that the server provides. To edit or create styles using the CSS format the [CSS extension](https://docs.geoserver.org/latest/en/user/styling/css/install.html) must be installed in GeoServer

Once the new style is chosen, with a click on the <img src="../img/button/style_editor_add_style_button.jpg" class="ms-docbutton"/> button the following window opens:

<img src="../img/layer-settings/style_editor_new_style_name.jpg" class="ms-docimage"  style="max-width:500px;">

Here the user can set the *Title* and the *Abstract* (optional), and through the **Save** button the new style will be automatically added to the styles list.

### Edit an existing style

Existing styles can be edited clicking on the <img src="../img/button/style_editor_edit_button.jpg" class="ms-docbutton"/> button. The page that opens allows the user to customize the style in the related format:

<video class="ms-docimage"  style="max-width:700px;" controls><source src="../img/layer-settings/style_editor_edit_new_style.mp4"></video>

The editor is easy to approach thanks also to the following functions:

* The *sintax control* highlights any possible error with a red underline (if error are detected an icon with a red exclamation point <img src="../img/button/style_editor_error_icon.jpg" class="ms-docbutton"/> will be shown in the top-right side of the editor)

<img src="../img/layer-settings/style_editor_syntax_error.jpg" class="ms-docimage">

* The *autocomplete* function suggests the possible style's properties in order to prevents syntax errors:

<img src="../img/layer-settings/style_editor_autocomplete.jpg" class="ms-docimage"  style="max-width:500px;">

* The *color picker*, that can be activated through the square filled icon (<img src="../img/button/style_editor_color_picker_icon.jpg" class="ms-docbutton" style="max-height:15px;"/>) near the color code, helps in choosing colors directly from the editor, showing an interface like the following:

<img src="../img/layer-settings/style_editor_color_picker.jpg" class="ms-docimage"  style="max-width:500px;">

!!!warning
    The *autocomplete* and the *color picker* functions are available only in the CSS editor.

### Visual Editor Style

[MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) also allows to edit the layers style using a *Visual editor* with a most user friendly UI.Clicking on the <img src="../img/button/visual_editor_style_button.jpg" class="ms-docbutton"/> button a section opens so that the user can customize the style through with a visual style editor by adding/editing symbolizers, which can be: *Mark*, *Icon*, *Line*, *Fill* and *Text*. It is anyway possible to switch to the text editor mode if necessary for a more complex styling.

<img src="../img/layer-settings/visual_editor_style.jpg" class="ms-docimage"  style="max-width:500px;">

Once a symbolizer has been added and customized, you can:

<img src="../img/layer-settings/style_options.jpg" class="ms-docimage"  style="max-width:500px;">

* **Filter** the style rule, as explained [here](filtering-layers.md#attribute-filter), in order to apply the style only to certain layer features. It is possible clicking on the <img src="../img/button/filter_white_button.jpg" class="ms-docbutton"/> button.

* Add a **Scale denominator filter** (`max` and `min` scale) to visualize the style rule only within certain scale limits. This is possible by clicking the <img src="../img/button/scale_denominator_button.jpg" class="ms-docbutton"/> button.

* **Remove** the symbolizer by clicking the <img src="../img/button/delete_white_button.jpg" class="ms-docbutton"/> button.

#### Mark

The mark type allows you to add a mark to the layer: clicking on the <img src="../img/button/add_mark_button.jpg" class="ms-docbutton"/> button a mark panel appears:

<img src="../img/layer-settings/mark_panel.jpg" class="ms-docimage"  style="max-width:500px;">

The mark can have different `Shape`, `Color`, `Stroke` with different `Color` and `Width` and customizable `Radius` and `Rotation`. Take a look at the following example.

<img src="../img/layer-settings/mark_style_ex.jpg" class="ms-docimage">

#### Icon

With the icon panel, which opens by clicking on <img src="../img/button/add_icon_button.jpg" class="ms-docbutton"/> button, the style editor is allowed to add an image as an icon (by specifying its *URL*) and customize the icon `Opacity`, `Size` and `Rotation` angle:

<img src="../img/layer-settings/icon_panel.jpg" class="ms-docimage"  style="max-width:500px;">

#### Line

The line rule is used to style linear features of the layer: clicking on the <img src="../img/button/add_line_button.jpg" class="ms-docbutton"/>  button a panel allows the user to edit the corresponding properties.

<img src="../img/layer-settings/line_panel.jpg" class="ms-docimage"  style="max-width:500px;">

The editor can change the `Stroke color`, the `Stroke width`, the `Line style` (*continuous*, *dashed*, etc), the `Line cap` (*Butt*, *Round*, *Square*) and the `Line join` (*Bevel*, *Round*, *Miter*). An example can be the following one:

<img src="../img/layer-settings/ex_line_style.jpg" class="ms-docimage"  style="max-width:500px;">

#### Fill

The Fill rule is used to style polygon features. Clicking on <img src="../img/button/add_fill_button.jpg" class="ms-docbutton"/> button, the editor is allowed to customize the `Fill color`, the `Outline color` and the `Outline width`:

<video class="ms-docimage" controls><source src="../img/layer-settings/ex_fill_style.mp4"></video>

#### Text

The Text rule is used to style features as text labels. Text labels are positioned either at points or along linear paths derived from the geometry being labelled. Clicking on the <img src="../img/button/add_text_button.jpg" class="ms-docbutton"/> button a specific panel opens:

<img src="../img/layer-settings/text_panel.jpg" class="ms-docimage"  style="max-width:500px;">

The editor is allowed to type the name of the layer attribute to use for the `Label` and the dropdown list is filtered accordingly to show the existing attributes that are matching the entered text (the user can anyway directly select an attribute from the list). Moreover, the style editor can customize the `Font Family` (*DejaVu Sans*, *Serif*, etc), choose the font `Color`, `Size`, `Style` (*Normal* or *Italic*) and `Halo weight` (*Normal* or *Bold*) and select the desired `Halo color` and `Halo weight`. It is also possible to choose the text `Rotation` and `Offset` (*x* and *y*). En example can be the following one

<video class="ms-docimage" controls><source src="../img/layer-settings/ex_text_style.mp4"></video>

### Style Methods for Vector layer

Different styles methods can be used for each style rule. Clicking on the <img src="../img/button/options_button.jpg" class="ms-docbutton"/> button, available on top of the panel of each symbolizer, the editor can choose one of the following depending on the rule type:

* *Simple style*

* *Classification style*

* *Pattern mark style*  (available only for rules of type Line and Fill)

* *Patter icon style*  (available only for rules of type Line and Fill)

#### Simple style

The Simple style is the default style described above for each symbolizer.

#### Classification style

[MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows you to classify the style based on the attributes of the layer. The *Classification style* is available for *Marker*, *Line*, *Fill* and *Text* by clicking on the <img src="../img/button/options_button.jpg" class="ms-docbutton"/> button and choosing the **Classification style** options from the dropdown menu.

<img src="../img/layer-settings/classification_styl_panel.jpg" class="ms-docimage"  style="max-width:500px;">

It this case the editor is allowed to choose a `Color ramp` and the order (with `Reverse order`) of the classification intervals colors. It is obviously possible to select the layer `Attribute` to use for the classification along with the classification `Method` (*Quantile*, *Equal interval*, *Natural breaks* and *Standard deviation*), the number of classification `Intervals` and the `Opacity` (%) of each interval range. An example of the *Classification style* for a *Fill* rule type can be the following one:

<img src="../img/layer-settings/classification_style_ex.jpg" class="ms-docimage">

!!!note
    The *Classification style* method is available for **WMS**,  **WFS** and **Vector** layers. In case of **WMS** layers the *Classification style* can work only against GeoServer where the [SLD Service module](https://docs.geoserver.org/main/en/user/extensions/sldservice/index.html) need to be installed. In case of **WFS** and **Vector** layers, the same classification capabilities are entirely managed client.

!!!note

    From the *Classification style* options, it is also possible to manage **Custom Parameter** thought the <img src="../img/button/configute_lite_button.jpg" class="ms-docbutton"/> button. That's really useful to style [SQL Views](https://docs.geoserver.org/latest/en/user/data/database/sqlview.html) defined in GeoServer by using one of the available _viewparams_
    <img src="../img/layer-settings/configure_popup.jpg" class="ms-docimage" style="max-width:400px;">

    Here the user can add custom parameters that will be visible in the *Visual Style Editor*, above the *Color Palette* option. The *Custom Parameters* requires an array of fields to be configured according to the available viewparams defined in the SQL View. 

    <video class="ms-docimage" controls><source src="../img/layer-settings/thematic-layer.mp4"></video>

#### Pattern mark style

With the *Pattern mark style* it is possible to represent *Line* or *Fill*  style rules with a mark by clicking on the <img src="../img/button/options_button.jpg" class="ms-docbutton"/> button and choosing the **Pattern mark style** options from the dropdown menu.

<img src="../img/layer-settings/classify_mark_panel.jpg" class="ms-docimage"  style="max-width:500px;">

The style editor can configure a *Mark* as explained [here](#mark) along with the usual options available for rules of type [line](#line) or [fill](#fill) depending on the selected symbolizer. Take a look at the following example of the *Pattern mark style* for the *Line* rule sample.

<img src="../img/layer-settings/classify_mark_ex.jpg" class="ms-docimage">

#### Patter icon style

With the *Pattern icon style*  it is possible to represent *Line* or *Fill* style rules with an icon by clicking on the <img src="../img/button/options_button.jpg" class="ms-docbutton"/> button and choosing the **Pattern icon style** options from the dropdown menu.

<img src="../img/layer-settings/classify_icon_style_panel.jpg" class="ms-docimage"  style="max-width:500px;">

The style editor can configure the *Icon* as explained [here](#icon) along with the usual options available for rules of type [line](#line) or [fill](#fill) depending on the selected symbolizer. Take a look at the following example of *Pattern icon style* for a *Fill* rule sample.

<img src="../img/layer-settings/classify_icon_ex.jpg" class="ms-docimage">

#### Style with property value

[MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows you to use a property of the layer feature as value for a symbolizer property. The *Property value* function is available for *Marker*, *Icon*, *Line*, *Fill*, *Text* and *3D model* by clicking on the <img src="../img/button/options_button.jpg" class="ms-docbutton"/> button of each symbolizer property supporting it.

<img src="../img/layer-settings/properties_style.jpg" class="ms-docimage"  style="max-width:500px;">

By default, **Constant value** is selected. If the user chooses **Property value**, a drop-down menu appears so that the desired layer attribute can be selected to use its values for the styling property.

<video class="ms-docimage" controls><source src="../img/layer-settings/property-value-example.mp4"></video>

!!!warning
    As a *Property value* only attributes of type `string` or `number` are currently supported.

!!!note
    The *Style with property* method is available only for **WFS** and **Vector** layers.

### Style Methods for Raster layer

[MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) also allows to edit the **Raster Layers** style using a *Visual editor*. Through the <img src="../img/button/options_button.jpg" class="ms-docbutton"/> button, available on top of the panel, the editor can choose one of the following styles methods:

* Single band
* RGB bands
* Pseudo color

#### Single band

The **Single band** is the default one and here the user can  choose the **Channel** to customize selecting the **Contrast enhancement** choosing between `None`, `Normalize` and `Histogram` and the change the **Opacity**. Take a look at the following example.

<img src="../img/layer-settings/single_band_style.jpg" class="ms-docimage">

#### RGB bands

With the **RGB bands** the user can customize the three **Channels** of the layer, if they are available, and for each one selecting the **Contrast enhancement** choosing between `None`, `Normalize` and `Histogram` and the change the **Opacity**. Take a look at the following example.

<img src="../img/layer-settings/rgb_band_style.jpg" class="ms-docimage">

#### Pseudo color

With the **Pseudo color** the user has the possibility to customize the *Single band* with a *Color ramp*. In this case, in addition to choosing **Channels**, **Contrast enhancement** and **Opacity**, the user can select **Color ramp**, enable **Reverse order** and the **Continuous Colors**, choose the **Color map type** (`Ramp`, `Intervals` and `Values`), the **Method** (`Quantile`, `Natural breaks`, `Equal interval` and `Unique interval`) and modify the **Intervals**. Take a look at the following example.

<img src="../img/layer-settings/pseudo_color_style.jpg" class="ms-docimage">

#### Styling for COG layer

With the *Visual Style Editor*, the editor has the ability to customize the style of **COG layers**:

<img src="../img/layer-settings/cog-layer_style.jpg" class="ms-docimage">

Enabling the *Band styling* section, here the editor can associate the **Channels** (`Red`, `Green`, `Blue` and `Alpha`) to the **Bands** of the COG layer and set the minimum (**Min**) and maximum (**Max**) source data value. Take a look at the following example.

<video class="ms-docimage" controls><source src="../img/layer-settings/band_styling.mp4"></video>

### Styling on the 3D navigation

Thanks to the new improvements made to the *Visual Style Editor* editor, when [3D Navigation](navigation-toolbar.md#3d-navigation) is enabled, the editor has the ability to customize the style of **3D Tiles** and **vector layers**.

#### Styling of 3D Tiles layer

With [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) it is possible to customize the style of a [3D Tiles layer](catalog.md#3d-tiles-catalog) client side. The MapStore support is working in respect of the [3D Tiles Specification 1.0](http://docs.opengeospatial.org/cs/18-053r2/18-053r2.html) and on top of the [Cesium Styling capabilities](https://github.com/CesiumGS/3d-tiles/tree/1.0/specification/Styling). Below is an example of how the Style Editor of a 3D Tiles layer is appearing in the MapStore UI.

<img src="../img/layer-settings/3dtiles_style.jpg" class="ms-docimage">

For the 3D Tiles styling, while with the **Code Text Editor** it is possible to leverage completely on the styling specifications:

<img src="../img/layer-settings/text-editor-3dtiles.jpg" class="ms-docimage">

The [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) **Visual Style Editor** supports for now only a limited set of capabilities:

* Customization of the **Fill color**

<video class="ms-docimage" controls><source src="../img/layer-settings/ex_3dtiles_style.mp4"></video>

* Style Rule filtering based on the available [properties dictionary](https://github.com/CesiumGS/3d-tiles/tree/1.0/specification#properties) defined in the tileset.json

<img src="../img/layer-settings/filter_3dtiles_style.jpg" class="ms-docimage">

* Possibility to customize the radius in case of point cloud features

<img src="../img/layer-settings/point_3dtiles_text.jpg" class="ms-docimage">

<img src="../img/layer-settings/point_3dtiles_visual.jpg" class="ms-docimage">

#### Styling of Vector layer

In 3D mode [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows to customize the style of the *Vector layer* through the [Visual Style Editor](layer-settings.md#visual-editor-style) using the same styling options available in 2D mode as described in the previous chapter.

  In addition the **3D model** rule type is also available.
From the *Visual Style Editor*, by clicking on <img src="../img/button/3D-model-button.jpg" class="ms-docbutton"/> button, the 3D model symbolizer panel opens to allow adding a 3D model (based on [glTF](https://github.com/KhronosGroup/glTF), GLB is also allowed) as an external graphic by specifying its *URL* (see also the [Cesium documentation](https://cesium.com/learn/cesiumjs/ref-doc/ModelGraphics.html?classFilter=Model)). Furthermore, it is possible to customize the 3D model `Scale`, `X/Y/Z Rotation`, `Color` and `X/Y Translation` of the model's external graphic. Take a look at the following example.

<video class="ms-docimage" controls><source src="../img/layer-settings/3d-model-style-ex.mp4"></video>

!!!Warning
    For the Vector layer, the *Visual Style Editor* have some limitations:

    * It's possible to apply only one type of symbolizer at the time, so if the rule editor shows multiple rule with the same filter, only the first one is used.

    * For the *Line symbolizers*: the *Line cap* and *Line join* options are not available as properties in Cesium

Furthermore, for **WFS layers**, [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) adds some additional styling options in the *Visual Style Editor* such as:

* **Bring to front** (available for Icon, Mark and 3D model symbolizers) to bring in front and so to make visible (if enabled) all features covered by 3D Tile layers and the Terrain layer (for this last case when the *depth test against terrain* option is enabled in Global Settings).

<img src="../img/layer-settings/bring-to-front.jpg" class="ms-docimage">

* **Height reference from ground** (available for Mark, Icon, 3D Model and Text symbolizers) to indicate the reference for the point height between `None` (to the absolute zero of the ground), `Relative` (to the terrain layer level) or `Clamp` (the feature is clamped to the Terrain, if present, or to the ground). It is also possible to finely configure the **Height** value of the point symbols by choosing between one of the attributes of the feature (where *Point height* indicates the intrinsic height of the feature geometry) selecting *Attribute Value* or choosing *Constant Value* that allows to set the raw value of the height.

<img src="../img/layer-settings/height-reference.jpg" class="ms-docimage">

* **Leader line** (available for Mark, Icon, 3D Model and Text symbolizers) to add a line to connect the point symbol with the Terrain/Ground to have a more clear reference of the effective point position when the camera orientation change. The editor can choose the **Width** of the line and the **Color** through the usual *color picker*.

<img src="../img/layer-settings/leader-line.jpg" class="ms-docimage">

* **Clamp to ground** to enable/disable the boolean property specifying whether the line or polygon features should be clamped to the ground (this option is available for Line and Fill symbolizers).

<img src="../img/layer-settings/clamp-to-ground.jpg" class="ms-docimage">

* **Clamp to ground reference** to choose whether the drape effect, should affect `3D Tiles`, `Terrain` or `Both`. This option is available for Fill symbolizers and it is only enabled when the *Clamp to ground* option is set to `True`

<img src="../img/layer-settings/polygon-type.jpg" class="ms-docimage">

* **Extrusion Height** (available for Line and Fill symbolizers) to configure the height value of the feature to be extruded. It is also possible to enable/disable the **Extrusion relative to geometry** (from the highest point of the feature geometry) and, only for the *Line* symbolizers, the user can customize the **Extrusion color** and the **Extrusion type**, choosing between `Wall`, `Circle` and `Square` options, for the extruded features.

<img src="../img/layer-settings/extrusion.jpg" class="ms-docimage">

## Feature Info Form

Through the last section of the layer settings panel, it is possible to decide the information format that appears querying a layer with the [Identify Tool](navigation-toolbar.md#identify-tool):

<img src="../img/layer-settings/feature-info-form.jpg" class="ms-docimage"  style="max-width:500px;"/>

In particular, the user can choose between:

* **Disable Identify** to disable the Identify for the layer

* **Text**

* **HTML**

* **Properties**

* **Template**

!!!note
    Without selecting any format here, the [Identify Tool](navigation-toolbar.md#identify-tool) will return the layers information with the format chosen in Map Settings ( in the [Side Toolbar](mapstore-toolbars.md#side-toolbar)). Once a user specifies the information format in layers settings, instead, that format will take precedence over the map settings only for that specific layer.

!!!note
    From the Layer Settings panel, MapStore allows users to choose the *Information format* for `WMS` and `WFS` layer types.
    The **Text** option is only available for `WMS` layers, while the **HTML** option for `WFS` layers is available only with GeoServer and if the [`wfs-freemarker`](https://docs.geoserver.org/main/en/user/community/wfs-freemarker/index.html) extension is installed on the GeoServer side.

### Text

An example of layer information in text format can be:

<img src="../img/layer-settings/GFI_text.jpg" class="ms-docimage"  style="max-width:600px;"/>

### HTML

An example of layer information in HTML format can be:

<img src="../img/layer-settings/GFI_html.jpg" class="ms-docimage"/>

### Properties

An example of layer information in properties format can be:

<img src="../img/layer-settings/GFI_properties.jpg" class="ms-docimage"  style="max-width:600px;"/>

### Templates

In this case the user can customize the information format:

<img src="../img/layer-settings/GFI_template.jpg" class="ms-docimage"  style="max-width:500px;"/>

In particular, by clicking on the <img src="../img/button/edit_button.jpg" class="ms-docbutton"/> button, the following text editor appears:

<img src="../img/layer-settings/edit_custom_format.jpg" class="ms-docimage"  style="max-width:600px;"/>

!!!note
    Clicking on the <img src="../img/button/image_button.jpg" class="ms-docbutton"/> button, the Identify Template editor allows to insert images in different ways:

    * Using direct URLs of resources available on the web
    
    * Using URIs encoded in base64

    * Parsing needed image URLs from available feature attributes (eg. attributes with URL value). The usual syntax can be used in this case to refer the attribute value (eg. `${properties.IMAGE}`)

    * Parsing image URIs encoded in base64 from available feature attributes (eg. attributes with base64 URIs values). The usual syntax can be used in this case to refer the attribute value (eg. `${properties.IMAGE}`)
    
    <video class="ms-docimage"  style="max-width:600px;" controls><source src="../img/layer-settings/image_on_template.mp4"/></video>

Here it is possible to insert the text to be displayed through the [Identify Tool](navigation-toolbar.md#identify-tool), with the possibility to wrap the desired properties. <br>
Let's make an example: we assume to have a layer where each record corresponds to a USA State geometry in the map. In the [Attribute Table](attributes-table.md#attribute-table) of this layer there's the `STATE_NAME` field that, for each record, contains a text value with the name of the State. <br>
If the goal is to show, performing the [Identify Tool](navigation-toolbar.md#identify-tool), only the State name, an option could be to insert the following text on the Template text editor:

<img src="../img/layer-settings/GFI_template_ex.jpg" class="ms-docimage"  style="max-width:400px;"/>

In this case, by clicking on the map, the [Identify Tool](navigation-toolbar.md#identify-tool) returns:

<img src="../img/layer-settings/GFI_template_ex1.jpg" class="ms-docimage"/>

Using the `${properties.NAME_OF_THE_FIELD}` syntax, MapStore is able to parse the response to the [Identify Tool](navigation-toolbar.md#identify-tool) request by matching the configured placeholder.
