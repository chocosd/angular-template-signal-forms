import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { SignalFormComponent } from './signal-forms/components/renderers/signal-form/signal-form.component';
import { FormFieldType } from './signal-forms/enums/form-field-type.enum';
import { FormBuilder } from './signal-forms/helpers/form-builder';
import {
  type FormOption,
  type SignalFormContainer,
  type SignalFormFieldBuilderInput,
} from './signal-forms/models/signal-form.model';
import { TestApiService } from './signal-forms/services/test-http.service';
import { SignalValidators } from './signal-forms/validators/signal-validators';

const pokemonList: FormOption<{ name: string; typings: string[] }>[] = [
  {
    label: 'Bulbasaur',
    value: {
      name: 'Bulbasaur',
      typings: ['grass', 'poison'],
    },
  },
  {
    label: 'Ivysaur',
    value: {
      name: 'Ivysaur',
      typings: ['grass', 'poison'],
    },
  },
  {
    label: 'Venusaur',
    value: {
      name: 'Venusaur',
      typings: ['grass', 'poison'],
    },
  },
  {
    label: 'Charmander',
    value: {
      name: 'Charmander',
      typings: ['fire'],
    },
  },
  {
    label: 'Charmeleon',
    value: {
      name: 'Charmeleon',
      typings: ['fire'],
    },
  },
  {
    label: 'Charizard',
    value: {
      name: 'Charizard',
      typings: ['fire', 'Flying'],
    },
  },
  {
    label: 'Squirtle',
    value: {
      name: 'Squirtle',
      typings: ['Water'],
    },
  },
  {
    label: 'Wartortle',
    value: {
      name: 'Wartortle',
      typings: ['Water'],
    },
  },
  {
    label: 'Blastoise',
    value: {
      name: 'Blastoise',
      typings: ['Water'],
    },
  },
  {
    label: 'Caterpie',
    value: {
      name: 'Caterpie',
      typings: ['Bug'],
    },
  },
  {
    label: 'Metapod',
    value: {
      name: 'Metapod',
      typings: ['Bug'],
    },
  },
  {
    label: 'Butterfree',
    value: {
      name: 'Butterfree',
      typings: ['Bug', 'Flying'],
    },
  },
  {
    label: 'Weedle',
    value: {
      name: 'Weedle',
      typings: ['Bug', 'poison'],
    },
  },
  {
    label: 'Kakuna',
    value: {
      name: 'Kakuna',
      typings: ['Bug', 'poison'],
    },
  },
  {
    label: 'Beedrill',
    value: {
      name: 'Beedrill',
      typings: ['Bug', 'poison'],
    },
  },
  {
    label: 'Pidgey',
    value: {
      name: 'Pidgey',
      typings: ['Normal', 'Flying'],
    },
  },
  {
    label: 'Pidgeotto',
    value: {
      name: 'Pidgeotto',
      typings: ['Normal', 'Flying'],
    },
  },
  {
    label: 'Pidgeot',
    value: {
      name: 'Pidgeot',
      typings: ['Normal', 'Flying'],
    },
  },
  {
    label: 'Rattata',
    value: {
      name: 'Rattata',
      typings: ['Normal'],
    },
  },
  {
    label: 'Raticate',
    value: {
      name: 'Raticate',
      typings: ['Normal'],
    },
  },
  {
    label: 'Spearow',
    value: {
      name: 'Spearow',
      typings: ['Normal', 'Flying'],
    },
  },
  {
    label: 'Fearow',
    value: {
      name: 'Fearow',
      typings: ['Normal', 'Flying'],
    },
  },
  {
    label: 'Ekans',
    value: {
      name: 'Ekans',
      typings: ['poison'],
    },
  },
  {
    label: 'Arbok',
    value: {
      name: 'Arbok',
      typings: ['poison'],
    },
  },
  {
    label: 'Pikachu',
    value: {
      name: 'Pikachu',
      typings: ['Electric'],
    },
  },
  {
    label: 'Raichu',
    value: {
      name: 'Raichu',
      typings: ['Electric'],
    },
  },
  {
    label: 'Sandshrew',
    value: {
      name: 'Sandshrew',
      typings: ['Ground'],
    },
  },
  {
    label: 'Sandslash',
    value: {
      name: 'Sandslash',
      typings: ['Ground'],
    },
  },
  {
    label: 'Nidoran♀',
    value: {
      name: 'Nidoran♀',
      typings: ['poison'],
    },
  },
  {
    label: 'Nidorina',
    value: {
      name: 'Nidorina',
      typings: ['poison'],
    },
  },
  {
    label: 'Nidoqueen',
    value: {
      name: 'Nidoqueen',
      typings: ['poison', 'Ground'],
    },
  },
  {
    label: 'Nidoran♂',
    value: {
      name: 'Nidoran♂',
      typings: ['poison'],
    },
  },
  {
    label: 'Nidorino',
    value: {
      name: 'Nidorino',
      typings: ['poison'],
    },
  },
  {
    label: 'Nidoking',
    value: {
      name: 'Nidoking',
      typings: ['poison', 'Ground'],
    },
  },
  {
    label: 'Clefairy',
    value: {
      name: 'Clefairy',
      typings: ['Fairy'],
    },
  },
  {
    label: 'Clefable',
    value: {
      name: 'Clefable',
      typings: ['Fairy'],
    },
  },
  {
    label: 'Vulpix',
    value: {
      name: 'Vulpix',
      typings: ['fire'],
    },
  },
  {
    label: 'Ninetales',
    value: {
      name: 'Ninetales',
      typings: ['fire'],
    },
  },
  {
    label: 'Jigglypuff',
    value: {
      name: 'Jigglypuff',
      typings: ['Normal', 'Fairy'],
    },
  },
  {
    label: 'Wigglytuff',
    value: {
      name: 'Wigglytuff',
      typings: ['Normal', 'Fairy'],
    },
  },
  {
    label: 'Zubat',
    value: {
      name: 'Zubat',
      typings: ['poison', 'Flying'],
    },
  },
  {
    label: 'Golbat',
    value: {
      name: 'Golbat',
      typings: ['poison', 'Flying'],
    },
  },
  {
    label: 'Oddish',
    value: {
      name: 'Oddish',
      typings: ['grass', 'poison'],
    },
  },
  {
    label: 'Gloom',
    value: {
      name: 'Gloom',
      typings: ['grass', 'poison'],
    },
  },
  {
    label: 'Vileplume',
    value: {
      name: 'Vileplume',
      typings: ['grass', 'poison'],
    },
  },
  {
    label: 'Paras',
    value: {
      name: 'Paras',
      typings: ['Bug', 'grass'],
    },
  },
  {
    label: 'Parasect',
    value: {
      name: 'Parasect',
      typings: ['Bug', 'grass'],
    },
  },
  {
    label: 'Venonat',
    value: {
      name: 'Venonat',
      typings: ['Bug', 'poison'],
    },
  },
  {
    label: 'Venomoth',
    value: {
      name: 'Venomoth',
      typings: ['Bug', 'poison'],
    },
  },
  {
    label: 'Diglett',
    value: {
      name: 'Diglett',
      typings: ['Ground'],
    },
  },
  {
    label: 'Dugtrio',
    value: {
      name: 'Dugtrio',
      typings: ['Ground'],
    },
  },
  {
    label: 'Meowth',
    value: {
      name: 'Meowth',
      typings: ['Normal'],
    },
  },
  {
    label: 'Persian',
    value: {
      name: 'Persian',
      typings: ['Normal'],
    },
  },
  {
    label: 'Psyduck',
    value: {
      name: 'Psyduck',
      typings: ['Water'],
    },
  },
  {
    label: 'Golduck',
    value: {
      name: 'Golduck',
      typings: ['Water'],
    },
  },
  {
    label: 'Mankey',
    value: {
      name: 'Mankey',
      typings: ['Fighting'],
    },
  },
  {
    label: 'Primeape',
    value: {
      name: 'Primeape',
      typings: ['Fighting'],
    },
  },
  {
    label: 'Growlithe',
    value: {
      name: 'Growlithe',
      typings: ['fire'],
    },
  },
  {
    label: 'Arcanine',
    value: {
      name: 'Arcanine',
      typings: ['fire'],
    },
  },
  {
    label: 'Poliwag',
    value: {
      name: 'Poliwag',
      typings: ['Water'],
    },
  },
  {
    label: 'Poliwhirl',
    value: {
      name: 'Poliwhirl',
      typings: ['Water'],
    },
  },
  {
    label: 'Poliwrath',
    value: {
      name: 'Poliwrath',
      typings: ['Water', 'Fighting'],
    },
  },
  {
    label: 'Abra',
    value: {
      name: 'Abra',
      typings: ['Psychic'],
    },
  },
  {
    label: 'Kadabra',
    value: {
      name: 'Kadabra',
      typings: ['Psychic'],
    },
  },
  {
    label: 'Alakazam',
    value: {
      name: 'Alakazam',
      typings: ['Psychic'],
    },
  },
  {
    label: 'Machop',
    value: {
      name: 'Machop',
      typings: ['Fighting'],
    },
  },
  {
    label: 'Machoke',
    value: {
      name: 'Machoke',
      typings: ['Fighting'],
    },
  },
  {
    label: 'Machamp',
    value: {
      name: 'Machamp',
      typings: ['Fighting'],
    },
  },
  {
    label: 'Bellsprout',
    value: {
      name: 'Bellsprout',
      typings: ['grass', 'poison'],
    },
  },
  {
    label: 'Weepinbell',
    value: {
      name: 'Weepinbell',
      typings: ['grass', 'poison'],
    },
  },
  {
    label: 'Victreebel',
    value: {
      name: 'Victreebel',
      typings: ['grass', 'poison'],
    },
  },
  {
    label: 'Tentacool',
    value: {
      name: 'Tentacool',
      typings: ['Water', 'poison'],
    },
  },
  {
    label: 'Tentacruel',
    value: {
      name: 'Tentacruel',
      typings: ['Water', 'poison'],
    },
  },
  {
    label: 'Geodude',
    value: {
      name: 'Geodude',
      typings: ['Rock', 'Ground'],
    },
  },
  {
    label: 'Graveler',
    value: {
      name: 'Graveler',
      typings: ['Rock', 'Ground'],
    },
  },
  {
    label: 'Golem',
    value: {
      name: 'Golem',
      typings: ['Rock', 'Ground'],
    },
  },
  {
    label: 'Ponyta',
    value: {
      name: 'Ponyta',
      typings: ['fire'],
    },
  },
  {
    label: 'Rapidash',
    value: {
      name: 'Rapidash',
      typings: ['fire'],
    },
  },
  {
    label: 'Slowpoke',
    value: {
      name: 'Slowpoke',
      typings: ['Water', 'Psychic'],
    },
  },
  {
    label: 'Slowbro',
    value: {
      name: 'Slowbro',
      typings: ['Water', 'Psychic'],
    },
  },
  {
    label: 'Magnemite',
    value: {
      name: 'Magnemite',
      typings: ['Electric', 'Steel'],
    },
  },
  {
    label: 'Magneton',
    value: {
      name: 'Magneton',
      typings: ['Electric', 'Steel'],
    },
  },
  {
    label: 'Farfetch’d',
    value: {
      name: 'Farfetch’d',
      typings: ['Normal', 'Flying'],
    },
  },
  {
    label: 'Doduo',
    value: {
      name: 'Doduo',
      typings: ['Normal', 'Flying'],
    },
  },
  {
    label: 'Dodrio',
    value: {
      name: 'Dodrio',
      typings: ['Normal', 'Flying'],
    },
  },
  {
    label: 'Seel',
    value: {
      name: 'Seel',
      typings: ['Water'],
    },
  },
  {
    label: 'Dewgong',
    value: {
      name: 'Dewgong',
      typings: ['Water', 'Ice'],
    },
  },
  {
    label: 'Grimer',
    value: {
      name: 'Grimer',
      typings: ['poison'],
    },
  },
  {
    label: 'Muk',
    value: {
      name: 'Muk',
      typings: ['poison'],
    },
  },
  {
    label: 'Shellder',
    value: {
      name: 'Shellder',
      typings: ['Water'],
    },
  },
  {
    label: 'Cloyster',
    value: {
      name: 'Cloyster',
      typings: ['Water', 'Ice'],
    },
  },
  {
    label: 'Gastly',
    value: {
      name: 'Gastly',
      typings: ['Ghost', 'poison'],
    },
  },
  {
    label: 'Haunter',
    value: {
      name: 'Haunter',
      typings: ['Ghost', 'poison'],
    },
  },
  {
    label: 'Gengar',
    value: {
      name: 'Gengar',
      typings: ['Ghost', 'poison'],
    },
  },
  {
    label: 'Onix',
    value: {
      name: 'Onix',
      typings: ['Rock', 'Ground'],
    },
  },
  {
    label: 'Drowzee',
    value: {
      name: 'Drowzee',
      typings: ['Psychic'],
    },
  },
  {
    label: 'Hypno',
    value: {
      name: 'Hypno',
      typings: ['Psychic'],
    },
  },
  {
    label: 'Krabby',
    value: {
      name: 'Krabby',
      typings: ['Water'],
    },
  },
  {
    label: 'Kingler',
    value: {
      name: 'Kingler',
      typings: ['Water'],
    },
  },
  {
    label: 'Voltorb',
    value: {
      name: 'Voltorb',
      typings: ['Electric'],
    },
  },
  {
    label: 'Electrode',
    value: {
      name: 'Electrode',
      typings: ['Electric'],
    },
  },
  {
    label: 'Exeggcute',
    value: {
      name: 'Exeggcute',
      typings: ['grass', 'Psychic'],
    },
  },
  {
    label: 'Exeggutor',
    value: {
      name: 'Exeggutor',
      typings: ['grass', 'Psychic'],
    },
  },
  {
    label: 'Cubone',
    value: {
      name: 'Cubone',
      typings: ['Ground'],
    },
  },
  {
    label: 'Marowak',
    value: {
      name: 'Marowak',
      typings: ['Ground'],
    },
  },
  {
    label: 'Hitmonlee',
    value: {
      name: 'Hitmonlee',
      typings: ['Fighting'],
    },
  },
  {
    label: 'Hitmonchan',
    value: {
      name: 'Hitmonchan',
      typings: ['Fighting'],
    },
  },
  {
    label: 'Lickitung',
    value: {
      name: 'Lickitung',
      typings: ['Normal'],
    },
  },
  {
    label: 'Koffing',
    value: {
      name: 'Koffing',
      typings: ['poison'],
    },
  },
  {
    label: 'Weezing',
    value: {
      name: 'Weezing',
      typings: ['poison'],
    },
  },
  {
    label: 'Rhyhorn',
    value: {
      name: 'Rhyhorn',
      typings: ['Ground', 'Rock'],
    },
  },
  {
    label: 'Rhydon',
    value: {
      name: 'Rhydon',
      typings: ['Ground', 'Rock'],
    },
  },
  {
    label: 'Chansey',
    value: {
      name: 'Chansey',
      typings: ['Normal'],
    },
  },
  {
    label: 'Tangela',
    value: {
      name: 'Tangela',
      typings: ['grass'],
    },
  },
  {
    label: 'Kangaskhan',
    value: {
      name: 'Kangaskhan',
      typings: ['Normal'],
    },
  },
  {
    label: 'Horsea',
    value: {
      name: 'Horsea',
      typings: ['Water'],
    },
  },
  {
    label: 'Seadra',
    value: {
      name: 'Seadra',
      typings: ['Water'],
    },
  },
  {
    label: 'Goldeen',
    value: {
      name: 'Goldeen',
      typings: ['Water'],
    },
  },
  {
    label: 'Seaking',
    value: {
      name: 'Seaking',
      typings: ['Water'],
    },
  },
  {
    label: 'Staryu',
    value: {
      name: 'Staryu',
      typings: ['Water'],
    },
  },
  {
    label: 'Starmie',
    value: {
      name: 'Starmie',
      typings: ['Water', 'Psychic'],
    },
  },
  {
    label: 'Mr. Mime',
    value: {
      name: 'Mr. Mime',
      typings: ['Psychic', 'Fairy'],
    },
  },
  {
    label: 'Scyther',
    value: {
      name: 'Scyther',
      typings: ['Bug', 'Flying'],
    },
  },
  {
    label: 'Jynx',
    value: {
      name: 'Jynx',
      typings: ['Ice', 'Psychic'],
    },
  },
  {
    label: 'Electabuzz',
    value: {
      name: 'Electabuzz',
      typings: ['Electric'],
    },
  },
  {
    label: 'Magmar',
    value: {
      name: 'Magmar',
      typings: ['fire'],
    },
  },
  {
    label: 'Pinsir',
    value: {
      name: 'Pinsir',
      typings: ['Bug'],
    },
  },
  {
    label: 'Tauros',
    value: {
      name: 'Tauros',
      typings: ['Normal'],
    },
  },
  {
    label: 'Magikarp',
    value: {
      name: 'Magikarp',
      typings: ['Water'],
    },
  },
  {
    label: 'Gyarados',
    value: {
      name: 'Gyarados',
      typings: ['Water', 'Flying'],
    },
  },
  {
    label: 'Lapras',
    value: {
      name: 'Lapras',
      typings: ['Water', 'Ice'],
    },
  },
  {
    label: 'Ditto',
    value: {
      name: 'Ditto',
      typings: ['Normal'],
    },
  },
  {
    label: 'Eevee',
    value: {
      name: 'Eevee',
      typings: ['Normal'],
    },
  },
  {
    label: 'Vaporeon',
    value: {
      name: 'Vaporeon',
      typings: ['Water'],
    },
  },
  {
    label: 'Jolteon',
    value: {
      name: 'Jolteon',
      typings: ['Electric'],
    },
  },
  {
    label: 'Flareon',
    value: {
      name: 'Flareon',
      typings: ['fire'],
    },
  },
  {
    label: 'Porygon',
    value: {
      name: 'Porygon',
      typings: ['Normal'],
    },
  },
  {
    label: 'Omanyte',
    value: {
      name: 'Omanyte',
      typings: ['Rock', 'Water'],
    },
  },
  {
    label: 'Omastar',
    value: {
      name: 'Omastar',
      typings: ['Rock', 'Water'],
    },
  },
  {
    label: 'Kabuto',
    value: {
      name: 'Kabuto',
      typings: ['Rock', 'Water'],
    },
  },
  {
    label: 'Kabutops',
    value: {
      name: 'Kabutops',
      typings: ['Rock', 'Water'],
    },
  },
  {
    label: 'Aerodactyl',
    value: {
      name: 'Aerodactyl',
      typings: ['Rock', 'Flying'],
    },
  },
  {
    label: 'Snorlax',
    value: {
      name: 'Snorlax',
      typings: ['Normal'],
    },
  },
  {
    label: 'Articuno',
    value: {
      name: 'Articuno',
      typings: ['Ice', 'Flying'],
    },
  },
  {
    label: 'Zapdos',
    value: {
      name: 'Zapdos',
      typings: ['Electric', 'Flying'],
    },
  },
  {
    label: 'Moltres',
    value: {
      name: 'Moltres',
      typings: ['fire', 'Flying'],
    },
  },
  {
    label: 'Dratini',
    value: {
      name: 'Dratini',
      typings: ['Dragon'],
    },
  },
  {
    label: 'Dragonair',
    value: {
      name: 'Dragonair',
      typings: ['Dragon'],
    },
  },
  {
    label: 'Dragonite',
    value: {
      name: 'Dragonite',
      typings: ['Dragon', 'Flying'],
    },
  },
  {
    label: 'Mewtwo',
    value: {
      name: 'Mewtwo',
      typings: ['Psychic'],
    },
  },
  {
    label: 'Mew',
    value: {
      name: 'Mew',
      typings: ['Psychic'],
    },
  },
] as const;

