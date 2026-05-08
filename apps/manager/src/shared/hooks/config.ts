import { FetchError, useDataEngine } from '@dhis2/app-runtime'
import { useCallback } from 'react'
import { DateTime } from 'luxon'

export function formatDateTime(value?: string | null) {
    if (!value) {
        return '-'
    }
    const dt = DateTime.fromISO(value)
    if (!dt.isValid) {
        return '-'
    }
    return `${dt.toLocal().toFormat('dd LLL yyyy, HH:mm')}`
}

function generateCreateConfigMutation({
    namespace,
    key,
}: {
    namespace: string
    key: string
}) {
    return {
        type: 'create' as const,
        resource: `dataStore/${namespace}/${key}`,
        data: ({ data }: { data: Record<string, unknown> }) => data,
    }
}

export interface CreateStatus {
    status: 'created' | 'exists' | 'error'
    message?: string
    label: string
}

export function useInitializeConfig() {
    const engine = useDataEngine()

    const initializeConfig = useCallback(
        async function initializeConfig<T extends object = object>({
            namespace,
            key,
            data,
            label,
        }: {
            namespace: string
            key: string
            label: string
            data: T
        }): Promise<CreateStatus> {
            const mutation = generateCreateConfigMutation({ namespace, key })
            try {
                await engine.mutate(mutation, {
                    variables: {
                        data,
                    },
                })
                return {
                    status: 'created',
                    label,
                }
            } catch (e) {
                if (e instanceof FetchError) {
                    if (e.details.httpStatusCode === 409) {
                        return {
                            status: 'exists',
                            label,
                        }
                    } else {
                        return {
                            status: 'error',
                            message: e.message,
                            label,
                        }
                    }
                } else {
                    return {
                        status: 'error',
                        message: e.message,
                        label,
                    }
                }
            }
        },
        [engine]
    )

    return {
        initializeConfig,
    }
}
