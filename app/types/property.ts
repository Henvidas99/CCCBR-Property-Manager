export interface Property {
    id: number
    name: string
    latitude: number
    longitude: number
    address: string
}

export interface PropertyListingSummaryDto {
  id_Property: number
  title: string;
  price: number;
  currency: string
  address_Description: string;
  createdDate: Date;
  updatedDate: Date;
  county: string;
  district: string;
  province: string;
  zone: string;
  userFullName: string;
  modeDescription: string;
  categoryName: string;
  photos: string[];
}