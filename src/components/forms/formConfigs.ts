// Add/Edit form mockups reflecting the recommended field sets (for client
// sign-off). Fields are grouped; `added`/`removed` flags call out changes vs
// the current app so reviewers can see what's new and what we dropped.

export interface FormFieldDef {
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'switch';
  options?: string[];
  defaultValue?: string | number | boolean;
  helper?: string;
  added?: boolean; // new field vs current app
}

export interface FormSection {
  title: string;
  fields: FormFieldDef[];
}

export interface FormConfig {
  title: string;
  sections: FormSection[];
  removed: string[]; // fields intentionally removed from the current app
  note?: string; // callout shown at the top of the dialog (workflow explainer)
  convertLabel?: string; // adds a secondary "convert record type" action button
}

const LEAD_SOURCES = ['Referral', 'Storm', 'Door-knock', 'Web', 'Insurance'];
const OWNERS = ['Ben Carter', 'Wendy Shaw', 'Mike Duncan', 'Sara Lopez', 'Tom Reilly'];
const CARRIERS = ['State Farm', 'Allstate', 'Farmers', 'American Family', 'USAA', 'Nationwide'];
const CONTACT_TYPES = ['Homeowner', 'Insurance Adjuster', 'Property Manager', 'Vendor', 'General Contractor'];
// Account "Type" — added Tax-Exempt to cover the client's "Untax" (churches, non-profits, etc.)
const ACCOUNT_TYPES = ['Residential', 'Commercial', 'Government', 'Tax-Exempt'];
const CATEGORIES = ['Roof Replacement', 'Roof Repair', 'Storm / Insurance', 'New Construction', 'Inspection', 'Gutters', 'Commercial'];
const PIPELINES = ['Residential Sales', 'Insurance / Storm', 'Commercial'];
const SALES_STEPS = ['New Lead', 'Contacted', 'Inspection Scheduled', 'Estimate Sent', 'Agreement Signed', 'Lost'];
const FIELD_STEPS = ['Scheduled', 'Materials Ordered', 'In Progress', 'Inspection', 'Complete'];

export const accountForm: FormConfig = {
  title: 'Account',
  convertLabel: 'Convert Customer → Prospect (turn the Job into a Lead)',
  note:
    'Accounts are created automatically when a Project is added, and can’t be deleted (Project data is anchored to them) — open one here only to correct details. An Account reads as Customer or Prospect based on its projects: a Job (Field Project) makes it a Customer, a Lead (Sales Project) makes it a Prospect. If a Job was filed by mistake, use Convert below — the Job becomes a Lead and the status flips from Customer to Prospect.',
  removed: [
    'Add Account button (accounts are created via a Project)',
    'Delete Account (would orphan linked Projects)',
    'Tax rate (moved to Billing settings)',
    'Custom-field columns clutter',
  ],
  sections: [
    {
      title: 'Identity',
      fields: [
        { label: 'Account Name', type: 'text' },
        { label: 'Type', type: 'select', options: ACCOUNT_TYPES },
        { label: 'Primary Contact (Homeowner)', type: 'text' },
      ],
    },
    {
      title: 'Property Address',
      fields: [
        { label: 'Street', type: 'text' },
        { label: 'City', type: 'text' },
        { label: 'State', type: 'text', defaultValue: 'KS' },
        { label: 'Zip', type: 'text' },
      ],
    },
    {
      title: 'Contact',
      fields: [
        { label: 'Phone', type: 'text', helper: 'Tap-to-call on mobile' },
        { label: 'Email', type: 'text' },
      ],
    },
    {
      title: 'Sales / CRM',
      fields: [
        { label: 'Lead Source', type: 'select', options: LEAD_SOURCES, added: true, helper: 'New — drives marketing ROI' },
        { label: 'Insurance Carrier', type: 'select', options: CARRIERS, added: true, helper: 'New — roofing is insurance-driven' },
        { label: 'Account Owner', type: 'select', options: OWNERS },
      ],
    },
  ],
};

