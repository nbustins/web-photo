export interface LoginFormValues {
  email: string;
  password: string;
}

export interface ManagerStats {
  totalGuests: number;
  confirmed: number;
  declined: number;
  pending: number;
  totalInvitations: number;
  respondedInvitations: number;
}

export interface InvitationSummary {
  invitationId: number;
  label: string;
  inviteCode: string;
  maxAddedGuests: number;
  notes: string | null;
  guests: { id: number; name: string; isPredefined: boolean; attending: boolean | null }[];
}
