export interface EventItem {
  id: string;
  month: string;
  day: string;
  year: string;
  title: string;
  desc: string;
  time: string;
  location: string;
  pickupAvailable?: boolean;
}

export const UPCOMING_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    month: 'Oct',
    day: '10',
    year: '2026',
    title: "Desert West Farmers' Market",
    desc: 'Join us at Estrella Mountain Community College for fresh hand-stirred kettle corn alongside dozens of local Arizona makers.',
    time: '9:00 am - 1:00 pm',
    location: 'Avondale, AZ 85392',
    pickupAvailable: true,
  },
  {
    id: 'evt-2',
    month: 'Oct',
    day: '17-18',
    year: '2026',
    title: 'Oro Valley Fine Art & Wine Festival',
    desc: 'Located north of Tucson against the Catalina Mountains. Featuring fine arts, signature wines, and hot kettle corn.',
    time: '10:00 am - 5:00 pm',
    location: 'James D. Kriegh Park, Oro Valley, AZ',
    pickupAvailable: true,
  },
  {
    id: 'evt-3',
    month: 'Oct',
    day: '24-25',
    year: '2026',
    title: 'High Street Arts Festival',
    desc: 'Local artisans, live music, and freshly popped gourmet kettle corn. A perfect weekend outing for the whole family.',
    time: '10:00 am - 5:00 pm',
    location: 'Desert Ridge Marketplace, Phoenix, AZ',
    pickupAvailable: true,
  },
  {
    id: 'evt-4',
    month: 'Nov',
    day: '07-08',
    year: '2026',
    title: 'Litchfield Park Fall Art & Wine Festival',
    desc: 'Located in scenic Litchfield Square Park. Browse local art and pick up your pre-ordered Royal Bags fresh from the kettle.',
    time: '10:00 am - 4:00 pm',
    location: 'Litchfield Park Square, AZ',
    pickupAvailable: true,
  },
  {
    id: 'evt-5',
    month: 'Nov',
    day: '14',
    year: '2026',
    title: 'Marana Harvest & Heritage Market',
    desc: 'Celebrating our hometown community in Marana with seasonal Holiday Mix, Caramel Apple, and classic Sweet & Salty.',
    time: '9:00 am - 2:00 pm',
    location: 'Marana, AZ',
    pickupAvailable: true,
  },
];
