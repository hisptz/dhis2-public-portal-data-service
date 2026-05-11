import i18n from '@dhis2/d2-i18n'

interface AppMenuItem {
    label: string
    icon?: string
    href?: string
    description: string
    action: string
}

export const appMenus: Array<AppMenuItem> = [
    {
        label: i18n.t('Connections'),
        href: '/connections',
        description: i18n.t(
            'Manage data service connections, including data sources and synchronization settings'
        ),
        action: i18n.t('Manage connections'),
    },
    {
        label: i18n.t('Metadata Migrations'),
        href: '/metadata-migrations',
        description: i18n.t(
            'Migrate metadata such as visualizations and maps from a source DHIS2 instance'
        ),
        action: i18n.t('Run metadata migration'),
    },
    {
        label: i18n.t('Data Migration'),
        href: '/data-migrations',
        description: i18n.t(
            'Migrate data values from a source DHIS2 instance to the portal'
        ),
        action: i18n.t('Run data migration'),
    },
    {
        label: i18n.t('Data Deletion'),
        href: '/data-deletions',
        description: i18n.t(
            'Delete data values for selected configurations and periods from the portal'
        ),
        action: i18n.t('Delete data'),
    },
    {
        label: i18n.t('Data Validation'),
        href: '/data-validations',
        description: i18n.t(
            'Validate data between the source DHIS2 instance and the portal'
        ),
        action: i18n.t('Validate data'),
    },
]
