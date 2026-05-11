import {
    createLazyFileRoute,
    useNavigate,
    useParams,
} from '@tanstack/react-router'
import { Button, ButtonStrip, IconArrowLeft24 } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { RunConfiguration } from '@/shared/components/DataConfiguration/components/RunConfiguration/RunConfiguration'
import { RunList } from '@/shared/components/DataConfiguration/components/RunList/RunList'
import { useConfigurationRuns } from '@/shared/components/DataConfiguration/components/RunList/hooks/data'
import { useDataSources } from '@/shared/components/DataConfiguration/providers/DataSourcesProvider'
import { useRoutes } from '@/shared/components/DataConfiguration/hooks/useRoutes'
import { PageHeader } from '@/shared/components/PageHeader'
import { FormTestConnection } from '@/shared/components/DataConfiguration/components/FormTestConnection'

export const Route = createLazyFileRoute(
    '/data-deletions/_provider/$configId/'
)({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()
    const { configId } = useParams({
        from: '/data-deletions/_provider/$configId/',
    })

    const configurations = useDataSources()
    const { routes } = useRoutes()
    const config = configurations.find((c) => c.id === configId)
    const route = routes.find((r) => r.id === config?.source?.routeId)
    const url = route?.url?.replace('/api/**', '') ?? ''

    const { loading, runs, fetching, pagination, error, refetch } =
        useConfigurationRuns('data', configId)

    return (
        <div className="h-full w-full flex flex-col gap-4">
            <div>
                <Button
                    onClick={() => navigate({ to: '/data-deletions' })}
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
                        <ButtonStrip>
                            <RunConfiguration
                                label={i18n.t('Delete Data')}
                                config={config}
                                onRunComplete={refetch}
                                preselectedService="data-deletion"
                            />
                        </ButtonStrip>
                    ) : undefined
                }
            />
            <RunList
                loading={loading}
                runs={runs}
                activeTab="data"
                fetching={fetching}
                pagination={pagination}
                error={error}
                refetch={refetch}
                config={config}
            />
        </div>
    )
}
