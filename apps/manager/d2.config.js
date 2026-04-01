/** @type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    type: 'app',
    title: 'FlexiPortal Data Service Manager',
    entryPoints: {
        app: './src/App.tsx',
    },
    author: 'HISP Tanzania<dev@hisptanzania.org>',
    viteConfigExtensions: './viteConfigExtensions.mts',
}

module.exports = config
