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
    this.loading = true;
    this.error = null;
    this.items = [];

    const offset = index * this.pageSize;
    console.log(`Valor del Offset ${offset}.`);

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
