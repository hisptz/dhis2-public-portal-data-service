import i18n from '@dhis2/d2-i18n'
import { SimpleDataTable, SimpleTableColumn } from '@hisptz/dhis2-ui'
import { useDataSources } from '../providers/DataSourcesProvider'
import { useRoutes } from '../hooks/useRoutes'
import { Button, IconLaunch16, Tooltip } from '@dhis2/ui'
import { useNavigate } from '@tanstack/react-router'
import { ModuleTitle } from '../../ModuleTitle'

const columns: SimpleTableColumn[] = [
    { label: i18n.t('Name'), key: 'name' },
    { label: i18n.t('Source URL'), key: 'url' },
    { label: i18n.t('Action'), key: 'action' },
]

export function ConnectionPicker({
    serviceLabel,
    serviceDescription,
    navigateTo,
}: {
    serviceLabel: string
    serviceDescription: string
    navigateTo: string
}) {
    const configurations = useDataSources()
    const { routes } = useRoutes()
    const navigate = useNavigate()

    const rows = configurations.map((config) => {
        const route = routes.find((r) => r.id === config.source.routeId)
        const url = route?.url?.replace('/api/**', '') || config.source.routeId

        return {
            id: config.id,
            name: config.source.name,
            url,
            action: (
                <Tooltip content={i18n.t('Select')}>
                    <Button
                        small
                        onClick={() =>
                            navigate({
                                to: navigateTo,
                                params: { configId: config.id },
                            })
                        }
                        icon={<IconLaunch16 />}
                    />
                </Tooltip>
            ),
        }
    })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <ModuleTitle title={serviceLabel} />
                <p className="text-sm text-gray-500 max-w-[70vw]">
                    {serviceDescription}
                </p>
            </div>
            <SimpleDataTable
                rows={rows}
                columns={columns}
                emptyLabel={i18n.t(
                    'No connections configured. Add one from the Connections page.'
                )}
            />
        </div>
    )
}
