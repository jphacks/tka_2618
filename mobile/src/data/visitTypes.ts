export type VerificationMode = 'location';
export type VerificationStatus = 'verified' | 'unverified';

export type VisitVerification = {
  mode: VerificationMode;
  status: VerificationStatus;
  distanceMeters: number | null;
  accuracyMeters: number | null;
};

export type VisitRecord = {
  id: string;
  shopId: string;
  shopName: string;
  countryCode: string;
  prefectureCode: string | null;
  address: string | null;
  photoUris: string[];
  memo: string;
  visitedAt: string;
  verification: VisitVerification;
};

export type Restaurant = {
  id: string;
  name: string;
  distance_m: number;
  address: string | null;
  lat: number;
  lng: number;
  genre: string | null;
  image_url: string | null;
  detail_url: string | null;
};
