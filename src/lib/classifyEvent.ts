// Tags a Bevy event by its title. Only the main DevFest is a conference
// ("DevFest Extended" events are regular events that borrow the name), and most
// events have several speakers, so anything unmatched is just an "Event".
export function classifyEvent(title: string): { label: string; accent: string } {
  if (/devfest/i.test(title) && !/extended/i.test(title)) return { label: 'Conference', accent: 'red' };
  if (/meetup/i.test(title)) return { label: 'Meetup', accent: 'yellow' };
  if (/workshop/i.test(title)) return { label: 'Workshop', accent: 'green' };
  return { label: 'Event', accent: 'blue' };
}
