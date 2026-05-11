import { createFileRoute, Outlet } from '@tanstack/react-router'
import { DataSourcesProvider } from '@/shared/components/DataConfiguration/providers/DataSourcesProvider'
import { PollingProvider } from '@/shared/components/DataConfiguration/providers/PollingProvider'

export const Route = createFileRoute('/data-migrations/_provider')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <DataSourcesProvider>
            <PollingProvider>
                <Outlet />
            </PollingProvider>
        </DataSourcesProvider>
    )
}
