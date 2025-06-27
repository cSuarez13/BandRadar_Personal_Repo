// Ticketmaster API Response Types

export type TicketmasterEventResponse = {
  _embedded: {
    events: Event[];
  };
  _links: ResponseLinks;
  page: PageInfo;
};

export type Event = {
  name: string;
  type: string;
  id: string;
  test: boolean;
  url: string;
  locale: string;
  images: Image[];
  distance: number;
  units: string;
  sales: Sales;
  dates: EventDates;
  classifications: Classification[];
  promoter: Promoter;
  promoters: Promoter[];
  info?: string;
  pleaseNote?: string;
  products?: Product[];
  seatmap?: SeatMap;
  accessibility?: Accessibility;
  ticketLimit?: TicketLimit;
  ageRestrictions?: AgeRestrictions;
  ticketing?: Ticketing;
  _links: EventLinks;
  _embedded: {
    venues: Venue[];
    attractions: Attraction[];
  };
};

export type Image = {
  ratio: string;
  url: string;
  width: number;
  height: number;
  fallback: boolean;
};

export type Sales = {
  public: {
    startDateTime: string;
    startTBD: boolean;
    startTBA: boolean;
    endDateTime: string;
  };
  presales?: Presale[];
};

export type Presale = {
  startDateTime: string;
  endDateTime: string;
  name: string;
};

export type EventDates = {
  start: {
    localDate: string;
    localTime: string;
    dateTime: string;
    dateTBD: boolean;
    dateTBA: boolean;
    timeTBA: boolean;
    noSpecificTime: boolean;
  };
  timezone: string;
  status: {
    code: string;
  };
  spanMultipleDays: boolean;
};

export type Classification = {
  primary: boolean;
  segment: {
    id: string;
    name: string;
  };
  genre: {
    id: string;
    name: string;
  };
  subGenre: {
    id: string;
    name: string;
  };
  type: {
    id: string;
    name: string;
  };
  subType: {
    id: string;
    name: string;
  };
  family: boolean;
};

export type Promoter = {
  id: string;
  name: string;
  description: string;
};

export type Product = {
  name: string;
  id: string;
  url: string;
  type: string;
  classifications: Classification[];
};

export type SeatMap = {
  staticUrl: string;
  id: string;
};

export type Accessibility = {
  ticketLimit: number;
  id: string;
};

export type TicketLimit = {
  info: string;
  id: string;
};

export type AgeRestrictions = {
  legalAgeEnforced: boolean;
  id: string;
};

export type Ticketing = {
  safeTix: {
    enabled: boolean;
  };
  allInclusivePricing: {
    enabled: boolean;
  };
  id: string;
};

export type Venue = {
  name: string;
  type: string;
  id: string;
  test: boolean;
  url: string;
  locale: string;
  images: Image[];
  distance: number;
  units: string;
  postalCode: string;
  timezone: string;
  city: {
    name: string;
  };
  state: {
    name: string;
    stateCode: string;
  };
  country: {
    name: string;
    countryCode: string;
  };
  address: {
    line1: string;
  };
  location: {
    longitude: string;
    latitude: string;
  };
  markets: Market[];
  dmas: DMA[];
  accessibleSeatingDetail?: string;
  generalInfo?: {
    generalRule: string;
  };
  upcomingEvents: UpcomingEvents;
  _links: {
    self: {
      href: string;
    };
  };
};

export type Attraction = {
  name: string;
  type: string;
  id: string;
  test: boolean;
  url: string;
  locale: string;
  externalLinks?: ExternalLinks;
  images: Image[];
  classifications: Classification[];
  upcomingEvents: UpcomingEvents;
  _links: {
    self: {
      href: string;
    };
  };
};

export type ExternalLinks = {
  youtube?: LinkItem[];
  twitter?: LinkItem[];
  itunes?: LinkItem[];
  tiktok?: LinkItem[];
  facebook?: LinkItem[];
  spotify?: LinkItem[];
  musicbrainz?: MusicBrainzLink[];
  instagram?: LinkItem[];
  homepage?: LinkItem[];
};

export type LinkItem = {
  url: string;
};

export type MusicBrainzLink = {
  id: string;
  url: string;
};

export type Market = {
  name: string;
  id: string;
};

export type DMA = {
  id: number;
};

export type UpcomingEvents = {
  [key: string]: number;
  _total: number;
  _filtered: number;
};

export type EventLinks = {
  self: {
    href: string;
  };
  attractions: {
    href: string;
  }[];
  venues: {
    href: string;
  }[];
};

export type ResponseLinks = {
  first: {
    href: string;
  };
  self: {
    href: string;
  };
  next?: {
    href: string;
  };
  last: {
    href: string;
  };
};

export type PageInfo = {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
};
