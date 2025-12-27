
export type PartyType = 'Seller' | 'Buyer';
export type UserRole = 'Admin' | 'User';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  createdAt: string;
}

export interface LicenseInfo {
  expiryDate: string;
  status: 'Active' | 'Expired';
  lastRenewedAt: string;
}

export interface Party {
  id: string;
  name: string;
  contact: string;
  type: PartyType;
}

export interface ItemTemplate {
  id: string;
  name: string;
}

export interface TokenItem {
  id: string;
  tokenId: string;
  name: string;
  quantity: number;
  deductionQuantity: number;
  finalQuantity: number;
  status: 'Available' | 'Sold';
  soldQuantity?: number;
  unitSalesRate?: number;
  salesAmount?: number;
  purchaseAmount?: number;
  sellingPartyId?: string;
  soldAt?: string;
}

export interface Token {
  id: string;
  sellerId: string;
  createdAt: string;
  items: TokenItem[];
}

export interface AppSettings {
  purchaseMarginPercent: number;
}

export interface AppData {
  parties: Party[];
  itemTemplates: ItemTemplate[];
  tokens: Token[];
  settings: AppSettings;
  users: UserAccount[];
  license: LicenseInfo;
}
