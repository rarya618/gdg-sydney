// Tags a Bevy event by its title. Only the main DevFest is a conference:
// "DevFest Extended" events borrow the DevFest name but are single talks.
export function classifyEvent(title: string): { label: string; accent: string } {
  if (/devfest/i.test(title) && !/extended/i.test(title)) return { label: 'Conference', accent: 'red' };
  if (/meetup/i.test(title)) return { label: 'Meetup', accent: 'yellow' };
  if (/workshop/i.test(title)) return { label: 'Workshop', accent: 'green' };
  return { label: 'Talk', accent: 'blue' };
}
