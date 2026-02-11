const GN_STATE_1 = {
    isNewResource: true
};


const GN_STATE_2 = {
    isNewResource: false,
    user: {
        role: "USER"
    },
    gnResourceData: {
        permission: ['change_resourcebase']
    }
};

const fakeFun = () => {};
const context = {
    resourceHasPermission: (data, permission) => data?.permission.includes(permission),
    canCopyResource: (data, user) => user?.role === "ADMIN" || data?.permission?.includes('copy')
};
const RESULT = "NO_DATA";

export const FAIL_TESTS = [
    ["noFunction(data)", {data: 1}, {type: 'execution'}, "No function"],
    ["parse error", {}, {type: 'compile'}, "parse Error"],
    // rule that checks group with array methods or array functions are not allowed --> use includes, hasSome
    ["!(state('usergroups').filter(g => ['GRP1','GRP2','GRP3'].includes(g.groupName)).length",
        {
            state: {usergroups: ['GRP2', 'GRP3']}
        }, {
            type: 'compile'
        }
    ],
    // (state('data') || {}).pk do not work, string concatenation works. Use `get(state("data"),"pk")
    ["'#/dataset/' + (state('data') || {}).pk + '/edit/data'", {state: {data: {pk: 'test'}}}, {type: "compile"}, "complex other syntaxes"]
];

export const BASIC_FUNCTIONS_TEST = [
    // basic evaluation
    ["notPresent", {}, undefined, "No data"], // empty variable
    ["1+1", {}, 2, "math"], // empty variable
    ["[1, 2]", {}, [1, 2], "array"],
    // state function
    ["state('isNewResource')", {state: GN_STATE_1}, true],
    // state function with dot notation (not sure needed)
    // function returns undefined, but apply logical operations
    ["state('notPresent') || state('notPresent2')", {state: {}}, false],
    ["state('present') || state('notPresent2')", {state: {present: true}}, true],

    ["'a'+'b'", {}, "ab", "string concatenation"],
    ["a and b", {context: {a: true, b: false}}, false, "bool expression"],
    // string concatenation default applied with || {} must be replaced with get or state fun with default
    [
        // string concat + function
        "'#/dataset/' + get(state('data'),'pk') + '/edit/data'",
        {state: {data: {pk: 'test'}}},
        '#/dataset/test/edit/data',
        "String concatenation + state + get"
    ],
    // toLowerCase
    [
        "'gnviewer.'+context.get(state('gnResourceSelectedLayerDataset'), 'date_type').toLowerCase()",
        {state: {gnResourceSelectedLayerDataset: {date_type: "HELLO"}}},
        "gnviewer.hello"
    ],
    // includes
    [
        "state('selectedLayerPermissions').includes('download_resourcebase')",
        {state: {selectedLayerPermissions: ["download_resourcebase"]}},
        true
    ],
    [
        "state('selectedLayerPermissions').includes('other')",
        {state: {selectedLayerPermissions: ["download_resourcebase"]}},
        false
    ],
    // includes function form fixed list
    [
        "['raster', '3dtiles'].includes(get(state('gnResourceData'),'subtype'))",
        {state: {gnResourceData: {subtype: "raster"}}},
        true
    ],
    // NOTE: 1 element array are not supported. Anyway containsAll and hasAtLeastOne can receive also single values.
    ['["raster"].includes("raster")', {}, true, "includes with array with 1 element is not supported, use directly string or hasAtLeastOne/containsAll instead" ],
    // test containsAll
    ["containsAll(state('groups'), ['ADMIN', 'USER'])", {state: {groups: ['ADMIN', 'USER', 'OTHER']}}, true],
    ["containsAll(state('groups'), ['ADMIN', 'USER'])", {state: {groups: ['ADMIN']}}, false],
    // test hasAtLeastOne
    ["hasAtLeastOne(state('groups'), ['ADMIN', 'USER'])", {state: {groups: ['ADMIN', 'USER', 'OTHER']}}, true],
    ["hasAtLeastOne(state('groups'), ['ADMIN', 'USER'])", {state: {groups: ['OTHER']}}, false],
    // test original rule that uses includes with nested functions
    ["['raster', '3dtiles'].includes(state('gnResourceData').subtype)", {state: {gnResourceData: {subtype: "raster"}}}, true],
    // other custom functions
    [
        "context.resourceHasPermission(state('gnResourceData'), 'change_resourcebase')",
        {state: GN_STATE_1, context},
        undefined
    ],
    [
        "context.resourceHasPermission(state('gnResourceData'), 'change_resourcebase')",
        {state: GN_STATE_2, context},
        true
    ]
];
export const COMPATIBILITY_TEST_MS = [
    [
        "state('mapType') === 'cesium' || !state('printEnabled')",
        {
            state: { mapType: 'openlayers' }
        },
        true
    ]
];
/**
 * list of expressions used in Geonode
 */
