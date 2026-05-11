import { createLazyFileRoute } from '@tanstack/react-router'
import i18n from '@dhis2/d2-i18n'
import { ConnectionPicker } from '@/shared/components/DataConfiguration/components/ConnectionPicker'

export const Route = createLazyFileRoute('/metadata-migrations/_provider/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <ConnectionPicker
            serviceLabel={i18n.t('Metadata Migrations')}
            serviceDescription={i18n.t(
                'Migrate visualizations, maps, and dashboards from a source DHIS2 instance to the portal. Choose a connection to view past runs or trigger a new migration.'
            )}
            navigateTo="/metadata-migrations/$configId"
        />
    )
}
