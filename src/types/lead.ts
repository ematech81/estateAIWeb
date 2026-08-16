export type LeadStatus = 'new' | 'contacted' | 'closed';

export interface Lead {
  _id: string;
  property: { _id: string; title: string; location: { city: string } } | string;
  agent: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}
