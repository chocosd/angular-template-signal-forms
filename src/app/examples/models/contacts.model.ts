export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  isEmergencyContact: boolean;
  city: string;
  country: string;
  tags: string[];
}

export interface ContactListModel {
  listName: string;
  description: string;
  contacts: Contact[];
}

export const defaultContact: Contact = {
  id: '',
  name: '',
  email: '',
  phone: '',
  age: 18,
  isEmergencyContact: false,
  city: '',
  country: '',
  tags: [],
};

export const defaultContactList: ContactListModel = {
  listName: 'My Contacts',
  description: 'A list of my important contacts',
  contacts: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      age: 30,
      isEmergencyContact: true,
      city: 'New York',
      country: 'USA',
      tags: ['friend', 'work'],
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1987654321',
      age: 28,
      isEmergencyContact: false,
      city: 'Los Angeles',
      country: 'USA',
      tags: ['family'],
    },
  ],
};
