import config from '@dhis2/config-eslint'
import { defineConfig } from 'eslint/config'
import { includeIgnoreFile } from '@eslint/compat'
import { fileURLToPath } from 'node:url'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

export default defineConfig([
    includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
    {
        extends: [config],
    },
    {
        rules: {
            // eslint-plugin-import v2 has false positives and crashes on ESLint v10
            'import/order': 'off',
            'import/named': 'off',
            'max-params': 'off',
        },
    },
])
