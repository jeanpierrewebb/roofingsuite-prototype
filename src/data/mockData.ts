import type {
  Account,
  Contact,
  ContactTypeName,
  CustomerType,
  FieldProject,
  HomeownerView,
  JobType,
  LeadSource,
  PreferredContact,
  SalesProject,
  StatusRef,
} from './types';

// ---------------------------------------------------------------------------
// Deterministic seeded RNG so the dataset is identical on every load/build
// (stable for screenshots and repeatable demos).
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260707);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const chance = (p: number) => rng() < p;
const int = (min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

// Fixed "today" to match the meeting timeframe (2026-07-07) — keeps date
// filters (e.g. "customers from 2026") deterministic.
const TODAY = new Date('2026-07-07T00:00:00');
function isoDaysAgo(days: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Pools
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael',
  'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan',
  'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Chris',
  'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Sandra',
  'Mark', 'Ashley', 'Donald', 'Kimberly', 'Steven', 'Emily', 'Paul', 'Donna',
];
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
];
const STREET_NAMES = [
  'Maple Ave', 'Oak St', 'Prairie Dr', 'Meadowlark Ln', 'Cedar Ct',
  'Sunflower Rd', 'Cottonwood Dr', 'Ridgeview Ave', 'Willow Bend',
  'Cheyenne Trail', 'Flint Hills Rd', 'Bluestem Ln', 'Hedge Row',
  'Prairie Wind Ct', 'Country Club Dr', 'Wheatland Ave',
];

interface Place {
  city: string;
  zip: string;
  county: string;
  weight: number;
}
// Butler County weighted heavily so the post-storm demo has plenty of matches.
const PLACES: Place[] = [
  { city: 'Andover', zip: '67002', county: 'Butler', weight: 5 },
  { city: 'El Dorado', zip: '67042', county: 'Butler', weight: 4 },
  { city: 'Augusta', zip: '67010', county: 'Butler', weight: 3 },
  { city: 'Towanda', zip: '67144', county: 'Butler', weight: 2 },
  { city: 'Rose Hill', zip: '67133', county: 'Butler', weight: 2 },
  { city: 'Wichita', zip: '67206', county: 'Sedgwick', weight: 4 },
  { city: 'Wichita', zip: '67212', county: 'Sedgwick', weight: 3 },
  { city: 'Derby', zip: '67037', county: 'Sedgwick', weight: 3 },
  { city: 'Mulvane', zip: '67110', county: 'Sumner', weight: 2 },
  { city: 'Newton', zip: '67114', county: 'Harvey', weight: 2 },
];
const PLACE_BAG: Place[] = PLACES.flatMap((p) =>
  Array.from({ length: p.weight }, () => p),
);

const OWNERS = ['Ben Carter', 'Wendy Shaw', 'Mike Duncan', 'Sara Lopez', 'Tom Reilly'];
const PMS = ['Carlos Rivera', 'Dana Fox', 'Greg Palmer', 'Ben Carter', 'Tom Reilly'];
const CARRIERS = ['State Farm', 'Allstate', 'Farmers', 'American Family', 'USAA', 'Nationwide'];
const MATERIALS = [
  'GAF Timberline HDZ', 'Owens Corning Duration', 'CertainTeed Landmark',
  'Malarkey Vista', 'Standing Seam Metal',
];
const DAMAGE_TYPES = ['Hail', 'Wind', 'Age / Wear', 'Storm', 'Tree Impact'];
const JOB_TYPES: JobType[] = ['Full Replacement', 'Repair', 'Inspection'];
const LEAD_SOURCES: LeadSource[] = ['Referral', 'Storm', 'Door-knock', 'Web', 'Insurance'];
const PREFERRED: PreferredContact[] = ['email', 'phone', 'sms'];

