import { defineMessages } from 'react-intl';

export default defineMessages({
  destinationLabel: {
    id: 'Subscription.Destination.destinationLabel',
    description: 'destinationLabel',
    defaultMessage: 'Destination',
  },
  destinationDescription: {
    id: 'Subscription.Destination.destinationDescription',
    description: 'destinationDescription',
    defaultMessage: 'Messaging service to which the messages are sent.',
  },
  destinationAzureEventGrid: {
    id: 'Subscription.Destination.destinationAzureEventGrid',
    description: 'destinationDescription',
    defaultMessage: 'Azure Event Grid',
  },
  destinationAzureServiceBus: {
    id: 'Subscription.Destination.destinationAzureServiceBus',
    description: 'destinationDescription',
    defaultMessage: 'Azure Service Bus',
  },
  destinationAWSEventBridge: {
    id: 'Subscription.Destination.destinationEventBridge',
    description: 'destinationDescription',
    defaultMessage: 'AWS EventBridge',
  },
  destinationGoogleCloudPubSub: {
    id: 'Subscription.Destination.destinationGoogleCloudPubSub',
    description: 'destinationDescription',
    defaultMessage: 'Google Cloud Pub/Sub',
  },
  destinationSNS: {
    id: 'Subscription.Destination.destinationSns',
    description: 'destinationDescription',
    defaultMessage: 'AWS SNS',
  },
  destinationSQS: {
    id: 'Subscription.Destination.destinationSqs',
    description: 'destinationDescription',
    defaultMessage: 'AWS SQS',
  },
  destinationConfluentCloud: {
    id: 'Subscription.Destination.destinationConfluentCloud',
    description: 'destinationConfluentCloud',
    defaultMessage: 'Confluent Cloud',
  },
});
