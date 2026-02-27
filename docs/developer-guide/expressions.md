# Configuration Expressions

In MapStore the configurations allow to customize a lot of behaviors of MapStore. In order to make MapStore even more flexible, the `localConfig.json` and the plugins configuration can contain also some expressions. Using the expressions you to make your application configuration dynamic and reactive.

Any string wrapped in braces `{expression}` within the plugin configurations (or in the whole `localConfig.json`) will be evaluated at runtime based on the global state and the application context.
This allows to do some advanced changes like configure the

This system is built as a strict superset of **[Filtrex](https://www.npmjs.com/package/filtrex)**, providing a safe and powerful way to apply conditional configurations to plugins.

In addition to this syntax, for backward compatibility and as utilities, some additional syntax enhancements has been added and can be used together with the standard filtrex syntax:

- access to a sub-set of application state, the *monitored state*, via `state` function
- additional built in functions (see relative section)
- `.` notation can be used to extract sub-properties of objects
- other minor enhancement to make the expressions look more JS like
- extensibility via context object passed to the application (for custom projects)

These expressions can be used typically in plugins configurations (e.g. `localConfig.json`).

## Primary Use Case: `disablePluginIf`

The expressions syntax can be applied potentially to every configuration. Anyway the most common application for these expressions is controlling plugin activation. The `disablePluginIf` property evaluates an expression; if it returns `true`, the plugin is removed from the application lifecycle.

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

The following aliases are usually available out-of-the-box in standard mapstore:

| Alias | Path in Redux Store | Purpose |
| --- | --- | --- |
| `router` | `router.location.pathname` | Current URL path |
| `browser` | `browser` | Browser info (safari, mobile, etc.) |
| `geostorymode` | `geostory.mode` | View/Edit mode in GeoStory |
| `featuregridmode` | `featuregrid.mode` | Grid interaction state |
| `userrole` | `security.user.role` | Current user's role |
| `printEnabled` | `print.capabilities` | Printing availability |
| `resourceCanEdit` | `resources.initialSelectedResource.canEdit` | Permission on current resource |

They are configured by default in standard `localConfig.json` `monitoredState` section. so they can be customized.

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
- **Safe Navigation:** Always use the `get()` function or the `?.` syntax (which is internally handled) to avoid errors if a path is undefined.

Moreover MapStore adds some enhancement to migrate old rules automatically and to improve the functionalities.

- **Strings** can be indicated also using `'string'` with single quotes. This syntax, that in filtrex allow to define variables with spaces or reserved characters (e.g. `'my-variable'`), **is denied**, here is allowed, in order to help the readability inside JSON stings: In fact `"{ 'strings' + 'to concat'}"` is a lot more readable than `"{ \\"strings\\" + \\"to concat\\"}"`.
- **context** variable is reserved, for backward compatibility
- **arrays** can be indicated as `[1,2,3]` (filtrex uses `(1,2,3)`)
- **logical and comparison operators** can be indicated using `&&` `||` and `!` for backward compatibility. Same for comparison operators `!==` and `===`. (filtrex uses `and` `or` `not` `!=` and `==`)
- **optional chaining** `.?` is automatically translated into `.`

Moreover, some simple functions call like `{state('v').toLowerCase()}` or `{state(v).includes('a')}` are automatically translated into the `build-in` functions applied. (e.g. `{state(v).includes('a')}` becomes `{includes(state('v'), 'a')}`).

## Built-in Functions

There are some built in functions that can be used in expressions, to simplify the writing of expressions.

| Function | Description | Example |
| --- | --- | --- |
| `get(obj, path, default)` | Safely access nested properties. | `get(state('resource'), 'metadata.id')` or  `get(state('resource'), 'metadata.id',0)` |
| `includes(target, val)` | Checks for a value in strings or arrays. | `state('router').includes('/shared')` |
| `hasAtLeastOne(arr, vals)` | True if array contains at least one value. | `hasAtLeastOne(state('groups'), ['group1'])` |
| `containsAll(arr, vals)` | True if array contains all values. | `containsAll(state('groups'), ['group1', 'group2'])` |
| `toLowerCase(str)` | Converts string to lowercase. | `toLowerCase(state('role')) == 'admin'` |

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

For now `context` contains, for backward compatibility the `ReactSwipe`. This will be removed in a future release.
