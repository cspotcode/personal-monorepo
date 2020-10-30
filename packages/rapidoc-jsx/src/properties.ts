//
// This file is codegen-ed, then modified by hand.  Running build will overwrite this file.
//

/** */
export interface CodegenedPropertiesInterface {
  /**
   * Heading Text on top-left corner
   * HTML attribute: heading-text
   */
  headingText?: string;
  /**
   * Initial location on the document(identified by method and path) where you want to go after the spec is loaded.
   *
   * goto-path should be in the form of {method}-{path}
   *
   * for instance you want to scrollTo  GET /user/login
   * you should provide the location as  get-/user/login
   * HTML attribute: goto-path
   */
  gotoPath?: string;
  /**
   * url of the OpenAPI spec to view
   * HTML attribute: spec-url
   */
  specUrl?: string;
  /**
   * otherwise tags will be ordered based on how it is specified under the tags section in the spec.
   * HTML attribute: sort-tags
   */
  sortTags?: boolean;
  /**
   *
   * HTML attribute: sort-endpoints-by
   */
  sortEndpointsBy?: "path" | "method";
  /**
   *
   * HTML attribute: specFile
   */
  specFile?: string;
  /**
   * Layout helps in placement of request/response sections. In column layout, request & response sections are placed one below the other,
   * In row layout they are placed side by side.
   * This attribute is applicable only when the device width is more than 768px and the render-style  is 'view'.
   * HTML attribute: layout
   */
  layout?: "row" | "column";
  /**
   * determines display of api-docs. Currently there are two modes supported.
   * 'read' - more suitable for reading and 'view' more friendly for quick exploring
   * HTML attribute: render-style
   */
  renderStyle?: "read" | "view";
  /**
   * Two different ways to display object-schemas in the responses and request bodies
   * HTML attribute: schema-style
   */
  schemaStyle?: "tree" | "table";
  /**
   * The schemas are displayed in two tabs - Model and Example.
   * This option allows you to pick the default tab that you would like to be active
   * HTML attribute: default-schema-tab
   */
  defaultSchemaTab?: "model" | "example";
  /**
   * Schemas are expanded by default, use this attribute to control how many levels in the schema should be expanded
   * HTML attribute: schema-expand-level
   */
  schemaExpandLevel?: number;
  /**
   * Constraint and descriptions information of fields in the schema are collapsed to show only the first line.
   * Set it to true if you want them to fully expanded
   * HTML attribute: schema-description-expanded
   */
  schemaDescriptionExpanded?: boolean;
  /**
   * Use this value to control the height of response textarea
   * HTML attribute: response-area-height
   * valid css height value such as 400px, 50%, 60vh etc
   */
  responseAreaHeight?: string;
  /**
   * Name of the API key that will be send while trying out the APIs
   * HTML attribute: api-key-name
   */
  apiKeyName?: string;
  /**
   * determines how you want to send the api-key.
   * HTML attribute: api-key-location
   */
  apiKeyLocation?: 'header' | 'query';
  /**
   * Value of the API key that will be send while trying out the APIs.
   * This can also be provided/overwritten from UI.
   * HTML attribute: api-key-value
   */
  apiKeyValue?: string;
  /**
   * If you have multiple api-server listed in the spec, use this attribute to select the default API server, where all the API calls will goto.
   * This can be changed later from the UI
   * HTML attribute: default-api-server
   */
  defaultApiServerUrl?: string;
  /**
   * OpenAPI spec has a provision for providing the server url. The UI will list all the server URLs provided in the spec.
   * The user can then select one URL to which he or she intends to send API calls while trying out the apis.
   * However, if you want to provide an API server of your own which is not listed in the spec, you can use this property to provide one.
   * It is helpful in the cases where the same spec is shared between multiple environment say Dev and Test and each have their own API server.
   * HTML attribute: server-url
   */
  serverUrl?: string;
  /**
   *
   * HTML attribute: oauth-receiver
   */
  oauthReceiver?: string;
  /**
   * show/hide the header.
   * If you do not want your user to open any other api spec, other than the current one, then set this attribute to false
   * HTML attribute: show-header
   */
  showHeader?: string;
  /**
   * show/hide the documents info section
   * Info section contains information about the spec, such as the title and description of the spec, the version, terms of services etc.
   * In certain situation you may not need to show this section. For instance you are embedding this element inside a another help document.
   * Chances are, the help doc may already have this info, in that case you may want to hide this section.
   * HTML attribute: show-info
   */
  showInfo?: string;
  /**
   * Authentication feature, allows the user to select one of the authentication mechanism thats available in the spec.
   * It can be http-basic, http-bearer or api-key.
   * If you do not want your users to go through the authentication process, instead want them to use a pre-generated api-key
   * then you may hide authentication section by setting this attribute to false
   * and provide the api-key details using various api-key-???? attributes.
   * HTML attribute: allow-authentication
   */
  allowAuthentication?: string;
  /**
   * The 'TRY' feature allows you to make REST calls to the API server.
   * To disable this feature, set it to false.
   * HTML attribute: allow-try
   */
  allowTry?: string;
  /**
   * If set to 'false', user will not be able to load any spec url from the UI.
   * HTML attribute: allow-spec-url-load
   */
  allowSpecUrlLoad?: string;
  /**
   * If set to 'false', user will not be able to load any spec file from the local drive.
   * This attribute is applicable only when the device width is more than 768px, else this feature is not available
   * HTML attribute: allow-spec-file-load
   */
  allowSpecFileLoad?: string;
  /**
   * Provides quick filtering of API
   * HTML attribute: allow-search
   */
  allowSearch?: string;
  /**
   * Provides advance search functionality, to search through API-paths, API-description, API-parameters and API-Responses
   * HTML attribute: allow-advance-search
   */
  allowAdvanceSearch?: string;
  /**
   * If set to 'false', user will not be able to see or select API server (Server List will be hidden, however users will be able to see the server url near the 'TRY' button, to know in advance where the TRY will send the request).
   * The URL specified in the server-url attribute will be used if set, else the first server in the API specification file will be used.
   * HTML attribute: allow-server-selection
   */
  allowServerSelection?: string;
  /**
   * show/hide the components section both in document and menu
   *
   * Will show the components section along with schemas, responses, examples, requestBodies, headers, securitySchemes, links and callbacks
   * Also will be shown in the menu on the left (in read mode)
   * HTML attribute: show-components
   */
  showComponents?: string;
  /**
   * Is the base theme, which is used for calculating colors for various UI components.
   * 'theme', 'bg-color' and 'text-color' are the base attributes for generating a custom theme
   * HTML attribute: theme
   */
  theme?: "light" | "dark";
  /**
   * Hex color code for main background
   * HTML attribute: bg-color
   */
  bgColor?: string;
  /**
   * Hex color code for text
   * HTML attribute: text-color
   */
  textColor?: string;
  /**
   * Hex color code for the header's background
   * HTML attribute: header-color
   */
  headerColor?: string;
  /**
   * Hex color code on various controls such as buttons, tabs
   * HTML attribute: primary-color
   */
  primaryColor?: string;
  /**
   * sets the relative font sizes for the entire document
   * HTML attribute: font-size
   */
  fontSize?: "default" | "large" | "largest";
  /**
   * Font Name(s) to be used for regular text
   * HTML attribute: regular-font
   */
  regularFont?: string;
  /**
   * Font Name(s) to be used for mono-spaced text
   * HTML attribute: mono-font
   */
  monoFont?: string;
  /**
   * Navigation bar's background color
   * HTML attribute: nav-bg-color
   */
  navBgColor?: string;
  /**
   * URL of navigation bar's background image
   * HTML attribute: nav-bg-image
   */
  navBgImage?: string;
  /**
   * navigation bar's background image size (same as css background-size property)
   * HTML attribute: nav-bg-image-size
   */
  navBgImageSize?:
    | "auto"
    | "length"
    | "cover"
    | "contain"
    | "initial"
    | "inherit";
  /**
   * navigation bar's background image repeat (same as css background-repeat property)
   * HTML attribute: nav-bg-image-repeat
   */
  navBgImageRepeat?:
    | "repeat"
    | "repeat-x"
    | "repeat-y"
    | "no-repeat"
    | "initial"
    | "inherit";
  /**
   * Navigation bar's Text color
   * HTML attribute: nav-text-color
   */
  navTextColor?: string;
  /**
   * background color of the navigation item on mouse-over
   * HTML attribute: nav-hover-bg-color
   */
  navHoverBgColor?: string;
  /**
   * text color of the navigation item on mouse-over
   * HTML attribute: nav-hover-text-color
   */
  navHoverTextColor?: string;
  /**
   * Current selected item indicator
   * HTML attribute: nav-accent-color
   */
  navAccentColor?: string;
  /**
   * Controls navigation item spacing
   * HTML attribute: nav-item-spacing
   */
  navItemSpacing?: "default" | "compact" | "relaxed";
  /**
   * set true to show API paths in the navigation bar instead of summary/description
   * HTML attribute: use-path-in-nav-bar
   */
  usePathInNavBar?: boolean;
  /**
   * Include headers from info -> description section to the Navigation bar (applies to read mode only)
   *
   * Will get the headers from the markdown in info - description (h1 and h2) into the menu on the left (in read mode) along with links to them.
   * This option allows users to add navigation bar items using Markdown
   * HTML attribute: info-description-headings-in-navbar
   */
  infoDescriptionHeadingsInNavBar?: string;
  /**
   *
   * HTML attribute: match-paths
   */
  matchPaths?: string;
}
/** */
export interface CodegenedAttributesInterface {
  /**
   * Heading Text on top-left corner
   * HTML attribute: heading-text
   */
  "heading-text"?: string;
  /**
   * Initial location on the document(identified by method and path) where you want to go after the spec is loaded.
   *
   * goto-path should be in the form of {method}-{path}
   *
   * for instance you want to scrollTo  GET /user/login
   * you should provide the location as  get-/user/login
   * HTML attribute: goto-path
   */
  "goto-path"?: string;
  /**
   * url of the OpenAPI spec to view
   * HTML attribute: spec-url
   */
  "spec-url"?: string;
  /**
   * otherwise tags will be ordered based on how it is specified under the tags section in the spec.
   * HTML attribute: sort-tags
   */
  "sort-tags"?: boolean;
  /**
   *
   * HTML attribute: sort-endpoints-by
   */
  "sort-endpoints-by"?: "path" | "method";
  /**
   *
   * HTML attribute: specFile
   */
  specFile?: string;
  /**
   * Layout helps in placement of request/response sections. In column layout, request & response sections are placed one below the other,
   * In row layout they are placed side by side.
   * This attribute is applicable only when the device width is more than 768px and the render-style  is 'view'.
   * HTML attribute: layout
   */
  layout?: "row" | "column";
  /**
   * determines display of api-docs. Currently there are two modes supported.
   * 'read' - more suitable for reading and 'view' more friendly for quick exploring
   * HTML attribute: render-style
   */
  "render-style"?: "read" | "view";
  /**
   * Two different ways to display object-schemas in the responses and request bodies
   * HTML attribute: schema-style
   */
  "schema-style"?: "tree" | "table";
  /**
   * The schemas are displayed in two tabs - Model and Example.
   * This option allows you to pick the default tab that you would like to be active
   * HTML attribute: default-schema-tab
   */
  "default-schema-tab"?: "model" | "example";
  /**
   * Schemas are expanded by default, use this attribute to control how many levels in the schema should be expanded
   * HTML attribute: schema-expand-level
   */
  "schema-expand-level"?: number;
  /**
   * Constraint and descriptions information of fields in the schema are collapsed to show only the first line.
   * Set it to true if you want them to fully expanded
   * HTML attribute: schema-description-expanded
   */
  "schema-description-expanded"?: boolean;
  /**
   * Use this value to control the height of response textarea
   * Allowed: valid css height value such as 400px, 50%, 60vh etc
   * HTML attribute: response-area-height
   */
  "response-area-height"?: string;
  /**
   * Name of the API key that will be send while trying out the APIs
   * HTML attribute: api-key-name
   */
  "api-key-name"?: string;
  /**
   * determines how you want to send the api-key.
   * HTML attribute: api-key-location
   */
  "api-key-location"?: "header" | "query";
  /**
   * Value of the API key that will be send while trying out the APIs.
   * This can also be provided/overwritten from UI.
   * HTML attribute: api-key-value
   */
  "api-key-value"?: string;
  /**
   * If you have multiple api-server listed in the spec, use this attribute to select the default API server, where all the API calls will goto.
   * This can be changed later from the UI
   * HTML attribute: default-api-server
   */
  "default-api-server"?: string;
  /**
   * OpenAPI spec has a provision for providing the server url. The UI will list all the server URLs provided in the spec.
   * The user can then select one URL to which he or she intends to send API calls while trying out the apis.
   * However, if you want to provide an API server of your own which is not listed in the spec, you can use this property to provide one.
   * It is helpful in the cases where the same spec is shared between multiple environment say Dev and Test and each have their own API server.
   * HTML attribute: server-url
   */
  "server-url"?: string;
  /**
   *
   * HTML attribute: oauth-receiver
   */
  "oauth-receiver"?: string;
  /**
   * show/hide the header.
   * If you do not want your user to open any other api spec, other than the current one, then set this attribute to false
   * HTML attribute: show-header
   */
  "show-header"?: string;
  /**
   * show/hide the documents info section
   * Info section contains information about the spec, such as the title and description of the spec, the version, terms of services etc.
   * In certain situation you may not need to show this section. For instance you are embedding this element inside a another help document.
   * Chances are, the help doc may already have this info, in that case you may want to hide this section.
   * HTML attribute: show-info
   */
  "show-info"?: string;
  /**
   * Authentication feature, allows the user to select one of the authentication mechanism thats available in the spec.
   * It can be http-basic, http-bearer or api-key.
   * If you do not want your users to go through the authentication process, instead want them to use a pre-generated api-key
   * then you may hide authentication section by setting this attribute to false
   * and provide the api-key details using various api-key-???? attributes.
   * HTML attribute: allow-authentication
   */
  "allow-authentication"?: string;
  /**
   * The 'TRY' feature allows you to make REST calls to the API server.
   * To disable this feature, set it to false.
   * HTML attribute: allow-try
   */
  "allow-try"?: string;
  /**
   * If set to 'false', user will not be able to load any spec url from the UI.
   * HTML attribute: allow-spec-url-load
   */
  "allow-spec-url-load"?: string;
  /**
   * If set to 'false', user will not be able to load any spec file from the local drive.
   * This attribute is applicable only when the device width is more than 768px, else this feature is not available
   * HTML attribute: allow-spec-file-load
   */
  "allow-spec-file-load"?: string;
  /**
   * Provides quick filtering of API
   * HTML attribute: allow-search
   */
  "allow-search"?: string;
  /**
   * Provides advance search functionality, to search through API-paths, API-description, API-parameters and API-Responses
   * HTML attribute: allow-advance-search
   */
  "allow-advance-search"?: string;
  /**
   * If set to 'false', user will not be able to see or select API server (Server List will be hidden, however users will be able to see the server url near the 'TRY' button, to know in advance where the TRY will send the request).
   * The URL specified in the server-url attribute will be used if set, else the first server in the API specification file will be used.
   * HTML attribute: allow-server-selection
   */
  "allow-server-selection"?: string;
  /**
   * show/hide the components section both in document and menu
   *
   * Will show the components section along with schemas, responses, examples, requestBodies, headers, securitySchemes, links and callbacks
   * Also will be shown in the menu on the left (in read mode)
   * HTML attribute: show-components
   */
  "show-components"?: string;
  /**
   * Is the base theme, which is used for calculating colors for various UI components.
   * 'theme', 'bg-color' and 'text-color' are the base attributes for generating a custom theme
   * HTML attribute: theme
   */
  theme?: "light" | "dark";
  /**
   * Hex color code for main background
   * HTML attribute: bg-color
   */
  "bg-color"?: string;
  /**
   * Hex color code for text
   * HTML attribute: text-color
   */
  "text-color"?: string;
  /**
   * Hex color code for the header's background
   * HTML attribute: header-color
   */
  "header-color"?: string;
  /**
   * Hex color code on various controls such as buttons, tabs
   * HTML attribute: primary-color
   */
  "primary-color"?: string;
  /**
   * sets the relative font sizes for the entire document
   * HTML attribute: font-size
   */
  "font-size"?: "default" | "large" | "largest";
  /**
   * Font Name(s) to be used for regular text
   * HTML attribute: regular-font
   */
  "regular-font"?: string;
  /**
   * Font Name(s) to be used for mono-spaced text
   * HTML attribute: mono-font
   */
  "mono-font"?: string;
  /**
   * Navigation bar's background color
   * HTML attribute: nav-bg-color
   */
  "nav-bg-color"?: string;
  /**
   * URL of navigation bar's background image
   * HTML attribute: nav-bg-image
   */
  "nav-bg-image"?: string;
  /**
   * navigation bar's background image size (same as css background-size property)
   * HTML attribute: nav-bg-image-size
   */
  "nav-bg-image-size"?:
    | "auto"
    | "length"
    | "cover"
    | "contain"
    | "initial"
    | "inherit";
  /**
   * navigation bar's background image repeat (same as css background-repeat property)
   * HTML attribute: nav-bg-image-repeat
   */
  "nav-bg-image-repeat"?:
    | "repeat"
    | "repeat-x"
    | "repeat-y"
    | "no-repeat"
    | "initial"
    | "inherit";
  /**
   * Navigation bar's Text color
   * HTML attribute: nav-text-color
   */
  "nav-text-color"?: string;
  /**
   * background color of the navigation item on mouse-over
   * HTML attribute: nav-hover-bg-color
   */
  "nav-hover-bg-color"?: string;
  /**
   * text color of the navigation item on mouse-over
   * HTML attribute: nav-hover-text-color
   */
  "nav-hover-text-color"?: string;
  /**
   * Current selected item indicator
   * HTML attribute: nav-accent-color
   */
  "nav-accent-color"?: string;
  /**
   * Controls navigation item spacing
   * HTML attribute: nav-item-spacing
   */
  "nav-item-spacing"?: "default" | "compact" | "relaxed";
  /**
   * set true to show API paths in the navigation bar instead of summary/description
   * HTML attribute: use-path-in-nav-bar
   */
  "use-path-in-nav-bar"?: boolean;
  /**
   * Include headers from info -> description section to the Navigation bar (applies to read mode only)
   *
   * Will get the headers from the markdown in info - description (h1 and h2) into the menu on the left (in read mode) along with links to them.
   * This option allows users to add navigation bar items using Markdown
   * HTML attribute: info-description-headings-in-navbar
   */
  "info-description-headings-in-navbar"?: string;
  /**
   *
   * HTML attribute: match-paths
   */
  "match-paths"?: string;
}

