# Managing IP Ranges

*******************

In [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/), the **IP Ranges Manager** is an administrative tool designed to manage IP Ranges used as an access control method for resources. Administrative users can assign one or more existing IP ranges to a resource through the [Permission Rules](resources-properties.md#permission-rules) properties, allowing access based on specific IP addresses.

As an admin user, it is possible to manage **IP Ranges** by selecting **Manage IP Ranges** option from the <img src="../img/button/logged.jpg" class="ms-docbutton"/> button on the [Homepage](home-page.md#home-page):

<img src="../img/ip-ranges/ip-ranges-manager.jpg" class="ms-docimage" style="max-width:500px;"/>

The *Manager* page opens on **IP Ranges** tab, allowing the admin user to:

<img src="../img/ip-ranges/ip-ranges-panel.jpg" class="ms-docimage" />

* Create a **New IP Ranges** through the <img src="../img/button/new_ip-ranges_button.jpg" class="ms-docbutton"/> button and customize it by adding a *IP Range (CIDR format)* and a *Description*.

<img src="../img/ip-ranges/new_ip-ranges.jpg" class="ms-docimage" />

* **Search** for a tag using the search bar

<img src="../img/ip-ranges/search_ip-ranges.jpg" class="ms-docimage" />

* **Edit** a tag through the <img src="../img/button/edit_properties.jpg" class="ms-docbutton"/> button next to each tag in the list.

* **Remove** a tag through the <img src="../img/button/delete2.jpg" class="ms-docbutton"/> button next to each tag in the list.

!!! Warning
    When both *Groups* and *IP Range* permission rules are defined for a MapStore resource, **the group rules have priority**. For example, if a user belongs to a group with *Edit* permissions on a resource but is also within an IP range that has only *View* permissions, the user will still have *Edit* rights for that resource.
