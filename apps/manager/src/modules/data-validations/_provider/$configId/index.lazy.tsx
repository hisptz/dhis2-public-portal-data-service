import {
    createLazyFileRoute,
    useNavigate,
    useParams,
} from '@tanstack/react-router'
import { Button, IconArrowLeft24, IconInfo24 } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { RunConfiguration } from '@/shared/components/DataConfiguration/components/RunConfiguration/RunConfiguration'
import { useDataSources } from '@/shared/components/DataConfiguration/providers/DataSourcesProvider'
import { PageHeader } from '@/shared/components/PageHeader'
import { useQueryClient } from '@tanstack/react-query'
import { FormTestConnection } from '@/shared/components/DataConfiguration/components/FormTestConnection'
import { useRoutes } from '@/shared/components/DataConfiguration/hooks/useRoutes'

export const Route = createLazyFileRoute(
    '/data-validations/_provider/$configId/'
)({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()
    const { configId } = useParams({
        from: '/data-validations/_provider/$configId/',
    })
    const queryClient = useQueryClient()

    const configurations = useDataSources()
    const config = configurations.find((c) => c.id === configId)

    const { routes } = useRoutes()
    const route = routes.find((r) => r.id === config?.source?.routeId)
    const url = route?.url?.replace('/api/**', '') ?? ''

    return (
        <div className="h-full w-full flex flex-col gap-4">
            <div className="pb-2">
                <Button
                    onClick={() => navigate({ to: '/data-validations' })}
                    icon={<IconArrowLeft24 />}
                >
                    {i18n.t('Back')}
                </Button>
            </div>
            <PageHeader
                title={config?.source?.name ?? configId}
                subTitle={
                    config ? (
                        <FormTestConnection
                            routeConfig={{
                                name: config.source.name,
                                id: config.source.routeId,
                                url,
                            }}
                        />
                    ) : undefined
                }
                actions={
                    config ? (
                        <RunConfiguration
                            label={i18n.t('Run Validation')}
                            config={config}
                            preselectedService="data-validation"
                            onRunComplete={() => {
                                queryClient.invalidateQueries({
                                    queryKey: ['data-service-logs', configId],
                                })
                            }}
                        />
                    ) : undefined
                }
            />
            <div className="flex-1 flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-gray-300 p-12 text-center">
                <IconInfo24 />
                <div className="flex flex-col gap-1">
                    <p className="text-base font-semibold text-gray-700">
                        {i18n.t('Validation history is not yet supported')}
                    </p>
                    <p className="text-sm text-gray-500">
                        {i18n.t(
                            'Use the "Run Validation" button to start a new data validation. Results will open in the validation logs view.'
                        )}
                    </p>
                </div>
            </div>
        </div>
    )
}
