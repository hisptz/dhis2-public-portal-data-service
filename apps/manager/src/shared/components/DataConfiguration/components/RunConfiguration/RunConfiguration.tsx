import { Button, IconLaunch16, Tooltip } from '@dhis2/ui'

import { useBoolean } from 'usehooks-ts'
import { DataServiceConfig } from '@/shared/schemas/data-service'
import { RunConfigForm } from './components/RunConfigForm/RunConfigForm'
import i18n from '@dhis2/d2-i18n'

export function RunConfiguration({
    config,
    label,
    onRunComplete,
    preselectedService,
}: {
    config: DataServiceConfig
    label?: string
    onRunComplete: () => void
    preselectedService?:
        | 'metadata-migration'
        | 'data-migration'
        | 'data-deletion'
        | 'data-validation'
}) {
    const { value: hide, setTrue: onClose, setFalse: onShow } = useBoolean(true)
    return (
        <>
            {!hide && (
                <RunConfigForm
                    onRunComplete={onRunComplete}
                    config={config}
                    hide={hide}
                    onClose={onClose}
                    preselectedService={preselectedService}
                />
            )}
            <Tooltip content={i18n.t('Run configuration')}>
                <Button icon={<IconLaunch16 />} onClick={onShow} small={!label}>
                    {label}
                </Button>
            </Tooltip>
        </>
    )
}
