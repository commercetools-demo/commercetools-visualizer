import { TFormValues } from '../subscription-details-form/subscription-details-form';
import {
  TCommercetoolsSubscription,
  TConfluentCloudDestination,
  TSubscriptionFormatInput,
} from '../../../types/generated/ctp';

type TKnownDestinationType = keyof NonNullable<TFormValues['destination']>;

const isKnownDestinationType = (
  destinationType: TFormValues['destinationType']
): destinationType is TKnownDestinationType =>
  destinationType === 'GoogleCloudPubSub' ||
  destinationType === 'SQS' ||
  destinationType === 'ConfluentCloud' ||
  destinationType === 'SNS' ||
  destinationType === 'EventBridge' ||
  destinationType === 'AzureServiceBus' ||
  destinationType === 'EventGrid';

// Maps the fetched destination into the shape the destination forms edit
// (`destination.<Type>.<field>`). Nulls (unset optional fields) become undefined, and
// Event Grid's `eventGridAccessKey` alias (see SubscriptionFragment) is renamed back to
// `accessKey`, which is what its form field is called.
export const convertSubscriptionDestinationToFormValue = (
  destination: TCommercetoolsSubscription['destination']
): TFormValues['destination'] => {
  const { __typename, type, ...config } = destination as Record<
    string,
    unknown
  >;
  void __typename;
  if (!isKnownDestinationType(type as string)) {
    return undefined;
  }
  const cleaned = Object.fromEntries(
    Object.entries(config).filter(([, value]) => value !== null)
  );
  if (type === 'EventGrid') {
    const { eventGridAccessKey, ...rest } = cleaned;
    return {
      EventGrid: { ...rest, accessKey: eventGridAccessKey },
    } as TFormValues['destination'];
  }
  return { [type as string]: cleaned } as TFormValues['destination'];
};

// Optional destination fields that the API treats as absent rather than empty.
const omitEmptyOptionalFields = <T extends object | undefined>(
  destinationType: TKnownDestinationType,
  config: T
): T => {
  if (destinationType === 'ConfluentCloud' && config) {
    const { key, ...rest } = config as TConfluentCloudDestination;
    return (key ? { ...rest, key } : rest) as T;
  }
  return config;
};

// Maps the fetched delivery format into the form's shape. Unknown formats are treated as
// the default (Platform).
export const convertSubscriptionFormatToFormValue = (
  format: TCommercetoolsSubscription['format'] | undefined | null
): TFormValues['format'] => {
  if (format?.type === 'CloudEvents') {
    return {
      type: 'CloudEvents',
      cloudEventsVersion: (format as { cloudEventsVersion?: string })
        .cloudEventsVersion,
    };
  }
  return { type: 'Platform' };
};

// The `format` of a SubscriptionDraft: Platform is the API default, so only CloudEvents is
// sent explicitly.
export const convertFormValuesToDraftFormat = (
  format: TFormValues['format']
): TSubscriptionFormatInput | undefined =>
  format?.type === 'CloudEvents'
    ? {
        CloudEvents: {
          cloudEventsVersion: format.cloudEventsVersion?.trim() || '',
        },
      }
    : undefined;

export const convertFormValuesToSubscription = (
  formValues: TFormValues
): Pick<
  TCommercetoolsSubscription,
  'key' | 'destination' | 'changes' | 'messages' | 'events'
> => {
  return {
    key: formValues.key,
    destination: {
      ...(isKnownDestinationType(formValues.destinationType)
        ? omitEmptyOptionalFields(
            formValues.destinationType,
            formValues.destination?.[formValues.destinationType]
          )
        : undefined),
      type: formValues.destinationType,
    },
    changes: formValues.changes || [],
    messages:
      formValues.messages?.map((message) => ({
        resourceTypeId: message.resourceTypeId,
        types: message.types || [],
      })) || [],
    events:
      formValues.events?.map((event) => ({
        resourceTypeId: event.resourceTypeId,
        types: event.types || [],
      })) || [],
  };
};
