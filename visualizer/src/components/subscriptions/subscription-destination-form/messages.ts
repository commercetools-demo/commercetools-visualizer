import { defineMessages } from 'react-intl';

export default defineMessages({
  requiredFieldError: {
    id: 'Subscription.Destination.error.required',
    description: 'The error message for required destination fields',
    defaultMessage: 'This field is required. Provide a value.',
  },
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
  destinationConfluentCloudBootstrapServer: {
    id: 'Subscription.Destination.destinationConfluentCloudBootstrapServer',
    description: 'destinationSQSAuthenticationMode',
    defaultMessage:
      'URL to the bootstrap server including the port number in the format {cluster}.{region}.{provider}.confluent.cloud:9092.',
  },
  destinationConfluentCloudApiKey: {
    id: 'Subscription.Destination.destinationConfluentCloudApiKey',
    description: 'destinationSQSAuthenticationMode',
    defaultMessage: 'API Key to be used.',
  },
  destinationConfluentCloudApiSecret: {
    id: 'Subscription.Destination.destinationConfluentCloudApiSecret',
    description: 'destinationSQSAuthenticationMode',
    defaultMessage: 'API Secret to be used.',
  },
  destinationConfluentCloudAcks: {
    id: 'Subscription.Destination.destinationConfluentCloudAcks',
    description: 'destinationSQSAuthenticationMode',
    defaultMessage: 'The Kafka acks value. Can be "0", "1", or "all"',
  },

  destinationConfluentCloudTopic: {
    id: 'Subscription.Destination.destinationConfluentCloudTopic',
    description: 'destinationSQSAuthenticationMode',
    defaultMessage: 'The name of the topic.',
  },
  noMappingDefined: {
    id: 'Subscription.Destination.noMappingDefined',
    description: 'Shown for destination types with no configuration UI',
    defaultMessage: 'No mapping defined so far for {destinationType}',
  },
  configureGoogleCloudPubSubHeading: {
    id: 'Subscription.Destination.configureGoogleCloudPubSubHeading',
    description: 'Heading for the GCP Pub/Sub destination config form',
    defaultMessage: 'Configure GCP Pub/Sub Destination',
  },
  configureSQSHeading: {
    id: 'Subscription.Destination.configureSQSHeading',
    description: 'Heading for the AWS SQS destination config form',
    defaultMessage: 'Configure AWS SQS Destination',
  },
  configureConfluentCloudHeading: {
    id: 'Subscription.Destination.configureConfluentCloudHeading',
    description: 'Heading for the Confluent Cloud destination config form',
    defaultMessage: 'Configure Confluent Cloud Destination',
  },
  configureSNSHeading: {
    id: 'Subscription.Destination.configureSNSHeading',
    description: 'Heading for the AWS SNS destination config form',
    defaultMessage: 'Configure AWS SNS Destination',
  },
  destinationSNSTopicArn: {
    id: 'Subscription.Destination.destinationSNSTopicArn',
    description: 'destinationSNSTopicArn',
    defaultMessage: 'ARN of the Amazon SNS topic.',
  },
  destinationSNSAuthenticationMode: {
    id: 'Subscription.Destination.destinationSNSAuthenticationMode',
    description: 'destinationSNSAuthenticationMode',
    defaultMessage: 'Defines the method of authentication for the SNS topic.',
  },
  destinationSNSAccessKey: {
    id: 'Subscription.Destination.destinationSNSAccessKey',
    description: 'destinationSNSAccessKey',
    defaultMessage: 'Destination SNS Access Key',
  },
  destinationSNSAccessSecret: {
    id: 'Subscription.Destination.destinationSNSAccessSecret',
    description: 'destinationSNSAccessSecret',
    defaultMessage: 'Destination SNS Secret',
  },
  configureEventBridgeHeading: {
    id: 'Subscription.Destination.configureEventBridgeHeading',
    description: 'Heading for the AWS EventBridge destination config form',
    defaultMessage: 'Configure AWS EventBridge Destination',
  },
  destinationEventBridgeAccountId: {
    id: 'Subscription.Destination.destinationEventBridgeAccountId',
    description: 'destinationEventBridgeAccountId',
    defaultMessage: 'ID of the AWS account to which events are sent.',
  },
  destinationEventBridgeRegion: {
    id: 'Subscription.Destination.destinationEventBridgeRegion',
    description: 'destinationEventBridgeRegion',
    defaultMessage: 'AWS Region of the event bus.',
  },
  configureAzureServiceBusHeading: {
    id: 'Subscription.Destination.configureAzureServiceBusHeading',
    description: 'Heading for the Azure Service Bus destination config form',
    defaultMessage: 'Configure Azure Service Bus Destination',
  },
  destinationAzureServiceBusConnectionString: {
    id: 'Subscription.Destination.destinationAzureServiceBusConnectionString',
    description: 'destinationAzureServiceBusConnectionString',
    defaultMessage: 'Connection string of the Azure Service Bus queue/topic.',
  },
  configureAzureEventGridHeading: {
    id: 'Subscription.Destination.configureAzureEventGridHeading',
    description: 'Heading for the Azure Event Grid destination config form',
    defaultMessage: 'Configure Azure Event Grid Destination',
  },
  destinationAzureEventGridUri: {
    id: 'Subscription.Destination.destinationAzureEventGridUri',
    description: 'destinationAzureEventGridUri',
    defaultMessage: 'URI of the Azure Event Grid topic.',
  },
  destinationAzureEventGridAccessKey: {
    id: 'Subscription.Destination.destinationAzureEventGridAccessKey',
    description: 'destinationAzureEventGridAccessKey',
    defaultMessage: 'Access key of the Azure Event Grid topic.',
  },
});