export type Basket = {
  apples: number;
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
    beastMode: boolean;
    brightness: number;
    rating: number;
    phoneNumber: number | null;
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

export const OnlyPositiveValidator = (name: string) => (x: number) =>
  x < 0 ? `${name} only positive prices` : null;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, SignalFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  public title = 'signal-template-forms';
  public form!: SignalFormContainer<Basket>;
  public readonly testApiService = inject(TestApiService);

  public ngOnInit(): void {
    const model: Basket = {
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
        beastMode: false,
        brightness: 5,
        rating: 3,
        phoneNumber: null,
      },
      apples: 20,
      pears: 80,
      applePrice: 1,
      pearPrice: 2,
      appleTotal: 51,
      pearTotal: 50,
      isOrganic: false,
      total: 101,
    };

    const addressForm: SignalFormFieldBuilderInput<Basket> = {
      name: 'address',
      heading: 'Delivery Address',
      subheading: 'Where should we send your basket?',
      hidden: (form) => form.getField('total').value() < 100,
      fields: [
        {
          name: 'line1',
          label: 'line 1',
          type: FormFieldType.TEXT,
          validators: [
            (x, form) =>
              !x.length && form.getField('postcode')?.value().length < 5
                ? 'invalid address'
                : null,
          ],
        },
        {
          name: 'postcode',
          label: 'postcode',
          type: FormFieldType.TEXT,
          validators: [
            (val, form) => (!val.length ? 'postcode is required' : null),
          ],
        },
        {
          name: 'country',
          label: 'Select Country',
          type: FormFieldType.AUTOCOMPLETE,
          loadOptions: (search: string) =>
            this.testApiService.getCountry(search).pipe(
              map((countries) =>
                countries.map((country) => ({
                  label: country.name.common,
                  value: country.cca2,
                })),
              ),
            ),
          config: {
            debounceMs: 300,
            minChars: 2,
          },
        },
        {
          name: 'favouritePokemonTypes',
          label: 'Favourite Pokemon Types',
          type: FormFieldType.MULTISELECT,
          options: [
            {
              label: 'Normal',
              value: 'normal',
            },
            {
              label: 'fire',
              value: 'fire',
            },
            {
              label: 'Water',
              value: 'water',
            },
            {
              label: 'grass',
              value: 'grass',
            },
            {
              label: 'Electric',
              value: 'electric',
            },
            {
              label: 'Ice',
              value: 'ice',
            },
            {
              label: 'Fighting',
              value: 'fighting',
            },
            {
              label: 'poison',
              value: 'poison',
            },
            {
              label: 'Ground',
              value: 'ground',
            },
            {
              label: 'Flying',
              value: 'flying',
            },
            {
              label: 'Psychic',
              value: 'psychic',
            },
            {
              label: 'Bug',
              value: 'bug',
            },
            {
              label: 'Rock',
              value: 'rock',
            },
            {
              label: 'Ghost',
              value: 'ghost',
            },
            {
              label: 'Dragon',
              value: 'dragon',
            },
            {
              label: 'Dark',
              value: 'dark',
            },
            {
              label: 'Steel',
              value: 'steel',
            },
            {
              label: 'Fairy',
              value: 'fairy',
            },
          ],
        },
        {
          name: 'favouritePokemon',
          label: 'Favourite Pokemon',
          type: FormFieldType.SELECT,
          options: pokemonList,
          dynamicOptions: (form, options) => {
            const selectedTypes = form
              .getField('favouritePokemonTypes')
              .value() as FormOption[];

            if (!Array.isArray(selectedTypes) || selectedTypes.length === 0) {
              return options;
            }

            const selectedTypeValues = selectedTypes.map((type) =>
              String(type.value).toLowerCase(),
            );

            return (options as typeof pokemonList).filter((opt) => {
              const types = opt.value.typings.map((t: string) =>
                t.toLowerCase(),
              );
              return selectedTypeValues.every((selected) =>
                types.includes(selected),
              );
            });
          },
        },
        {
          name: 'instructions',
          label: 'Delivery instructions',
          type: FormFieldType.TEXTAREA,
          config: {
            placeholder: 'any delivery instructions we should know about?',
          },
        },
        {
          name: 'expectedDate',
          label: 'expected date',
          type: FormFieldType.DATETIME,
        },
        {
          name: 'postTo',
          label: 'post to',
          type: FormFieldType.MULTISELECT,
          options: [
            {
              value: 'CAN',
              label: 'Canada',
            },
            {
              value: 'RUS',
              label: 'Russia',
            },
            {
              value: 'AUS',
              label: 'Australia',
            },
          ],
        },
        {
          name: 'priority',
          label: 'Priority',
          type: FormFieldType.RADIO,
          options: [
            {
              label: 'High',
              value: 'HIGH',
            },
            {
              label: 'Medium',
              value: 'MEDIUM',
            },
            {
              label: 'Low',
              value: 'LOW',
            },
          ],
        },
      ],
      config: {
        view: 'collapsable',
        layout: 'flex',
      },
    };

    const aboutForm: SignalFormFieldBuilderInput<Basket> = {
      heading: 'About you',
      subheading: 'a few small things about you',
      name: 'about',
      fields: [
        {
          label: 'Profile Picture',
          name: 'profilePicture',
          type: FormFieldType.FILE,
          config: {
            maxSizeMb: 5,
          },
        },
        {
          name: 'bannerColor',
          label: 'Banner Color',
          type: FormFieldType.COLOR,
          config: {
            view: 'swatch',
          },
        },
        {
          name: 'phoneNumber',
          label: 'Phone Number',
          type: FormFieldType.MASKED,
          config: {
            mask: '(999) 999-9999',
            placeholderChar: '_',
            hint: 'Enter a 10-digit phone number',
          },
          validators: [(val) => (!val ? 'this is required' : null)],
        },
        {
          name: 'beastMode',
          label: 'Beast Mode',
          type: FormFieldType.SWITCH,
        },
        {
          name: 'brightness',
          label: 'Brightness',
          type: FormFieldType.SLIDER,
        },
        {
          name: 'rating',
          label: 'rating',
          type: FormFieldType.RATING,
        },
      ],
      config: {
        view: 'collapsable',
        layout: 'grid-area',
        gridArea: [
          ['profilePicture', 'profilePicture', 'beastMode'],
          ['profilePicture', 'profilePicture', '.'],
          ['profilePicture', 'profilePicture', 'bannerColor'],
          ['profilePicture', 'profilePicture', '.'],
          ['brightness', 'phoneNumber', 'rating'],
        ],
      },
    };

    this.form = FormBuilder.createForm<Basket>({
      title: 'Test Form',
      model,
      fields: [
        addressForm,
        aboutForm,
        {
          name: 'apples',
          label: 'apples',
          type: FormFieldType.NUMBER,
          config: {},
          validators: [(x) => (x < 0 ? 'only positive value' : null)],
        },
        {
          name: 'applePrice',
          label: 'Price per apple',
          type: FormFieldType.NUMBER,
          validators: [OnlyPositiveValidator('applePrice')],
        },
        {
          name: 'appleTotal',
          label: 'Total Apple Price',
          type: FormFieldType.NUMBER,
          disabled: (form) => !!form.getField('apples').error(),
          computedValue: (form) => {
            const apples = form.getField('apples').value();
            const price = form.getField('applePrice').value();

            return apples * price;
          },
          validators: [OnlyPositiveValidator('appleTotal')],
        },
        {
          name: 'pears',
          label: 'Number of Pears',
          type: FormFieldType.NUMBER,
        },
        {
          name: 'pearPrice',
          label: 'Price per pear',
          type: FormFieldType.NUMBER,
          validators: [OnlyPositiveValidator('pearPrice')],
        },
        {
          name: 'pearTotal',
          label: 'Total Pear Price',
          type: FormFieldType.NUMBER,
          computedValue: (form) => {
            const pears = form.getField('pears').value();
            const price = form.getField('pearPrice').value();
            return pears * price;
          },
          validators: [OnlyPositiveValidator('pearTotal')],
        },
        {
          name: 'isOrganic',
          label: 'is Organic',
          type: FormFieldType.CHECKBOX,
          options: [],
        },
        {
          name: 'total',
          label: 'Total Price',
          type: FormFieldType.NUMBER,
          computedValue: (form) =>
            form.getField('appleTotal').value() +
            form.getField('pearTotal').value(),
          validators: [
            SignalValidators.hasValue('applePrice'),
            SignalValidators.hasValue('pearPrice'),
            SignalValidators.min(100),
          ],
        },
      ],
      onSave: (value) => this.save(value),
      config: {
        layout: 'grid-area',
        gridArea: [
          ['address', 'address', 'address'],
          ['about', 'about', 'about'],
          ['apples', 'applePrice', 'appleTotal'],
          ['pears', 'pearPrice', 'pearTotal'],
          ['isOrganic', 'isOrganic', 'isOrganic'],
          ['total', 'total', 'total'],
        ],
      },
    });
  }

  protected save(e: Basket) {
    console.log(e);
    console.log('raw value', this.form.rawValue());
    console.log('value', this.form.value());
    console.log(this.form.getErrors());
  }
}
