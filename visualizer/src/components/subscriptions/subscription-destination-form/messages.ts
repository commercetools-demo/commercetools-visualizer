import { defineMessages } from 'react-intl';

export default defineMessages({
  destinationGoogleCloudPubSubTopic: {
    id: 'Subscription.Destination.destinationGoogleCloudPubSubTopic',
    description: 'destinationGoogleCloudPubSubTopic',
    defaultMessage: 'Name of the topic',
  },
  destinationGoogleCloudPubSubprojectId: {
    id: 'Subscription.Destination.destinationGoogleCloudPubSubprojectId',
    description: 'destinationGoogleCloudPubSubprojectId',
    defaultMessage:
      'ID of the Google Cloud project that contains the Pub/Sub topic',
  },
  destinationSQSAccessKey: {
    id: 'Subscription.Destination.destinationSQSAccessKey',
    description: 'destinationSQSAccessKey',
    defaultMessage: 'Destination SQS Access Key',
  },
  destinationSQSAccessSecret: {
    id: 'Subscription.Destination.destinationSQSAccessSecret',
    description: 'destinationSQSAccessSecret',
    defaultMessage: 'Destination SQS Secret',
  },
  destinationSQSQueueUrl: {
    id: 'Subscription.Destination.destinationSQSQueueUrl',
    description: 'destinationSQSQueueUrl',
    defaultMessage: 'URL of the Amazon SQS queue.',
  },
  destinationSQSRegion: {
    id: 'Subscription.Destination.destinationSQSRegion',
    description: 'destinationSQSRegion',
    defaultMessage: 'AWS Region the message queue is located in.',
  },
  destinationSQSAuthenticationMode: {
    id: 'Subscription.Destination.destinationSQSAuthenticationMode',
    description: 'destinationSQSAuthenticationMode',
    defaultMessage: 'Defines the method of authentication for the SQS queue.',
  },
});
