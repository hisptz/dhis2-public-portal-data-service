import {
    DataServiceConfig,
    RunConfigFormValues,
    runConfigSchema,
} from '@/shared/schemas/data-service'
import {
    FormProvider,
    SubmitErrorHandler,
    useForm,
    useWatch,
} from 'react-hook-form'
import {
    Button,
    ButtonStrip,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    NoticeBox,
} from '@dhis2/ui'

import i18n from '@dhis2/d2-i18n'
import { PeriodSelector } from './components/PeriodSelector'
import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import { ConfigSelector } from './components/ConfigSelector'
import { useQueryClient } from '@tanstack/react-query'
import { RHFSingleSelectField } from '@hisptz/dhis2-ui'
import { RHFMultiSelectField } from '../../../../../Fields/RHFMultiSelectField'
import { SourceMetadataSelector } from './components/SourceMetadataSelector'
import { useNavigate } from '@tanstack/react-router'
import { useStartValidation } from '../../../../../DataConfiguration/components/Validationlogs/hooks/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    downloadMetadata,
    downloadData,
} from '@/shared/hooks/dataServiceClient'

export function RunConfigForm({
    hide,
    config,
    onClose,
    onRunComplete,
    preselectedService,
}: {
    config: DataServiceConfig
    hide: boolean
    onRunComplete: () => void
    onClose: () => void
    preselectedService?:
        | 'metadata-migration'
        | 'data-migration'
        | 'data-deletion'
        | 'data-validation'
}) {
    const queryClient = useQueryClient()
    const engine = useDataEngine()
    const navigate = useNavigate()
    const startValidation = useStartValidation(config.id, config)
    const { show, hide: hideAlert } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    )
    const form = useForm<RunConfigFormValues>({
        resolver: zodResolver(runConfigSchema),
        defaultValues: {
            service: preselectedService ?? 'metadata-migration',
            metadataSource: 'source',
            metadataTypes: [],
            selectedVisualizations: [],
            selectedMaps: [],
            selectedDashboards: [],
        },
    })

    const selectedService = useWatch({
        control: form.control,
        name: 'service',
    })
    const metadataSource = useWatch({
        control: form.control,
        name: 'metadataSource',
    })
    const metadataTypes = useWatch({
        control: form.control,
        name: 'metadataTypes',
    })

    const onSubmit = async (data: RunConfigFormValues) => {
        try {
            hideAlert()
            let resultMessage: string | undefined

            if (data.service === 'metadata-migration') {
                if (data.metadataSource === 'source') {
                    const res = await downloadMetadata({
                        engine,
                        configId: config.id,
                        data,
                    })
                    resultMessage = res.message
                }
                // TODO: handle flexiportal-config metadata source
            } else if (data.service === 'data-deletion') {
                const dataForDeletion = data as typeof data & {
                    dataItemsConfigIds: string[]
                    runtimeConfig: Record<string, unknown>
                }
                await downloadData(engine, config.id, {
                    dataItemsConfigIds: dataForDeletion.dataItemsConfigIds,
                    runtimeConfig: dataForDeletion.runtimeConfig,
                    isDelete: true,
                })
                resultMessage = i18n.t(
                    'Data deletion process started successfully. Check the queue for progress.'
                )
            } else if (data.service === 'data-validation') {
                const dataForValidation = data as typeof data & {
                    dataItemsConfigIds: string[]
                    runtimeConfig: { periods?: string[] } & Record<
                        string,
                        unknown
                    >
                }
                const selectedPeriods =
                    dataForValidation.runtimeConfig.periods ?? []
                if (selectedPeriods.length === 0) {
                    show({
                        message: i18n.t(
                            'Please select at least one period for validation'
                        ),
                        type: { critical: true },
                    })
                    return
                }

                const validationRequest = {
                    dataItemsConfigIds: dataForValidation.dataItemsConfigIds,
                    runtimeConfig: dataForValidation.runtimeConfig,
                }

                const selectedConfigs = (config.itemsConfig ?? []).filter(
                    (item) =>
                        dataForValidation.dataItemsConfigIds.includes(item.id)
                )
                const allDataElements = selectedConfigs.flatMap(
                    (configItem) => [
                        ...(configItem.dataElements ?? []),
                        ...(configItem.dataItems?.map((di) => di.id) ?? []),
                    ]
                )
                const allOrgUnits = selectedConfigs.map(
                    (configItem) => configItem.parentOrgUnitId
                )
                localStorage.setItem(
                    `validation-params-${config.id}`,
                    JSON.stringify({
                        ...validationRequest,
                        periods: selectedPeriods,
                        dataElements: allDataElements,
                        orgUnits: allOrgUnits,
                    })
                )
                await startValidation.mutateAsync(validationRequest)
                resultMessage = i18n.t(
                    'Data validation process started successfully. Redirecting to validation logs...'
                )
            } else {
                // data-migration
                const dataForMigration = data as typeof data & {
                    dataItemsConfigIds: string[]
                    runtimeConfig: Record<string, unknown>
                }
                await downloadData(engine, config.id, {
                    dataItemsConfigIds: dataForMigration.dataItemsConfigIds,
                    runtimeConfig: dataForMigration.runtimeConfig,
                })
            }

            queryClient.invalidateQueries({
                queryKey: ['data-service-logs', config.id],
            })
            queryClient.invalidateQueries({
                queryKey: ['config-status', config.id],
            })

            onRunComplete()
            show({
                message:
                    resultMessage ?? i18n.t('Service started successfully'),
                type: { success: true },
            })

            if (data.service === 'data-validation') {
                onClose()
                navigate({
                    to: '/data-validations/$configId/validation-logs',
                    params: { configId: config.id },
                })
            } else {
                onClose()
            }
        } catch (error) {
            console.error(error)
            const errorMessage =
                error instanceof Error ? error.message : String(error)
            show({
                message: `${i18n.t('Failed to start service')}: ${errorMessage}`,
                type: { critical: true },
            })
        }
    }
    const onError: SubmitErrorHandler<RunConfigFormValues> = (errors) => {
        console.error(errors)
        show({
            message: i18n.t(
                'There are errors with your form. Please fix them before submitting again'
            ),
            type: { critical: true },
        })
    }
    return (
        <FormProvider {...form}>
            <Modal hide={hide} onClose={onClose} position="middle">
                <ModalTitle>
                    {`${i18n.t('Run Service')} ${config.source.name}`}
                </ModalTitle>
                <ModalContent>
                    <form className="flex flex-col gap-2">
                        {selectedService === 'data-validation' && (
                            <NoticeBox
                                warning
                                title={i18n.t('Analytics Required')}
                            >
                                {i18n.t(
                                    'Please ensure analytics have been run before proceeding with validation. Running analytics ensures the data is up-to-date for accurate validation results.'
                                )}
                            </NoticeBox>
                        )}
                        {selectedService === 'data-deletion' && (
                            <NoticeBox
                                error
                                title={i18n.t('Destructive Operation')}
                            >
                                {i18n.t(
                                    'This operation will permanently delete all data files for the selected configuration items and periods. This action cannot be undone.'
                                )}
                            </NoticeBox>
                        )}
                        {!preselectedService && (
                            <RHFSingleSelectField
                                label={i18n.t('Service Type')}
                                name="service"
                                placeholder={i18n.t('Select service type')}
                                required
                                options={[
                                    {
                                        label: i18n.t('Metadata Migration'),
                                        value: 'metadata-migration',
                                    },
                                    {
                                        label: i18n.t('Data Migration'),
                                        value: 'data-migration',
                                    },
                                    {
                                        label: i18n.t('Data Validation'),
                                        value: 'data-validation',
                                    },
                                    {
                                        label: i18n.t('Data Deletion'),
                                        value: 'data-deletion',
                                    },
                                ]}
                            />
                        )}
                        {selectedService === 'metadata-migration' && (
                            <>
                                <RHFSingleSelectField
                                    name="metadataSource"
                                    label={i18n.t('Metadata Source')}
                                    placeholder={i18n.t(
                                        'Select metadata source'
                                    )}
                                    required
                                    options={[
                                        {
                                            label: i18n.t('Browse from Source'),
                                            value: 'source',
                                        },
                                        {
                                            label: i18n.t(
                                                'Extract from FlexiPortal Configuration'
                                            ),
                                            value: 'flexiportal-config',
                                        },
                                    ]}
                                />

                                {metadataSource === 'source' && (
                                    <>
                                        <RHFMultiSelectField
                                            name="metadataTypes"
                                            label={i18n.t('Metadata Types')}
                                            placeholder={i18n.t(
                                                'Select metadata types'
                                            )}
                                            required
                                            options={[
                                                {
                                                    label: i18n.t(
                                                        'Visualizations'
                                                    ),
                                                    value: 'visualizations',
                                                },
                                                {
                                                    label: i18n.t('Maps'),
                                                    value: 'maps',
                                                },
                                                // Currently not supported
                                                // {
                                                //     label: i18n.t('Dashboards'),
                                                //     value: 'dashboards',
                                                // },
                                            ]}
                                        />

                                        {metadataTypes?.includes(
                                            'visualizations'
                                        ) && (
                                            <SourceMetadataSelector
                                                name="selectedVisualizations"
                                                resourceType="visualizations"
                                                label={i18n.t(
                                                    'Select Visualizations'
                                                )}
                                                config={config}
                                                required
                                            />
                                        )}

                                        {metadataTypes?.includes('maps') && (
                                            <SourceMetadataSelector
                                                name="selectedMaps"
                                                resourceType="maps"
                                                label={i18n.t('Select Maps')}
                                                config={config}
                                                required
                                            />
                                        )}

                                        {metadataTypes?.includes(
                                            'dashboards'
                                        ) && (
                                            <SourceMetadataSelector
                                                name="selectedDashboards"
                                                resourceType="dashboards"
                                                label={i18n.t(
                                                    'Select Dashboards'
                                                )}
                                                config={config}
                                                required
                                            />
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        {selectedService !== 'metadata-migration' && (
                            <>
                                <PeriodSelector minPeriodType={'MONTHLY'} />
                                <ConfigSelector config={config} />
                            </>
                        )}
                    </form>
                </ModalContent>
                <ModalActions>
                    <ButtonStrip>
                        <Button onClick={onClose}>{i18n.t('Cancel')}</Button>
                        <Button
                            loading={form.formState.isSubmitting}
                            onClick={(_, e) =>
                                form.handleSubmit(onSubmit, onError)(e)
                            }
                            primary
                        >
                            {form.formState.isSubmitting
                                ? selectedService === 'data-deletion'
                                    ? i18n.t('Deleting data...')
                                    : i18n.t('Requesting run...')
                                : selectedService === 'data-deletion'
                                  ? i18n.t('Delete Data')
                                  : i18n.t('Run')}
                        </Button>
                    </ButtonStrip>
                </ModalActions>
            </Modal>
        </FormProvider>
    )
}