export const SALES_STAGES: StatusRef[] = [
  { name: 'New Lead', color: '#9e9e9e' },
  { name: 'Contacted', color: '#42a5f5' },
  { name: 'Inspection Scheduled', color: '#7e57c2' },
  { name: 'Estimate Sent', color: '#ffa726' },
  { name: 'Agreement Signed', color: '#66bb6a' },
  { name: 'Lost', color: '#ef5350' },
];
export const FIELD_STATUSES: StatusRef[] = [
  { name: 'Scheduled', color: '#42a5f5' },
  { name: 'Materials Ordered', color: '#ab47bc' },
  { name: 'In Progress', color: '#ffa726' },
  { name: 'Inspection', color: '#26c6da' },
  { name: 'Complete', color: '#2e7d32' },
];

function phone(): string {
  return `(316) 555-${String(int(1000, 9999))}`;
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------
const contacts: Contact[] = [];
const accounts: Account[] = [];
const salesProjects: SalesProject[] = [];
const fieldProjects: FieldProject[] = [];

let contactSeq = 0;
let accountSeq = 0;
let salesSeq = 0;
let fieldSeq = 0;

const NUM_HOMEOWNERS = 88;

for (let h = 0; h < NUM_HOMEOWNERS; h++) {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const place = pick(PLACE_BAG);
  const street = `${int(100, 9999)} ${pick(STREET_NAMES)}`;
  const homeownerPhone = phone();
  const email = `${first.toLowerCase()}.${last.toLowerCase()}${h}@example.com`;
  const contactId = `C${String(++contactSeq).padStart(4, '0')}`;

  const homeowner: Contact = {
    id: contactId,
    firstName: first,
    lastName: last,
    type: 'Homeowner',
    phone: homeownerPhone,
    secondaryPhone: chance(0.35) ? phone() : undefined,
    email,
    preferredContact: pick(PREFERRED),
    street,
    city: place.city,
    state: 'KS',
    zip: place.zip,
    county: place.county,
    isPrimary: true,
    accountIds: [],
    notes: chance(0.2) ? 'Prefers texts after 5pm.' : undefined,
  };
  contacts.push(homeowner);

  // Most homeowners have 1 account; ~25% have 2-3 (proves de-duplication).
  const numAccounts = chance(0.12) ? 3 : chance(0.25) ? 2 : 1;

  for (let a = 0; a < numAccounts; a++) {
    const accountId = `A${String(++accountSeq).padStart(4, '0')}`;
    homeowner.accountIds.push(accountId);
    const owner = pick(OWNERS);
    const leadSource = pick(LEAD_SOURCES);
    const type: CustomerType = chance(0.85)
      ? 'Residential'
      : chance(0.6)
        ? 'Commercial'
        : 'Government';
    const carrier = leadSource === 'Insurance' || chance(0.5) ? pick(CARRIERS) : undefined;
    const createdDaysAgo = int(20, 900);

    // Profile decides whether this account is a prospect, customer, or both.
    const roll = rng();
    const profile: 'prospect' | 'customer' | 'both' =
      roll < 0.45 ? 'prospect' : roll < 0.85 ? 'customer' : 'both';

    const account: Account = {
      id: accountId,
      name: `${last} — ${place.city} (${street.split(' ').slice(1).join(' ')})`,
      type,
      primaryContactId: contactId,
      primaryContactName: `${first} ${last}`,
      ownerName: owner,
      leadSource,
      insuranceCarrier: carrier,
      createdDate: isoDaysAgo(createdDaysAgo),
      street,
      city: place.city,
      state: 'KS',
      zip: place.zip,
      county: place.county,
      phone: homeownerPhone,
      email,
      isProspect: false,
      isCustomer: false,
    };

    const makeSales = () => {
      const stage =
        profile === 'both'
          ? pick(SALES_STAGES.filter((s) => s.name !== 'Lost'))
          : pick(SALES_STAGES);
      const claim =
        leadSource === 'Insurance' || carrier
          ? `CLM-${int(100000, 999999)}`
          : undefined;
      const sp: SalesProject = {
        id: `S${String(++salesSeq).padStart(4, '0')}`,
        title: `${pick(DAMAGE_TYPES)} roof — ${last}`,
        accountId,
        homeownerName: `${first} ${last}`,
        ownerName: owner,
        stage,
        estimatedValue: int(6, 42) * 1000 + int(0, 999),
        leadSource,
        nextFollowUp:
          stage.name === 'Lost' ? null : isoDaysAgo(-int(1, 30)),
        createdDate: isoDaysAgo(int(5, 400)),
        damageType: pick(DAMAGE_TYPES),
        insuranceClaimNumber: claim,
        insuranceCarrier: carrier,
        adjusterName: claim ? `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}` : undefined,
        street,
        city: place.city,
        state: 'KS',
        zip: place.zip,
        county: place.county,
        phone: homeownerPhone,
        email,
      };
      salesProjects.push(sp);
      if (stage.name !== 'Lost') account.isProspect = true;
    };

    const makeField = () => {
      const status = pick(FIELD_STATUSES);
      const completed = status.name === 'Complete';
      const startDaysAgo = int(10, 700);
      const fp: FieldProject = {
        id: `F${String(++fieldSeq).padStart(4, '0')}`,
        title: `${pick(JOB_TYPES)} — ${last}`,
        accountId,
        homeownerName: `${first} ${last}`,
        projectManager: pick(PMS),
        status,
        jobType: pick(JOB_TYPES),
        contractValue: int(8, 55) * 1000 + int(0, 999),
        startDate: isoDaysAgo(startDaysAgo),
        completionDate: completed ? isoDaysAgo(int(1, startDaysAgo - 1)) : null,
        material: pick(MATERIALS),
        insuranceJob: !!carrier || chance(0.4),
        warrantyRegistered: completed && chance(0.7),
        completed,
        street,
        city: place.city,
        state: 'KS',
        zip: place.zip,
        county: place.county,
        phone: homeownerPhone,
      };
      fieldProjects.push(fp);
      account.isCustomer = true;
    };

    if (profile === 'prospect') {
      const n = chance(0.4) ? 2 : 1;
      for (let i = 0; i < n; i++) makeSales();
    } else if (profile === 'customer') {
      const n = chance(0.35) ? 2 : 1;
      for (let i = 0; i < n; i++) makeField();
    } else {
      makeSales();
      makeField();
    }

    accounts.push(account);
  }
}

// A handful of non-homeowner contacts for the Contacts records screen.
const NON_HOMEOWNER_TYPES: ContactTypeName[] = [
  'Insurance Adjuster', 'Property Manager', 'Vendor', 'General Contractor',
];
for (let i = 0; i < 18; i++) {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const place = pick(PLACE_BAG);
  const type = pick(NON_HOMEOWNER_TYPES);
  contacts.push({
    id: `C${String(++contactSeq).padStart(4, '0')}`,
    firstName: first,
    lastName: last,
    type,
    phone: phone(),
    secondaryPhone: chance(0.3) ? phone() : undefined,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@${
      type === 'Insurance Adjuster' ? 'carrier.com' : 'partner.com'
    }`,
    preferredContact: pick(PREFERRED),
    company:
      type === 'Insurance Adjuster'
        ? pick(CARRIERS)
        : type === 'Vendor'
          ? pick(MATERIALS).split(' ')[0] + ' Supply'
          : `${last} ${type === 'Property Manager' ? 'Properties' : 'Contracting'}`,
    street: `${int(100, 9999)} ${pick(STREET_NAMES)}`,
    city: place.city,
    state: 'KS',
    zip: place.zip,
    county: place.county,
    isPrimary: false,
    accountIds: [],
  });
}

// ---------------------------------------------------------------------------
// Homeowner roll-up (de-duplicated) — powers the Prospects / Customers Views.
// ---------------------------------------------------------------------------
function buildHomeownerViews(): HomeownerView[] {
  const homeowners = contacts.filter((c) => c.type === 'Homeowner' && c.isPrimary);
  const accountsByContact = new Map<string, Account[]>();
  for (const acc of accounts) {
    const list = accountsByContact.get(acc.primaryContactId) ?? [];
    list.push(acc);
    accountsByContact.set(acc.primaryContactId, list);
  }
  const salesByAccount = new Map<string, SalesProject[]>();
  for (const sp of salesProjects) {
    const list = salesByAccount.get(sp.accountId) ?? [];
    list.push(sp);
    salesByAccount.set(sp.accountId, list);
  }
  const fieldByAccount = new Map<string, FieldProject[]>();
  for (const fp of fieldProjects) {
    const list = fieldByAccount.get(fp.accountId) ?? [];
    list.push(fp);
    fieldByAccount.set(fp.accountId, list);
  }

  const views: HomeownerView[] = [];
  for (const ho of homeowners) {
    const accs = accountsByContact.get(ho.id) ?? [];
    if (accs.length === 0) continue;
    const sales = accs.flatMap((a) => salesByAccount.get(a.id) ?? []);
    const fields = accs.flatMap((a) => fieldByAccount.get(a.id) ?? []);

    const openSales = sales.filter((s) => s.stage.name !== 'Lost');
    const isProspect = openSales.length > 0;
    const isCustomer = fields.length > 0;
    if (!isProspect && !isCustomer) continue;

    const completed = fields.filter((f) => f.completed && f.completionDate);
    const customerSince =
      completed.length > 0
        ? completed
            .map((f) => f.completionDate as string)
            .sort()[0]
        : isCustomer
          ? fields.map((f) => f.startDate).sort()[0]
          : null;

    const activityDates = [
      ...sales.map((s) => s.createdDate),
      ...fields.map((f) => f.completionDate ?? f.startDate),
    ].sort();
    const lastActivity = activityDates[activityDates.length - 1] ?? isoDaysAgo(0);

    // most advanced open sales stage (by pipeline order)
    let currentStage: StatusRef | null = null;
    if (openSales.length > 0) {
      const order = (s: StatusRef) =>
        SALES_STAGES.findIndex((x) => x.name === s.name);
      currentStage = openSales
        .map((s) => s.stage)
        .sort((a, b) => order(b) - order(a))[0];
    }

    views.push({
      homeownerId: ho.id,
      name: `${ho.firstName} ${ho.lastName}`,
      phone: ho.phone,
      email: ho.email,
      street: ho.street,
      city: ho.city,
      state: ho.state,
      zip: ho.zip,
      county: ho.county,
      owner: accs[accs.length - 1].ownerName,
      leadSource: accs[accs.length - 1].leadSource,
      isProspect,
      isCustomer,
      accountCount: accs.length,
      salesProjectCount: sales.length,
      fieldProjectCount: fields.length,
      pipelineValue: openSales.reduce((sum, s) => sum + s.estimatedValue, 0),
      lifetimeValue: fields.reduce((sum, f) => sum + f.contractValue, 0),
      customerSince,
      lastActivity,
      currentStage,
    });
  }
  return views;
}

const homeownerViews = buildHomeownerViews();

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
export const mockContacts = contacts;
export const mockAccounts = accounts;
export const mockSalesProjects = salesProjects;
export const mockFieldProjects = fieldProjects;
export const mockHomeownerViews = homeownerViews;

export const prospectsView = homeownerViews.filter((h) => h.isProspect);
export const customersView = homeownerViews.filter((h) => h.isCustomer);

// Convenience distinct value lists for facets
export const uniqueOwners = OWNERS;
export const uniqueCities = Array.from(new Set(PLACES.map((p) => p.city))).sort();
export const uniqueZips = Array.from(new Set(PLACES.map((p) => p.zip))).sort();
export const uniqueCounties = Array.from(new Set(PLACES.map((p) => p.county))).sort();
export const leadSources = LEAD_SOURCES;
export const customerTypes: CustomerType[] = ['Residential', 'Commercial', 'Government'];
export const contactTypes: ContactTypeName[] = [
  'Homeowner', 'Insurance Adjuster', 'Property Manager', 'Vendor', 'General Contractor',
];
export const jobTypes = JOB_TYPES;
