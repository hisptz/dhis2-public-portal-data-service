import { createLazyFileRoute } from '@tanstack/react-router'
import i18n from '@dhis2/d2-i18n'
import { ConnectionPicker } from '@/shared/components/DataConfiguration/components/ConnectionPicker'

export const Route = createLazyFileRoute('/data-migrations/_provider/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <ConnectionPicker
            serviceLabel={i18n.t('Data Migration')}
            serviceDescription={i18n.t(
                'Migrate data values from a source DHIS2 instance to the portal for selected configurations and periods. Choose a connection to view past runs or start a new migration.'
            )}
            navigateTo="/data-migrations/$configId"
        />
    )
}