export const propertyToAttributeMapping = {
  headingText: "heading-text",
  gotoPath: "goto-path",
  specUrl: "spec-url",
  sortTags: "sort-tags",
  sortEndpointsBy: "sort-endpoints-by",
  specFile: "specFile",
  layout: "layout",
  renderStyle: "render-style",
  schemaStyle: "schema-style",
  defaultSchemaTab: "default-schema-tab",
  schemaExpandLevel: "schema-expand-level",
  schemaDescriptionExpanded: "schema-description-expanded",
  responseAreaHeight: "response-area-height",
  apiKeyName: "api-key-name",
  apiKeyLocation: "api-key-location",
  apiKeyValue: "api-key-value",
  defaultApiServerUrl: "default-api-server",
  serverUrl: "server-url",
  oauthReceiver: "oauth-receiver",
  showHeader: "show-header",
  showInfo: "show-info",
  allowAuthentication: "allow-authentication",
  allowTry: "allow-try",
  allowSpecUrlLoad: "allow-spec-url-load",
  allowSpecFileLoad: "allow-spec-file-load",
  allowSearch: "allow-search",
  allowAdvanceSearch: "allow-advance-search",
  allowServerSelection: "allow-server-selection",
  showComponents: "show-components",
  theme: "theme",
  bgColor: "bg-color",
  textColor: "text-color",
  headerColor: "header-color",
  primaryColor: "primary-color",
  fontSize: "font-size",
  regularFont: "regular-font",
  monoFont: "mono-font",
  navBgColor: "nav-bg-color",
  navBgImage: "nav-bg-image",
  navBgImageSize: "nav-bg-image-size",
  navBgImageRepeat: "nav-bg-image-repeat",
  navTextColor: "nav-text-color",
  navHoverBgColor: "nav-hover-bg-color",
  navHoverTextColor: "nav-hover-text-color",
  navAccentColor: "nav-accent-color",
  navItemSpacing: "nav-item-spacing",
  usePathInNavBar: "use-path-in-nav-bar",
  infoDescriptionHeadingsInNavBar: "info-description-headings-in-navbar",
  matchPaths: "match-paths",
};
