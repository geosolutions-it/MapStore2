# Managing Access Rules

*******************

In [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/), the **Rules Manager** is an administrative tool designed to manage [GeoFence](https://docs.geoserver.org/main/en/user/extensions/geofence/index.html) authorization rules on data published in GeoServer by providing a security control method for restricting access to [GeoServer](https://geoserver.org/) *Workspaces*, *Layers* and/or *Services*. Admin users can create and assign one or more authorization rules to allow or deny access to a specific *User*, *Group of users*, *IP Range* and more, with a high level of granularity.

As an admin user, it is possible to manage **Rules** for different **GeoServer Instances** by selecting the **Managing Access Rules** option from the <img src="../img/button/logged.jpg" class="ms-docbutton"/> button on the [Homepage](home-page.md#home-page):

<img src="../img/rule-manager/rule-manager.jpg" class="ms-docimage"/>

!!! Warning
    The Rules Manager must be installed following the instructions of the  [rules manager page setup](https://mapstore.geosolutionsgroup.com/mapstore/docs/api/framework#pages.RulesManager) to be available in the MapStore UI.

## Manage Rules

The *Rules Manager* page opens on the **Rules** tab, where the admin user can view all the available rules:

<img src="../img/rule-manager/rule-manager-panel.jpg" class="ms-docimage" />

To **Add a Rule**, the user can click the <img src="../img/button/++++.jpg" class="ms-docbutton"/> button. A panel will open, allowing the user to create a new rule by providing the following information:

<img src="../img/rule-manager/add-rule.jpg" class="ms-docimage" />

* Select the **GS Instance**: choose from the available GeoServer instances

!!! Warning
    The *GS Instance* option is available if more than one instance is configured, see the [GeoServer Instances](rule-manager.md#geoserver-instances) section. To make the Rule Manager work, it is necessary to have the [MapStore/GeoServer user integration](../developer-guide/integrations/geoserver.md) properly set up in one of the available methods (see also the Users integration section such as [LDAP/AD](../developer-guide/integrations/users/ldap.md), [OIDC](../developer-guide/integrations/users/openId.md) or [Keycloak](../developer-guide/integrations/users/keycloak.md)).

* Select the **Role**: choose from the user groups available in MapStore.

* Select the **User**: choose from the users registered in MapStore.

* Add **IP ranges**: specify the IP ranges to grant access to the service, workspace, and/or layer.

* Select the **Service**: choose between`WFS` or `WMS`

* Select the **Request**: choose from `DescribeLayer`, `GetCapabilities`, `GetFeatureInfo`, `GetLegendGraphic`, `GetMap` and `GetStyles`

* Select the **Workspace**: choose from the workspaces available on the selected GeoServer instance.

* Select the **Layer**: choose from the layers available on the selected GeoServer instance.

* Add the **Validity Period**: specify the start and end dates for access to the service, workspace, and/or layer. The rule thus defined is be applied at run time only within the date period defined.

* Select the **Access** type: choose between `ALLOW` o `DENY`

Once all the rule information has been configured, it can be saved by clicking the <img src="../img/button/save2.jpg" class="ms-docbutton"/> button. The rule will be displayed in the rules list according to the assigned priority.

The *Priority* of a rule can be modified in two ways:

* Drag and drop the rule directly within the list

* Edit via panel: select the rule and click on <img src="../img/button/edit-service.jpg" class="ms-docbutton"/> button. The Priority option will appear in the panel and can be changed by entering the new value in the dedicated box.

<img src="../img/rule-manager/change-priority.jpg" class="ms-docimage" />

!!! Warning
    As a general behavior, rules are evaluated according to their priority (from top to bottom of the list): the first one matching the condition will be applied (see also the GeoFence official [documentation page](https://github.com/geoserver/geofence/wiki/Rule-matching) online).

From the *Rule* panel, by adding the *WorkSpace* and the *Layer*, the user can also manage the auth rule with a finest granularity (the *Rule Details*) by specifying if it should be applied to a specific **Style**, to layer features matching a predefined **Filters** and/or to layer **Attributes**.

!!! Warning
    The *Rules Details* are currently supported when MapStore is connected to a standalone GeoFence. For a GeoFence embedded in GeoServer the support is still missing due to different REST APIs involved.

<img src="../img/rule-manager/manage-layer-options.jpg" class="ms-docimage" />

### Managing Layer Access Style

By selecting the **Style** tab, the user can choose which styles of the layer can be displayed within the rule. The user can select between the *Default Style* and the *Styles Available* for that layer in GeoServer by using the <img src="../img/button/change-media2.jpg" class="ms-docbutton"/> button.

<img src="../img/rule-manager/style-tab.jpg" class="ms-docimage" />

### Managing Layer Access Filters

By selecting the **Filters** tab, the user can apply access rules to the layer by adding one of the following filters:

<img src="../img/rule-manager/filter-tab.jpg" class="ms-docimage" />

* **CQL Filter Read Rules**: allows defining a CQL filter to control which features or records of the layer can be read.

* **CQL Filter Write Rules**: allows defining a CQL filter to control which features or records of the layer can be edited.

* **Area of Interest**: allows filtering the layer by selecting a specific area using the MapStore viewer: only layer features within the defined areas are affected by the permission rule.

### Managing Layer Access Attribute Table

In the **Attribute Table** tab, the list of attributes of the layer is displayed. For each field, the user can select the access mode, choosing between: `NAME`, `READ ONLY`, and `READ WRITE`.

<img src="../img/rule-manager/attribute-table-tab.jpg" class="ms-docimage" />

### Filter Rules

It is possible to filter the rules for each category by selecting the available options from the corresponding dropdown menu.

<video class="ms-docimage" controls><source src="../img/rule-manager/search-rule.mp4"/></video>

Additionally, for each category, it is possible to display only the rules that explicitly include the selected option by clicking the corresponding checkbox.

<video class="ms-docimage" controls><source src="../img/rule-manager/search-rule-checkbox.mp4"/></video>

## GeoServer Instances

From the *Rules Manager* page, it is also possible to configure more than one *GeoServer Instance* on which to create access rules. To do this, the administrator can click on the **GS Instances** tab. Here, the admin user can view all the configured GeoServer instances:

<img src="../img/rule-manager/gs-manager-panel.jpg" class="ms-docimage" />

!!! Warning
    Multiple GeoServer instances can be configured only with a standalone GeoFence running in background. In case a GeoFence embedded in GeoServer is used, only one single instance can be supported by the MapStore Rule Manager.

To **Add a GeoServer Instance**, the user can click the <img src="../img/button/++++.jpg" class="ms-docbutton"/> button. A panel will open, allowing the user to add a new instance by providing the following information:

<img src="../img/rule-manager/add-gs.jpg" class="ms-docimage" />

* Enter a **GS Name** and a **GS Description**

* Add the **GS URL**

* Enter the GeoServer instance **Username** and the **Password**
