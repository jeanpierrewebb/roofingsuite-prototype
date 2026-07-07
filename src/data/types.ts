// Domain types for the prototype. Shapes approximate the real app
// (fe/src/types/customer.ts, contact.ts, job.ts) with the field cleanup applied.

export type CustomerType = 'Residential' | 'Commercial' | 'Government';
export type LeadSource = 'Referral' | 'Storm' | 'Door-knock' | 'Web' | 'Insurance';
export type ContactTypeName =
  | 'Homeowner'
  | 'Insurance Adjuster'
  | 'Property Manager'
  | 'Vendor'
  | 'General Contractor';
export type PreferredContact = 'email' | 'phone' | 'sms';
export type JobType = 'Full Replacement' | 'Repair' | 'Inspection';

export interface StatusRef {
  name: string;
  color: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  type: ContactTypeName;
  phone: string;
  secondaryPhone?: string;
  email: string;
  preferredContact: PreferredContact;
  company?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  isPrimary: boolean;
  accountIds: string[];
  notes?: string;
}

export interface Account {
  id: string;
  name: string;
  type: CustomerType;
  primaryContactId: string;
  primaryContactName: string;
  ownerName: string;
  leadSource: LeadSource;
  insuranceCarrier?: string;
  createdDate: string; // ISO
  // property address
  street: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  phone: string;
  email: string;
  // derived
  isProspect: boolean;
  isCustomer: boolean;
}

export interface SalesProject {
  id: string;
  title: string;
  accountId: string;
  homeownerName: string;
  ownerName: string;
  stage: StatusRef;
  estimatedValue: number;
  leadSource: LeadSource;
  nextFollowUp: string | null; // ISO
  createdDate: string;
  // roofing / insurance
  damageType: string;
  insuranceClaimNumber?: string;
  insuranceCarrier?: string;
  adjusterName?: string;
  // address (from account)
  street: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  phone: string;
  email: string;
}

export interface FieldProject {
  id: string;
  title: string;
  accountId: string;
  homeownerName: string;
  projectManager: string;
  status: StatusRef;
  jobType: JobType;
  contractValue: number;
  startDate: string;
  completionDate: string | null;
  material: string;
  insuranceJob: boolean;
  warrantyRegistered: boolean;
  completed: boolean;
  // address
  street: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  phone: string;
}

// The de-duplicated homeowner roll-up powering the Prospects/Customers Views.
export interface HomeownerView {
  homeownerId: string;
  name: string; // "First Last"
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  owner: string;
  leadSource: LeadSource;
  isProspect: boolean;
  isCustomer: boolean;
  accountCount: number;
  salesProjectCount: number;
  fieldProjectCount: number;
  pipelineValue: number; // sum of open sales estimated values
  lifetimeValue: number; // sum of field contract values
  customerSince: string | null; // earliest completed field project
  lastActivity: string; // most recent activity date across projects
  currentStage: StatusRef | null; // latest sales stage (for prospects)
}
