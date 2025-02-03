import React, { useState, useEffect } from 'react';
import './App.css'; 

const DB_NAME = 'PokedexDB';
const STORE_NAME = 'Checklist';

const App = () => {
    const [search, setSearch] = useState('');
    const [pokemonList, setPokemonList] = useState([]);
    const [checkedPokemon, setCheckedPokemon] = useState(new Set());

    useEffect(() => {
        // Initialiser IndexedDB
        const openRequest = indexedDB.open(DB_NAME, 1);

        openRequest.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        openRequest.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                setCheckedPokemon(new Set(request.result.map((p) => p.id)));
            };
        };

        // Charger la liste de Pokémon de la génération 4 depuis PokeAPI
        fetch('https://pokeapi.co/api/v2/generation/4')
            .then((response) => response.json())
            .then((data) => {
                const list = data.pokemon_species.map((species) => {
                    const urlParts = species.url.split('/').filter(Boolean);
                    const id = urlParts[urlParts.length - 1];
                    const name = species.name.charAt(0).toUpperCase() + species.name.slice(1);
                    return { id: Number(id), name };
                });
                list.sort((a, b) => a.id - b.id);
                setPokemonList(list);
            })
            .catch((err) => console.error("Erreur lors du chargement des données:", err));
    }, []);

    const togglePokemon = (id) => {
        setCheckedPokemon((prev) => {
            const newChecked = new Set(prev);
            if (newChecked.has(id)) {
                newChecked.delete(id);
            } else {
                newChecked.add(id);
            }
            return newChecked;
        });

        const openRequest = indexedDB.open(DB_NAME, 1);
        openRequest.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            if (checkedPokemon.has(id)) {
                store.delete(id);
            } else {
                store.put({ id });
            }
        };
    };

    return (
        <div className="h-screen w-full bg-gray-50 flex flex-col items-center">
            <h1 className="text-4xl font-bold text-center text-blue-700 mt-6 mb-6">Pokédex Checklist</h1>
            <input
                type="text"
                placeholder="Rechercher un Pokémon..."
                className="border-2 p-3 rounded-md w-full max-w-md mx-auto mb-6"
                value={search}
                onChange={(e) => setSearch(e.target.value.toLowerCase())}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full p-4 overflow-auto">
                {pokemonList
                    .filter((pokemon) =>
                        pokemon.name.toLowerCase().includes(search)
                    )
                    .map((pokemon) => (
                        <div
                            key={pokemon.id}
                            onClick={() => togglePokemon(pokemon.id)}
                            className={`bg-white rounded-lg shadow-md p-4 flex flex-col items-center space-y-3 ${checkedPokemon.has(pokemon.id) ? 'bg-green-200' : ''}`}
                        >
                            {/* Affichage de l'image du Pokémon */}
                            <img
                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                                alt={pokemon.name}
                                className="w-32 h-32 object-contain"
                            />
                            <span className="text-xl font-semibold text-gray-800">{pokemon.name}</span>
                            <input
                                type="checkbox"
                                checked={checkedPokemon.has(pokemon.id)}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    togglePokemon(pokemon.id);
                                }}
                                className="self-center"
                            />
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default App;
