// AllRecipes/src/pages/Recipe.jsx

import { useEffect, useState } from 'react';
import './Recipe.css';
import { useParams } from 'react-router-dom';
import { Button, Skeleton } from '@mui/material';
import FavoriteButton from '../components/FavoriteButton';
import ReviewSection from '../components/reviews/ReviewSection';

const Recipe = () => {
    
    const [details, setDetails] = useState();
    const [active, setActive] = useState('summary');
    const [user, setUser] = useState(null);
    const params = useParams();

    const API_KEY = import.meta.env.VITE_RECIPE_API_KEY;

    const getLocalStorageUser = () => {
        
        try {
            const userData = localStorage.getItem('allRecipesUser');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                if (parsedUser.isLoggedIn) {
                    return parsedUser;
                }
            }
            return null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    };

    const fetchDetails = async () => {
        if (!API_KEY) {
            console.error('API key not found');
            return;
        }

        try {
            const response = await fetch(`https://api.spoonacular.com/recipes/${params.name}/information?apiKey=${API_KEY}`);
            if (response.status === 402) {
                console.error('API quota hit for the day');
                setDetails({ title: 'Quota exceeded', summary: 'Please try again tomorrow.', instructions: '' });
                return;
            }

            if (!response.ok) {
                console.error('Error fetching recipe details:', response.statusText);
                return;
            }

            const detailsData = await response.json();
            console.log(detailsData);
            setDetails(detailsData);
        } catch (error) {
            console.error('Error fetching recipe details:', error);
        }
    }

    useEffect(() => {        
        let recStorage = localStorage.getItem('recentlyViewed') || '';
        recStorage = params.name + ',' + recStorage;    // Add recipe to start of list

        if (recStorage.length >= 71) {
            recStorage = recStorage.substring(0, 69);   // Limit to 10 recipes
        }

        localStorage.setItem('recentlyViewed', recStorage);
        console.log(`Local recently viewed history: ${recStorage}`);

        fetchDetails();
        
        const currentUser = getLocalStorageUser();
        setUser(currentUser);

        const handleStorageChange = () => {
            const updatedUser = getLocalStorageUser();
            setUser(updatedUser);
        };

        const interval = setInterval(handleStorageChange, 500);
        
        window.addEventListener('storage', handleStorageChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [params.name]);

    // kobra's code 

useEffect(() => {
    if (!details) return;

    const stored = JSON.parse(localStorage.getItem('recentRecipes') || '[]');

    const updated = [
        {
            id: details.id,
            title: details.title,
            image: details.image,
        },
        ...stored.filter((recipe) => recipe.id !== details.id),
    ].slice(0, 10);

    localStorage.setItem('recentRecipes', JSON.stringify(updated));
}, [details]);

//end the code 
    const handleClick = (status) => {
        setActive(status)
    }

    if(details === undefined) {
        return (
            <div className="recipe-shimmer-container">
                <div className="recipe-shimmer-left">
                    <Skeleton variant='text' sx={{fontSize: '3rem'}} animation='wave' />
                    <Skeleton variant='rectangular' animation='wave' height={300} width={500} />
                </div>
                <div className="recipe-shimmer-right">
                    <div className="btn-shimmer-right">
                        <Skeleton variant='rounded' animation='wave' height={35} width={120} />
                        <Skeleton variant='rounded' animation='wave' height={35} width={120} />
                        <Skeleton variant='rounded' animation='wave' height={35} width={120} />
                    </div>
                    <div className="shimmer-content-right">
                        <Skeleton variant='text' sx={{fontSize:'2.5rem'}} animation='wave' />
                        <div className="text-container-shimmer">
                            <Skeleton variant='text' sx={{fontSize:'1.5rem'}} animation='wave' />
                            <Skeleton variant='text' sx={{fontSize:'1.5rem'}} animation='wave' />
                            <Skeleton variant='text' sx={{fontSize:'1.5rem'}} animation='wave' />
                            <Skeleton variant='text' sx={{fontSize:'1.5rem'}} animation='wave' />
                            <Skeleton variant='text' sx={{fontSize:'1.5rem'}} animation='wave' />
                            <Skeleton variant='text' sx={{fontSize:'1.5rem'}} animation='wave' />
                            <Skeleton variant='text' sx={{fontSize:'1.5rem'}} animation='wave' />
                            <Skeleton variant='text' sx={{fontSize:'1.5rem'}} animation='wave' />
                            <Skeleton variant='text' sx={{fontSize:'1.5rem'}} animation='wave' />
                            <Skeleton variant='text' sx={{fontSize:'1.5rem'}} animation='wave' />
                            <Skeleton variant='text' sx={{fontSize:'1.5rem'}} animation='wave' />
                            <Skeleton variant='text' sx={{fontSize:'1.5rem'}} animation='wave' />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="recipe-container-main">
            <div className="recipe-title-with-favorite">
                <h1>{details?.title}</h1>
                <div className="recipe-favorite-btn">
                    <FavoriteButton 
                        recipe={{
                            id: details.id,
                            title: details.title,
                            image: details.image,
                            summary: details.summary?.replace(/<[^>]*>/g, '') || ''
                        }}
                        size="large"
                        showToast={true}
                    />
                </div>
            </div>
            <div className="recipe-container">
                <div className="recipe-container-left">
                    <img src={details?.image} className='recipe-imgs' alt={details?.title} />
                </div>
                <div className="recipe-container-right">
                    <div className="btn-container">
                        <Button 
                            variant='contained' 
                            onClick={() => handleClick('summary')}
                            disabled={active === 'summary' ? true : false}>
                            Summary
                        </Button>
                        <Button 
                            variant='contained'
                            onClick={() => handleClick('ingredients')}
                            disabled={active === 'ingredients' ? true : false}>
                            ingredients
                        </Button>
                        <Button 
                            variant='contained'
                            onClick={() => handleClick('steps')}
                            disabled={active === 'steps' ? true : false}>
                                Steps
                        </Button>
                    </div>
                    {active === 'summary' && 
                        <div className="recipe-right-main">
                            <div className="summary">
                               <h2>Summary</h2>
                               <p dangerouslySetInnerHTML={{__html: details?.summary}}></p>
                             </div>
                            <div className="instructions">
                               <h2>Instructions</h2>
                               <p dangerouslySetInnerHTML={{__html: details?.instructions}}></p>
                            </div>
                        </div>
                    }
                    {active === 'ingredients' && (
                            details?.extendedIngredients?.map((data) => (
                                <div className="ingredient-bar" key={data?.id}>
                                    <h3 className='ingredients-h3'>
                                        <p>{data?.name}</p>
                                        <p> {data?.amount} grams</p>
                                    </h3>
                                </div>
                            ))
                    )}
                    {
                        active === 'steps' && (
                            <div className="steps">
                                <h1>Steps</h1>
                                {details?.analyzedInstructions?.[0]?.steps?.map((data) => (
                                    <div className="step" key={data?.step}>
                                        <h2>Step - {data?.number}</h2>
                                        <p>{data?.step}</p>
                                        {data?.ingredients?.[0]?.name && (
                                            <h4>Ingredients - {data?.ingredients[0]?.name}</h4>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    }
                </div>     
            </div>

            {/* Review Section */}
            <ReviewSection 
                recipe={{
                    id: details?.id,
                    title: details?.title,
                    image: details?.image
                }}
                user={user}
            />
        </div>
    )
}

export default Recipe;