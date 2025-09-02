export interface PokeListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{ name: string; url: string }>;
}

export interface PokemonType {
  slot: number;
  type: { name: string; url: string };
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: string;
  sprites: {
    front_default: string | null;
    other?: { 'official-artwork'?: { front_default: string | null } };
  };
  types: PokemonType[];
}
