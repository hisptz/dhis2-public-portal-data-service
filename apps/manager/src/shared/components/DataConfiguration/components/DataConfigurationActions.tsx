import { Button, ButtonStrip } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { SubmitErrorHandler, useFormContext } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'
import { useAlert } from '@dhis2/app-runtime'
import { useUpdateDataSource } from '../hooks/save'
import { DataServiceConfig } from '@/shared/schemas/data-service'

export function DataConfigurationActions() {
    const navigate = useNavigate({
        from: '/connections/$configId/edit/',
    })

    const { handleSubmit, formState } = useFormContext<DataServiceConfig>()
    const { show } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    )

    const { save } = useUpdateDataSource()

    const onError: SubmitErrorHandler<DataServiceConfig> = (errors) => {
        console.error(errors)
        show({
            message: `${i18n.t('Could not save form, check the logs for more information')} `,
            type: { critical: true },
        })
    }

    return (
        <ButtonStrip end>
            <Button onClick={() => navigate({ to: '/connections' })}>
                {i18n.t('Cancel')}
            </Button>
            <Button
                primary
                disabled={!formState.isDirty}
                loading={formState.isSubmitting}
                onClick={(_, e) => handleSubmit(save, onError)(e)}
            >
                {i18n.t('Save changes')}
            </Button>
        </ButtonStrip>
    )
}