export const contactForm: FormConfig = {
  title: 'Contact',
  removed: ['Notes column on the list (kept on the record only)'],
  sections: [
    {
      title: 'Name',
      fields: [
        { label: 'First Name', type: 'text' },
        { label: 'Last Name', type: 'text' },
        { label: 'Contact Type', type: 'select', options: CONTACT_TYPES },
        { label: 'Company', type: 'text', helper: 'For commercial / partners' },
      ],
    },
    {
      title: 'Contact Info',
      fields: [
        { label: 'Phone', type: 'text' },
        { label: 'Secondary Phone', type: 'text' },
        { label: 'Email', type: 'text' },
        { label: 'Preferred Contact Method', type: 'select', options: ['email', 'phone', 'sms'] },
      ],
    },
    {
      title: 'Address',
      fields: [
        { label: 'Street', type: 'text' },
        { label: 'City', type: 'text' },
        { label: 'State', type: 'text', defaultValue: 'KS' },
        { label: 'Zip', type: 'text' },
      ],
    },
  ],
};

export const salesProjectForm: FormConfig = {
  title: 'Sales Project (Lead)',
  note:
    'This is the salesperson’s starting point. Saving creates the linked Account automatically — no separate "Add Account" step. The project name is auto-generated from the contact + category.',
  convertLabel: 'Convert to Field Project (Job)',
  removed: ['Estimated completion date (not meaningful pre-sale)', 'Actual amount (no actuals yet)'],
  sections: [
    {
      title: 'Start Here — Create the Sales Project (Lead)',
      fields: [
        { label: 'Primary Contact (Homeowner)', type: 'text', helper: 'Link an existing contact or add a new one' },
        { label: 'Type', type: 'select', options: ACCOUNT_TYPES },
        { label: 'Category', type: 'select', options: CATEGORIES, added: true, helper: 'New — custom field (values you configure)' },
        { label: 'Salesperson', type: 'select', options: OWNERS },
        { label: 'Workflow Pipeline', type: 'select', options: PIPELINES, added: true, helper: 'New — which pipeline this lead runs through' },
        { label: 'Workflow Status Step', type: 'select', options: SALES_STEPS },
      ],
    },
    {
      title: 'Value & Follow-up',
      fields: [
        { label: 'Estimated Value', type: 'number' },
        { label: 'Lead Source', type: 'select', options: LEAD_SOURCES, added: true },
        { label: 'Next Follow-up', type: 'date', added: true, helper: 'New — keeps sales on cadence' },
      ],
    },
    {
      title: 'Roofing / Insurance',
      fields: [
        { label: 'Damage / Roof Type', type: 'select', options: ['Hail', 'Wind', 'Age / Wear', 'Storm', 'Tree Impact'], added: true },
        { label: 'Insurance Claim #', type: 'text', added: true, helper: 'New — big in roofing sales' },
        { label: 'Insurance Carrier', type: 'select', options: CARRIERS, added: true },
        { label: 'Adjuster Name', type: 'text', added: true },
      ],
    },
  ],
};

export const fieldProjectForm: FormConfig = {
  title: 'Field Project (Job)',
  note:
    'Use this shortcut only when the deal is already won (e.g. a simple repair) and no sales pipeline is needed. Saving creates the linked Account automatically — same one-step flow as a Sales Project.',
  convertLabel: 'Convert to Sales Project (Lead)',
  removed: [
    'Estimated amount ("not a column we’re going to need" — Jeromy)',
    'Estimated completion date ("not important enough for the main interface" — Jeromy)',
  ],
  sections: [
    {
      title: 'Start Here — Create the Field Project (Job)',
      fields: [
        { label: 'Primary Contact (Homeowner)', type: 'text', helper: 'Link an existing contact or add a new one' },
        { label: 'Type', type: 'select', options: ACCOUNT_TYPES },
        { label: 'Category', type: 'select', options: CATEGORIES, added: true, helper: 'New — custom field (values you configure)' },
        { label: 'Project Manager / Crew', type: 'select', options: OWNERS },
        { label: 'Workflow Pipeline', type: 'select', options: PIPELINES, added: true, helper: 'New — job workflow this runs through' },
        { label: 'Workflow Status Step', type: 'select', options: FIELD_STEPS },
        { label: 'Job Type', type: 'select', options: ['Full Replacement', 'Repair', 'Inspection'], added: true },
      ],
    },
    {
      title: 'Schedule & Value',
      fields: [
        { label: 'Contract Value', type: 'number', added: true, helper: 'New — the real signed number (replaces "Estimated")' },
        { label: 'Start Date', type: 'date' },
        { label: 'Completion Date', type: 'date' },
      ],
    },
    {
      title: 'Materials & Warranty',
      fields: [
        { label: 'Material / Product', type: 'text', added: true },
        { label: 'Insurance Job', type: 'switch', added: true },
        { label: 'Warranty Registered', type: 'switch', added: true },
      ],
    },
  ],
};
