// AllRecipes/src/pages/MyFavorites.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import './RecentlyViewed.css';

const RecentlyViewed = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const API_KEY = import.meta.env.VITE_RECIPE_API_KEY;

    const parseRecentlyViewedIds = () => {
        const raw = localStorage.getItem('recentlyViewed');
        if (!raw) return [];

        const ids = raw.split(',').map((id) => id.trim()).filter(Boolean);
        const uniqueOrdered = ids.filter((id, i) => ids.indexOf(id) === i); // keep first most recent occurrence
        return uniqueOrdered.slice(0, 10); // max 10 recipes
    };

    const getRecipeFromIndex = (index) => {
        const ids = parseRecentlyViewedIds();
        return ids[index] || null;
    };

    //  Recently viewed recipes will be stored in localStorage with the key 'recentlyViewed', they will
    //  be stored in the format of 'xxxxxx,xxxxxx,xxxxxx ...', where index 0 of that string is the 6
    //  digit recipe id of the most recently viewed recipe.
    //
    //  Above is a function to decode recently viewed recipes from localStorage

    const fetchRecipeDetails = async () => {
        setLoading(true);
        setError('');

        const ids = parseRecentlyViewedIds();
        if (!ids.length) {
            setRecipes([]);
            setLoading(false);
            return;
        }

        if (!API_KEY) {
            setError('No API key found. Cannot fetch recipe details.');
            setRecipes([]);
            setLoading(false);
            return;
        }

        try {
            const uniqueIds = [...new Set(ids)].slice(0, 20);
            const loaded = await Promise.all(
                uniqueIds.map(async (id) => {
                    try {
                        const res = await fetch(
                            `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`
                        );
                        if (!res.ok) return null;
                        return await res.json();
                    } catch {
                        return null;
                    }
                })
            );

            setRecipes(loaded.filter(Boolean));
        } catch {
            setError('Could not load recently viewed recipes.');
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipeDetails();
    }, []);

    return (
        <div className="recently-viewed-page">
            <header className="recently-viewed-header">
                <div>
                    <h1>Recently Viewed Recipes</h1>
                    <p>
                        Recipes you opened are saved in localStorage under <code>recentlyViewed</code> as
                        comma-separated IDs.
                    </p>
                </div>
                <div className="recently-viewed-stats">
                    <span><strong>IDs stored:</strong> {parseRecentlyViewedIds().length}</span>
                    <span><strong>First ID:</strong> {getRecipeFromIndex(0) || 'N/A'}</span>
                </div>
            </header>

            {error && <div className="recently-viewed-error">{error}</div>}

            {loading ? (
                <div className="recently-viewed-grid loading">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="loading-card">Loading...</div>
                    ))}
                </div>
            ) : recipes.length ? (
                <div className="recently-viewed-grid">
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe.id} data={recipe} />
                    ))}
                </div>
            ) : (
                <div className="recently-viewed-empty">
                    <p>You haven't viewed any recipes yet.</p>
                    <Link to="/">Browse recipes</Link>
                </div>
            )}
        </div>
    );
};

export default RecentlyViewed;