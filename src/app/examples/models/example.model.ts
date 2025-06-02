import { type FormOption } from '@models/signal-form.model';

export type Basket = {
  apples: number | null;
  pears: number;
  address: {
    line1: string;
    postcode: string;
    country: FormOption;
    instructions: string;
    expectedDate: Date;
    postTo: FormOption[];
    priority: string;
    favouritePokemon: FormOption | null;
    favouritePokemonTypes: FormOption[];
  };
  about: {
    profilePicture: File | null;
    bannerColor: string | null;
    contacts: { email: string; phone: number; name: string }[];
    beastMode: boolean;
    brightness: number;
    rating: number;
    phoneNumber: number | null;
    features: string[];
    preferences: {
      theme: string;
      notifications: {
        email: boolean;
        sms: boolean;
        push: boolean;
      };
      privacy: {
        profileVisible: boolean;
        dataSharing: boolean;
      };
    };
  };
  applePrice: number;
  pearPrice: number;
  appleTotal: number;
  pearTotal: number;
  isOrganic: boolean;
  total: number;
};

export type Country = {
  name: {
    common: string;
  };
  cca2: string;
};
