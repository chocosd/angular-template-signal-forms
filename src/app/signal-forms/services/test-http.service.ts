import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Country } from 'app/examples/models/example.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TestApiService {
  constructor(private httpClient: HttpClient) {}

  public getCountry(search: string): Observable<Country[]> {
    return this.httpClient.get<Country[]>(
      `https://restcountries.com/v3.1/name/${search}`,
    );
  }

  public getPokemon(search: string): Observable<unknown[]> {
    return this.httpClient.get<unknown[]>(
      `https://pokeapi.co/api/v2/pokemon/${search}`,
    );
  }
}
