import { Basket } from '../models/example.model';

export const model: Basket = {
  address: {
    line1: '46 newtown',
    postcode: 'sp3 6ny',
    country: {
      label: 'russia',
      value: 'RUS',
    },
    favouritePokemon: null,
    favouritePokemonTypes: [],
    instructions: '',
    expectedDate: new Date(),
    postTo: [
      {
        label: 'Canada',
        value: 'CAN',
      },
    ],
    priority: 'HIGH',
  },
  about: {
    profilePicture: null,
    bannerColor: null,
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
  },
  apples: null,
  pears: 80,
  applePrice: 1,
  pearPrice: 2,
  appleTotal: 51,
  pearTotal: 50,
  isOrganic: false,
  total: 101,
};
