# Configuration Expressions

In MapStore, configurations allow for extensive customization of application behavior. To enhance this flexibility, `localConfig.json` and plugin configurations can include expressions. By using these expressions, you can make your application configuration both dynamic and reactive.

Any string wrapped in braces `{expression}` within the plugin configurations (or throughout the entire `localConfig.json`) will be evaluated at runtime based on the global state and the application context. This allows for advanced adjustments to the configuration.

This system is built as a strict superset of **[Filtrex](https://www.npmjs.com/package/filtrex)**, providing a safe and powerful way to apply conditional configurations to plugins.

In addition to this syntax, for backward compatibility and as utilities, several syntax enhancements have been added and can be used alongside the standard Filtrex syntax:

- Access to a subset of the application state, the *monitored state*, via the `state` function.
- Additional built-in functions (see the relative section).
- The `.` notation can be used to extract sub-properties of objects.
- Other minor enhancements to make expressions more JavaScript-like.
- Extensibility via a context object passed to the application (for custom projects).

These expressions are typically used in plugin configurations (e.g., `localConfig.json`).

## Primary Use Case: `disablePluginIf`

The expression syntax can potentially be applied to every configuration. However, the most common application for these expressions is controlling plugin activation. The `disablePluginIf` property evaluates an expression; if it returns `true`, the plugin is removed from the application lifecycle.

### Code Examples

- **Browser Detection:**
  - `"disablePluginIf": "{state('browser') and state('browser').safari}"`
- **Mode Detection:**
  - `"disablePluginIf": "{state('featuregridmode') == 'EDIT'}"`
- **Security/Role Checks:**
  - `"disablePluginIf": "{!state('userrole')}"`
- **Complex Logic:**
  - `"disablePluginIf": "{state('mapType') == 'cesium' or !state('printEnabled')}"`

## State Access and `monitorState`

The `state('name')` function allows you to access a "slice" of the Redux store. However, for performance and security reasons, only specific parts of the state are exposed. These are defined in the `monitorState` section of your `localConfig.json`.

### Default Monitored States

The following aliases are usually available out-of-the-box in the standard version of MapStore:

| Alias | Path in Redux Store | Purpose |
| --- | --- | --- |
| `router` | `router.location.pathname` | Current URL path |
| `browser` | `browser` | Browser info (safari, mobile, etc.) |
| `geostorymode` | `geostory.mode` | View/Edit mode in GeoStory |
| `featuregridmode` | `featuregrid.mode` | Grid interaction state |
| `userrole` | `security.user.role` | Current user's role |
| `printEnabled` | `print.capabilities` | Printing availability |
| `resourceCanEdit` | `resources.initialSelectedResource.canEdit` | Permission on current resource |
| `usergroups` | (internal selector) | User's groups (`groupName`) array (only enabled ones) |

They are configured by default in the `monitoredState` section of the standard `localConfig.json`, allowing them to be customized.

### Customizing Monitored State

You can extend this list in `localConfig.json` to expose any part of the MapStore state to your expressions:

```json
"monitorState": [
    { "name": "myCustomValue", "path": "myPlugin.settings.value" }
]

```

*Usage:* `{state('myCustomValue') == 'active'}`

## Core Syntax & Operators

The [engine](https://www.npmjs.com/package/filtrex) supports standard mathematical operations, string concatenation, and logic.

- **Logical Operators:** Use `and`, `or`, `not` (or `!`).
- **Comparison:** `==`, `!=`, `<`, `>`, `<=`, `>=`.
- **Conditionals (If-Then-Else):** `{if state('isNew') then 'Create' else 'Update'}`
- **Safe Navigation:** Always use the `get()` function or the `?.` syntax (which is handled internally) to avoid errors if a path is undefined.

Moreover, MapStore adds several enhancements to automatically migrate old rules and improve overall functionality.

- **Strings** can also be indicated using single quotes (`'string'`). While Filtrex uses this syntax to define variables with spaces or reserved characters (e.g., `'my-variable'`), MapStore allows it to improve readability within JSON strings. For instance, `"{ 'strings' + 'to concat'}"` is much more readable than `"{ \\"strings\\" + \\"to concat\\"}"`.
- The **context** variable is reserved for backward compatibility.
- **Arrays** can be indicated as `[1, 2, 3]` (whereas Filtrex uses `(1, 2, 3)`).
- **Logical and comparison operators** can be expressed using `&&`, `||`, and `!` for backward compatibility. Similarly, the comparison operators `!==` and `===` are supported (Filtrex standard uses `and`, `or`, `not`, `!=`, and `==`).
- **Optional chaining** `?.` is automatically translated into `.`.

Moreover, some simple function calls like `{state('v').toLowerCase()}` or `{state(v).includes('a')}` are automatically translated into the corresponding built-in functions (e.g., `{state(v).includes('a')}` becomes `{includes(state('v'), 'a')}`).

## Built-in Functions

Several built-in functions are available to simplify the writing of expressions.

| Function | Description | Example |
| --- | --- | --- |
| `get(obj, path, default)` | Safely access nested properties. | `get(state('resource'), 'metadata.id')` or `get(state('resource'), 'metadata.id', 0)` |
| `includes(target, val)` | Checks for a specific value within strings or arrays. | `state('router').includes('/shared')` |
| `hasAtLeastOne(arr, vals)` | Returns `true` if the array contains at least one of the specified values. | `hasAtLeastOne(state('groups'), ['group1'])` |
| `containsAll(arr, vals)` | Returns `true` if the array contains all of the specified values. | `containsAll(state('groups'), ['group1', 'group2'])` |
| `toLowerCase(str)` | Converts a string to lowercase. | `toLowerCase(state('role')) == 'admin'` |

## Context Integration

The `context` variable is a reserved namespace for functions and data passed during application initialization. For backward compatibility, functions and variables within the context are available **directly** as native functions.

If your custom project initializes the app with a context:

```javascript
context: {
   power: (v) => v * v,
   isInternal: true
}

```

You can use these directly in your configuration:

- `{power(4)}` → Returns `16`
- `{isInternal == true}` → Evaluates based on the variable.

Currently, `context` contains `ReactSwipe` for backward compatibility. This will be removed in a future release.
