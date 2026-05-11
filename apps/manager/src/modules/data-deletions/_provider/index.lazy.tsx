import { createLazyFileRoute } from '@tanstack/react-router'
import i18n from '@dhis2/d2-i18n'
import { ConnectionPicker } from '@/shared/components/DataConfiguration/components/ConnectionPicker'

export const Route = createLazyFileRoute('/data-deletions/_provider/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <ConnectionPicker
            serviceLabel={i18n.t('Data Deletion')}
            serviceDescription={i18n.t(
                'Permanently delete data values from the portal for selected configurations and periods. This action is irreversible, use with care. Choose a connection to review past deletions or trigger a new one.'
            )}
            navigateTo="/data-deletions/$configId"
        />
    )
}
