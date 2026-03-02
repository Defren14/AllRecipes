// AllRecipes/src/pages/MyFavorites.jsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import FavoriteButton from '../components/FavoriteButton';
import './RecentlyViewed.css';

const RecentlyViewed = () => {
    

    const getRecipeFromIndex = (index) => {
        return localStorage.getItem('recentlyViewed').substring(index * 7, (index + 1) * 7);
    }

    //  Recently viewed recipes will be stored in localStorage with the key 'recentlyViewed', they will
    //  be stored in the format of 'xxxxxx,xxxxxx,xxxxxx ...', where index 0 of that string is the 6
    //  digit recipe id of the most recently viewed recipe. 
    //
    //  Above is a function to decode recently viewed recipes from localStorage

    console.log(getRecipeFromIndex(0));
    console.log(getRecipeFromIndex(2));
    
};

export default RecentlyViewed;