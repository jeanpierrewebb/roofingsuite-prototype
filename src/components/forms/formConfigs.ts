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
}

const LEAD_SOURCES = ['Referral', 'Storm', 'Door-knock', 'Web', 'Insurance'];
const OWNERS = ['Ben Carter', 'Wendy Shaw', 'Mike Duncan', 'Sara Lopez', 'Tom Reilly'];
const CARRIERS = ['State Farm', 'Allstate', 'Farmers', 'American Family', 'USAA', 'Nationwide'];
const CONTACT_TYPES = ['Homeowner', 'Insurance Adjuster', 'Property Manager', 'Vendor', 'General Contractor'];

export const accountForm: FormConfig = {
  title: 'Account',
  removed: ['Tax rate (moved to Billing settings)', 'Custom-field columns clutter'],
  sections: [
    {
      title: 'Identity',
      fields: [
        { label: 'Account Name', type: 'text' },
        { label: 'Type', type: 'select', options: ['Residential', 'Commercial', 'Government'] },
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
  removed: ['Estimated completion date (not meaningful pre-sale)', 'Actual amount (no actuals yet)'],
  sections: [
    {
      title: 'Overview',
      fields: [
        { label: 'Lead / Project Name', type: 'text' },
        { label: 'Homeowner', type: 'text' },
        {
          label: 'Stage',
          type: 'select',
          options: ['New Lead', 'Contacted', 'Inspection Scheduled', 'Estimate Sent', 'Agreement Signed', 'Lost'],
        },
        { label: 'Sales Rep', type: 'select', options: OWNERS },
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
  removed: [
    'Estimated amount ("not a column we’re going to need" — Jeromy)',
    'Estimated completion date ("not important enough for the main interface" — Jeromy)',
  ],
  sections: [
    {
      title: 'Overview',
      fields: [
        { label: 'Project Name', type: 'text' },
        { label: 'Homeowner', type: 'text' },
        {
          label: 'Job Status',
          type: 'select',
          options: ['Scheduled', 'Materials Ordered', 'In Progress', 'Inspection', 'Complete'],
        },
        { label: 'Job Type', type: 'select', options: ['Full Replacement', 'Repair', 'Inspection'], added: true },
        { label: 'Project Manager / Crew', type: 'select', options: OWNERS },
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
