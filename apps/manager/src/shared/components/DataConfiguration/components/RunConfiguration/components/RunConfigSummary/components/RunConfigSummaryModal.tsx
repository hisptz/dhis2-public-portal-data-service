import {
    Button,
    ButtonStrip,
    CircularLoader,
    IconError24,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
} from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { RunConfigSummaryDetails } from './RunConfigSummaryDetails'
import type {
    DataRunDetails,
    MetadataRunDetails,
} from '@/shared/components/DataConfiguration/components/RunList/hooks/data'
import { useRunDetails } from '@/shared/components/DataConfiguration/components/RunList/RunDetails/hooks/data'
import { FetchError } from '@dhis2/app-runtime'
import { RunStatus } from '@/shared/components/DataConfiguration/components/RunStatus'
import { formatDateTime } from '@/shared/hooks/config'

function Content({
    runId,
    type,
    configId,
}: {
    runId: string
    type: 'metadata' | 'data'
    configId: string
}) {
    const { run, loading, error, downloadsPagination, uploadsPagination } =
        useRunDetails({ runId, type, configId })

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[600px] min-w-[700px]">
                <CircularLoader small />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full min-h-[600px] min-w-[700px]">
                <IconError24 />
                <span>{(error as FetchError).message}</span>
            </div>
        )
    }

    return (
        <>
            <ModalTitle>
                <div className="flex items-center gap-2 w-full justify-between">
                    <span>
                        {i18n.t('Run summary ')} -{' '}
                        {formatDateTime(run?.startedAt) ?? 'N/A'}
                    </span>
                    <RunStatus runId={runId} type={type} configId={configId} />
                </div>
            </ModalTitle>

            <ModalContent>
                <div className="flex flex-col gap-4 h-full min-h-[600px] min-w-[700px]">
                    <div className="flex flex-col gap-2">
                        <h6 className="text-lg font-bold">
                            {i18n.t('Summaries')}
                        </h6>

                        {run && (
                            <RunConfigSummaryDetails
                                run={
                                    run as unknown as
                                        | MetadataRunDetails
                                        | DataRunDetails
                                }
                                runType={type}
                                downloadsPagination={downloadsPagination}
                                uploadsPagination={uploadsPagination}
                                configId={configId}
                            />
                        )}
                    </div>
                </div>
            </ModalContent>
        </>
    )
}

export function RunConfigSummaryModal({
    hide,
    onClose,
    runId,
    type,
    configId,
}: {
    hide: boolean
    onClose: () => void
    runId: string
    type: 'metadata' | 'data'
    configId: string
}) {
    return (
        <Modal fluid hide={hide} onClose={onClose} position="middle">
            <Content runId={runId} type={type} configId={configId} />
            <ModalActions>
                <ButtonStrip>
                    <Button onClick={onClose}>{i18n.t('Dismiss')}</Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
