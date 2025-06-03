import { type Basket } from '../models/example.model';

export const model: Basket = {
  address: {
    line1: '46 newtown',
    postcode: 'sp3 6ny',
    country: {
      label: 'russia',
      value: 'RUS',
    },
    favouritePokemon: null,
    favouritePokemonTypes: [
      {
        label: 'Water',
        value: 'water',
      },
    ],
    instructions: '',
    expectedDate: new Date(),
    postTo: [
      {
        label: 'Canada',
        value: 'CAN',
      },
    ],
    priority: 'HIGH',
    shippingMethod: 'STANDARD',
    paymentMethod: 'CREDIT_CARD',
  },
  about: {
    profilePicture: null,
    bannerColor: null,
    personal: {
      age: 25,
      income: 100000,
      weight: 70,
      height: 180,
      bioDescription: 'I am a software engineer',
    },
    contacts: [
      { email: 'hello@testtest.co.uk', phone: 7777777777, name: 'Steven' },
      { email: 'john@testtest.co.uk', phone: 7777077077, name: 'John' },
      { email: 'jane@testtest.co.uk', phone: 3247077079, name: 'Jane' },
    ],
    beastMode: false,
    brightness: 5,
    rating: 3,
    phoneNumber: null,
    features: [],
    preferences: {
      theme: 'dark',
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      privacy: {
        profileVisible: true,
        dataSharing: false,
      },
    },
  },
  apples: 1,
  pears: 80,
  applePrice: 1,
  pearPrice: 2,
  appleTotal: 51,
  pearTotal: 50,
  isOrganic: false,
  total: 101,
};
