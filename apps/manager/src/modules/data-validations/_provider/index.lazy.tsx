import { createLazyFileRoute } from '@tanstack/react-router'
import i18n from '@dhis2/d2-i18n'
import { ConnectionPicker } from '@/shared/components/DataConfiguration/components/ConnectionPicker'

export const Route = createLazyFileRoute('/data-validations/_provider/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <ConnectionPicker
            serviceLabel={i18n.t('Data Validation')}
            serviceDescription={i18n.t(
                'Compare data between a source DHIS2 instance and the portal to identify discrepancies. Ensure analytics are up-to-date before running. Choose a connection to start a validation.'
            )}
            navigateTo="/data-validations/$configId"
        />
    )
}
