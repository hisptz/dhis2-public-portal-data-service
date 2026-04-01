import prettierConfig from '@dhis2/config-prettier'

/**
 * @type {import("prettier").Config}
 */
const config = {
    ...prettierConfig,
    tabWidth: 4,
    singleQuote: true
}

export default config
