export interface CorporateColor {
  colorPrimary: string;
  colorPrimaryAlt: string;
  colorAccent: string;
  colorWarning: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  border: string;
  borderStrong: string;
  shadow: string;
  shadowStrong: string;
  _id?: string;
}

export interface CorporateImage {
  identifier: string;
  url: string;
  _id?: string;
}

export interface CorporateIdentity {
  _id?: string;
  tenantId: string;
  logoUrl: string;
  color: CorporateColor;
  theme: 'dark' | 'light';
  imgVar: CorporateImage[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface CorporateIdentityResponse {
  success: boolean;
  data: CorporateIdentity[];
}

