import { defineMessages } from 'react-intl';

export default defineMessages({
  eventsLabel: {
    id: 'SubscriptionEventsForm.eventsLabel',
    description: 'Heading of the events section',
    defaultMessage: 'Choose Events you want to listen to.',
  },
  resourceTypeLabel: {
    id: 'SubscriptionEventsForm.resourceTypeLabel',
    description: 'Accordion header of one event group',
    defaultMessage: 'Events related to {label} ({amount}).',
  },
  allTypesLabel: {
    id: 'SubscriptionEventsForm.allTypesLabel',
    description:
      'Checkbox subscribing to every event of a resource (an entry without types)',
    defaultMessage: 'Receive all events of {label}',
  },
});