export const COMPATIBILITY_TESTS_GN = [
    ["context.ReactSwipe",   {state: {}, context: {ReactSwipe: RESULT}}, RESULT],
    // tests with resourceHasPermission, canCopyResource in context
    [
        "!(state('isNewResource') || context.resourceHasPermission(state('gnResourceData'), 'change_resourcebase') || context.canCopyResource(state('gnResourceData'), state('user')) || context.resourceHasPermission(state('gnResourceData'), 'delete_resourcebase'))",
        {state: {isNewResource: false}, context: {resourceHasPermission: () => false, canCopyResource: () => false}}, true,
        "boolean expression !(false || false || false || false) = true - Rule:"
    ],
    [
        "!(state('isNewResource') || context.resourceHasPermission(state('gnResourceData'), 'change_resourcebase') || context.canCopyResource(state('gnResourceData'), state('user')) || context.resourceHasPermission(state('gnResourceData'), 'delete_resourcebase'))",
        {state: {isNewResource: true}, context: {resourceHasPermission: () => false, canCopyResource: () => false}}, false,
        "boolean expression !(true || false || false || false) = false - Rule:"
    ],
    [
        "!(state('isNewResource') || context.resourceHasPermission(state('gnResourceData'), 'change_resourcebase') || context.canCopyResource(state('gnResourceData'), state('user')) || context.resourceHasPermission(state('gnResourceData'), 'delete_resourcebase'))",
        {state: {isNewResource: false, gnResourceData: {permission: ['delete_resourcebase']}}, context}, false,
        "boolean expression !(false || false || false || true) = false - Rule:"
    ],
    // NOT COMPATIBLE:
    // ["'#/dataset/' + (state('gnResourceData') || {}).pk + '/edit/data'",   {state, context}, RESULT],
    // must use
    [
        "'#/dataset/' + get(state('data'),'pk') + '/edit/data'",
        {state: {data: {pk: 'test'}}},
        '#/dataset/test/edit/data',
        "String concatenation + state + get"
    ],
    // Compatible (transforms includes)
    [
        "(state('gnResourceData') && ['raster', '3dtiles'].includes(state('gnResourceData').subtype)) || !state('selectedLayerPermissions').includes('download_resourcebase')",
        {state: {
            selectedLayerPermissions: true,
            gnResourceData: {
                subtype: ['raster']
            }
        }, context}, true
    ],
    ["state('gnResourceData').subtype === '3dtiles'",   {state: {gnResourceData: {subtype: "3dtiles"}}, context}, true],
    ["context.getUploadMainFile",   {state: {}, context: {getUploadMainFile: fakeFun}}, fakeFun, "returning context objects"],
    // NOT COMPATIBLE:
    // context.getSupportedFilesByResourceType('dataset', { actions: ['resource_metadata_upload'] })
    // must use a dedicated function. NOTE: with 1 element array will be treated as single argument !!!
    [
        "context.getSupportedFilesByActions('dataset', ['resource_metadata_upload'] )",
        {state: {}, context: {getSupportedFilesByActions: (a, b) => (a === "dataset" && b === "resource_metadata_upload" && RESULT) }},
        RESULT
    ],
    [   "context.getSupportedFilesByActions('dataset', ['replace', 'upsert'] )",
        {state: {}, context: {getSupportedFilesByActions: (a, b) => (a === "dataset" && b[0] === "replace" && b[1] === "upsert" && RESULT) }},
        RESULT
    ],
    // NOT COMPATIBLE:
    // ["'< Go back to ' + (state('gnResourceData') || {}).title",   {state, context}, RESULT],
    // use instead - '< Go back to ' + get(state('gnResourceData'), "title") or
    ["'< Go back to ' + state('gnResourceData').title",   {state: {gnResourceData: {title: "TEST"}}, context}, "< Go back to TEST"],
    // or
    ["'< Go back to ' + get(state('gnResourceData'), \"title\")",   {state: {gnResourceData: {title: "TEST"}}, context}, "< Go back to TEST"],
    // also ?. is compatible, replaced with normal, so not necessary
    ["state('resourceParams')?.appPk",   {state: {}, context}, undefined],
    ["state('resourceParams').appPk",   {state: {}, context}, undefined],
    ["state('resourceParams').appPk",   {state: {resourceParams: {appPk: RESULT }}, context}, RESULT],
    // includes is converted.
    ["!state('selectedLayerPermissions').includes('download_resourcebase')",   {state: {selectedLayerPermissions: ['download_resourcebase']}, context}, false],
    // here there is get from context, will use the default get function instead
    ["context.get(state('gnResourceSelectedLayerDataset'), 'title')",   {state: {gnResourceSelectedLayerDataset: {title: RESULT}}, context}, RESULT],
    ["'/people/profile/' + context.get(state('gnResourceSelectedLayerDataset'), 'owner.username')",   {state: {gnResourceSelectedLayerDataset: {owner: {username: RESULT}}}, context}, `/people/profile/${RESULT}`],
    ["context.getUserResourceName(context.get(state('gnResourceSelectedLayerDataset'), 'owner'))",   {state: {gnResourceSelectedLayerDataset: {owner: RESULT}}, context: {getUserResourceName: (v) => v }}, RESULT],
    ["!context.get(state('gnResourceSelectedLayerDataset'), 'owner.username')",   {state: {gnResourceSelectedLayerDataset: {owner: {username: RESULT}}}, context}, false],
    ["'gnviewer.'+context.get(state('gnResourceSelectedLayerDataset'), 'date_type').toLowerCase()",   {state: {gnResourceSelectedLayerDataset: {"date_type": RESULT}}, context}, "gnviewer." + RESULT.toLocaleLowerCase()],
    // NOT compatible:
    // ["context.isDocumentExternalSource(state('gnResourceSelectedLayerDataset')) ? 'link' : 'text'",   {state, context}, RESULT],
    // use instead if then else
    ["if context.isDocumentExternalSource(state('gnResourceSelectedLayerDataset')) then 'link' else 'text'",   {state: {}, context: {isDocumentExternalSource: () => false}}, "text"],
    ["if context.isDocumentExternalSource(state('gnResourceSelectedLayerDataset')) then 'link' else 'text'",   {state: {}, context: {isDocumentExternalSource: () => true}}, "link"],
    // compatible ternary get --> translated in simple get.
    ["context.get(state('gnResourceSelectedLayerDataset'), 'sourcetype', '').toLowerCase()",   {state: {}, context}, ""],
    ["context.get(state('gnResourceSelectedLayerDataset'), 'sourcetype', '').toLowerCase()",   {state: {gnResourceSelectedLayerDataset: {sourcetype: RESULT}}, context}, RESULT.toLowerCase()],
    ["context.get(state('gnResourceSelectedLayerDataset'), 'category.gn_description')",   {state: {gnResourceSelectedLayerDataset: { category: {gn_description: RESULT}}}, context}, RESULT],
    // long conditions with multiple functions and logical operators are compatible, even if they are complex to read. The rule is to not transform the original rule, but just to transform the syntax, so the logic is preserved. If the original rule is too complex, it's better to refactor it in a simpler way, but it should not be rejected by the parser.
    [
        "!context.resourceHasPermission(state('gnResourceData'), 'change_resourcebase') && !context.resourceHasPermission(state('gnResourceData'), 'delete_resourcebase') && !state('isNewResource') && !context.canCopyResource(state('gnResourceData'), state('user'))",
        {state: {
            isNewResource: false
        }, context: {
            resourceHasPermission: () => false,
            canCopyResource: () => false
        }}, true
    ],
    // double bang with logical operators is compatible, and it should work as well, even if it's not recommended for readability. The rule is to not transform the original rule, but just to transform the syntax, so the logic is preserved. If the original rule is too complex, it's better to refactor it in a simpler way, but it should not be rejected by the parser.
    ["!!(state('browser') && state('browser').mobile)",   {state: {browser: {mobile: true}}, context}, true],
    // very complex logic and combined strings
    [
        "!(context.resourceHasPermission(state('gnResourceData'), 'change_resourcebase') || context.resourceHasPermission(state('gnResourceData'), 'delete_resourcebase') || (context.canCopyResource(state('gnResourceData'), state('user')) && context.resourceHasPermission(state('gnResourceData'), 'download_resourcebase') && (state('isNewResource') || state('selectedLayerPermissions').includes('download_resourcebase'))))",
        {state: {
            isNewResource: false,
            selectedLayerPermissions: []

        }, context: {
            resourceHasPermission: () => false,
            canCopyResource: () => false
        }}, true
    ]
];

export const COMPATIBILITY_TESTS_AC = [

    [
        "(state('router') && state('router').includes('/geostory/shared') && state('geostorymode') !== 'edit')",
        {state: {
            router: '/geostory/shared',
            geostorymode: 'view'
        }, context},
        true, "includes with strings"],
    // NOT COMPATIBLE:
    // here need to use the function.
    // [ "{(item, index) => index}", {state, context}, RESULT], // ScaleBox template
    // --
    // request must be in context
    ["!(request.query && request.query.forceDrawer)", {
        state: {},
        context: {request: {query: {forceDrawer: true}}}
    }, false],
    [ "!state('userrole')", {state: {userrole: "ADMIN"}, context}, false]
];
