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
        label: i18n.t('Data service configuration'),
        href: '/data-service-configuration',
        description: i18n.t(
            'Configure the data service for the web portal application, including data sources and synchronization settings'
        ),
        action: i18n.t('Configure data service'),
    },
]
