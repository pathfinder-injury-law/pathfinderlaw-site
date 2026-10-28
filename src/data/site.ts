// Facts and links used on every page. Wording and addresses are copied from the
// current live site so the migration changes as little as possible.

export type Office = {
  name: string;
  lines: string[];
  mapUrl: string;
  page?: { label: string; href: string };
};

export const site = {
  name: 'Pathfinder Injury Law',
  tagline: "Virginia Workers' Comp Lawyer",
  phoneDisplay: '(804) 505-0633',
  phoneHeader: '804-505-0633',
  phoneHref: 'tel:+18045050633',
  // Both offices are by appointment only.
  offices: [
    {
      name: 'Richmond',
      lines: ['8010 Ridge Road, Suite A', 'Richmond, VA 23229'],
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=8010+Ridge+Road+Suite+A+Richmond+VA+23229',
    },
    {
      name: 'Chincoteague',
      lines: ['6294 Cropper Street', 'Chincoteague, VA 23336'],
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=6294+Cropper+Street+Chincoteague+VA+23336',
      // Page for people who work on the Eastern Shore; linked from the Location and Contact cards.
      page: { label: 'Eastern Shore Workers’ Comp Lawyer', href: '/eastern-shore-workers-comp-lawyer/' },
    },
  ] as Office[],
  hours: ['By appointment only', 'Mon-Fri: 9am-5pm', 'Sat-Sun: By arrangement', 'Video Consultations Avail.'],
  social: [
    { name: 'Facebook', url: 'https://www.facebook.com/PathfinderInjuryLaw/' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/bryn-swartz-5279551ab/' },
    { name: 'YouTube', url: 'https://www.youtube.com/channel/UCFV8IOmL8EqzD5z6Jh-ApPA' },
  ],
};

export type NavItem = { label: string; href: string; children?: NavItem[] };

// Same targets as the current live menu (all addresses unchanged).
export const nav: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about-us/',
    children: [
      { label: 'About Our Firm', href: '/about-us/' },
      { label: 'Bryn Swartz', href: '/bryn-swartz/' },
      { label: 'Mandy Truman Swartz', href: '/mandy-swartz/' },
    ],
  },
  { label: 'Blog', href: '/blog/' },
  { label: 'FAQ', href: '/virginia-workers-comp-faq/' },
  {
    label: 'Cases We Handle',
    href: '/virginia-workers-comp-lawyer/',
    children: [
      { label: "Workers' Comp", href: '/virginia-workers-comp-lawyer/' },
      { label: "Workers' Comp Denials", href: '/how-to-appeal-a-workers-comp-denial-in-virginia/' },
      { label: 'Construction Accidents', href: '/virginia-construction-accident-lawyer/' },
      { label: 'Factory Accidents', href: '/virginia-factory-accident-lawyer/' },
      { label: 'Work Vehicle Accidents', href: '/car-accident-at-work-in-virginia/' },
      { label: 'Back Injuries', href: '/virginia-workers-comp-lawyer/virginia-back-injury-lawyer/' },
    ],
  },
  { label: 'Reviews', href: '/reviews/' },
  { label: 'Results', href: '/results/' },
  { label: 'Contact', href: '/contact/' },
  { label: 'Client Portal', href: '/client-portal/' },
];
