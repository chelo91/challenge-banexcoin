export class ReferralUserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export class ReferralAccountDTO {
  id: string;
  user: ReferralUserDTO | null;
}

export class AccountReferralDTO {
  id: string;
  referrerMe: ReferralAccountDTO | null;
  referralsForMe: ReferralAccountDTO[];
} 