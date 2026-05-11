import { SimpleDataTable, SimpleTableColumn, useDialog } from '@hisptz/dhis2-ui'
import { useDataSources } from '../providers/DataSourcesProvider'
import { useEffect } from 'react'
import i18n from '@dhis2/d2-i18n'
import { AddDataSource } from './AddDataSource'
import { useRoutes } from '../hooks/useRoutes'
import {
    Button,
    ButtonStrip,
    IconDelete16,
    IconSettings16,
    Tooltip,
} from '@dhis2/ui'
import { useNavigate } from '@tanstack/react-router'
import { useDeleteDataSource } from '../hooks/save'
import { ConfigStatus } from './RunStatus'
import { DataServiceConfig } from '@/shared/schemas/data-service'

const columns: SimpleTableColumn[] = [
    {
        label: i18n.t('Name'),
        key: 'name',
    },
    {
        label: i18n.t('Source URL'),
        key: 'url',
    },
    {
        label: i18n.t('Latest Migration Status'),
        key: 'status',
    },
    {
        label: i18n.t('Actions'),
        key: 'actions',
    },
]

export function ConfigurationList() {
    const configurations = useDataSources()
    const { routes, refetch: refetchRoutes } = useRoutes()
    const navigate = useNavigate({ from: '/connections/' })
    const { confirm } = useDialog()
    const { deleteConfig } = useDeleteDataSource()

    const handleDelete = (config: DataServiceConfig) => {
        confirm({
            title: i18n.t('Delete connection'),
            message: (
                <span>
                    {i18n.t('Are you sure you want to delete')}{' '}
                    <b>{config.source.name}</b>?{' '}
                    {i18n.t('This action cannot be undone.')}
                </span>
            ),
            onConfirm: async () => {
                await deleteConfig(config)
            },
            confirmButtonText: i18n.t('Delete'),
            confirmButtonColor: 'destructive',
        })
    }

    useEffect(() => {
        refetchRoutes()
    }, [configurations.length, refetchRoutes])

    const rows = configurations.map((configuration) => {
        const route = routes.find((r) => r.id === configuration.source.routeId)
        const url =
            route?.url?.replace('/api/**', '') || configuration.source.routeId

        return {
            ...configuration,
            name: configuration.source.name,
            url,
            status: <ConfigStatus configId={configuration.id} />,
            actions: (
                <ButtonStrip>
                    <Tooltip content={i18n.t('Configure')}>
                        <Button
                            small
                            secondary
                            onClick={() =>
                                navigate({
                                    to: '/connections/$configId/edit',
                                    params: { configId: configuration.id },
                                })
                            }
                            icon={<IconSettings16 />}
                        />
                    </Tooltip>
                    <Tooltip content={i18n.t('Delete connection')}>
                        <Button
                            small
                            secondary
                            onClick={() => handleDelete(configuration)}
                            icon={<IconDelete16 color="red" />}
                        />
                    </Tooltip>
                </ButtonStrip>
            ),
        }
    })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-gray-500 max-w-[70vw]">
                    {i18n.t(
                        'Manage DHIS2 source connections. Each connection is used across all migration and validation services.'
                    )}
                </p>
                <AddDataSource />
            </div>
            <SimpleDataTable
                rows={rows}
                emptyLabel={i18n.t(
                    'No connections configured yet. Add a connection to get started.'
                )}
                columns={columns}
            />
        </div>
    )
}
