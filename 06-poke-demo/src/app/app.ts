import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { PokeListResponse, PokemonDetail } from './pokemon.types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit {
  title = 'Pokédex by DIAN';
  readonly pageSize = 20;

  pageIndex = 0;
  total = 0;

  loading = false;
  error: string | null = null;

  items: PokemonDetail[] = [];

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }
  get canPrev(): boolean {
    return !this.loading && this.pageIndex > 0;
  }
  get canNext(): boolean {
    return !this.loading && (this.pageIndex + 1) < this.pageCount;
  }

  ngOnInit(): void {
    void this.loadPage(0);
  }

  async loadPage(index: number): Promise<void> {
    //* Inicialización
    this.loading = true;
    this.error = null;
    this.items = [];

    //* Constantes requeridas
    const offset = index * this.pageSize;

    try {
      const listRes = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${this.pageSize}&offset=${offset}`);
      if(!listRes.ok) throw new Error(`Error en la petición: ${listRes.status} ${listRes.statusText}`);

      console.log("La respuesta HTTP es: ")
      console.log(listRes);

      const list: PokeListResponse = await listRes.json();
      console.log("El cuerpo de la respuesta es: ");
      console.log(list);

      this.total = list.count;

      const detailPromises = list.results.map( async (r) => {
        const url = r.url.startsWith('http://') ? r.url.replace('http://', 'https://') : r.url;
        const res = await fetch(url);
        if(!res.ok) throw new Error(`Error en la petición: ${res.status} ${res.statusText}`);
        const detail: PokemonDetail = await res.json();
        return detail;
      });

      this.items = await Promise.all(detailPromises);
      console.log("Los detalles de los Pokémon son: ");
      console.log(this.items);

      this.pageIndex = index;
    } catch (error) {
      console.error(error);
      this.error = 'Error al cargar los datos. Intentalo de nuevo.';
    } finally {
      this.loading = false;
    }

    //* Logs
    console.log(`Valor del Offset ${offset}.`);
    console.log(`Valor del pageSize ${this.pageSize}.`);

  }

  next(): void {
    if (this.canNext) void this.loadPage(this.pageIndex + 1);
  }
  prev(): void {
    if (this.canPrev) void this.loadPage(this.pageIndex - 1);
  }

  imageOf(p: PokemonDetail): string | null {
    return p.sprites.other?.['official-artwork']?.front_default ?? p.sprites.front_default ?? null;
  }
  typesOf(p: PokemonDetail): string[] {
    return p.types.slice().sort((a, b) => a.slot - b.slot).map(t => t.type.name);
  }
}
