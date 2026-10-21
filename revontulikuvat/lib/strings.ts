// All customer-facing text on the sign-up page.
export const STRINGS = {
  tour: 'Northern Lights Tour',
  title: 'Get your northern lights photos',
  lead: "Leave your email and we'll send you the photos from tonight's tour.",
  group: 'Group',
  groupInput: 'Group number',
  groupHelp: "Ask your guide if you're not sure.",
  email: 'Email address',
  emailPlaceholder: 'name@example.com',
  submit: 'Send me my photos',
  sending: 'Sending…',
  privacy: 'We use your email only to send you the photos from this tour and delete it within {days} days.',
  privacyLink: 'Privacy policy',
  didYouMean: 'Did you mean {email}?',
  errEmail: 'Please check your email address.',
  errGroup: 'Please enter your group number.',
  errServer: 'Something went wrong. Please try again in a moment.',
  doneTitle: "You're all set!",
  doneText: "We'll send your photos to {email} within 48 hours. If you can't find them, please check your spam folder.",
  again: 'Add another email',
};

export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
