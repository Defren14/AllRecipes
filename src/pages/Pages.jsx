// AllRecipes/src/pages/Pages.jsx

import React from 'react'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./Home";
import Cuisine from "./Cuisine";
import Searched from "./Searched";
import Recipe from "./Recipe";
import AuthPage from "./AuthPage";
import MyFavorites from "./MyFavorites";
import MyReviews from "./MyReviews";
import RecentlyViewed from "./RecentlyViewed";
import Category from "../components/Category";
import Search from "../components/Search";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MealPlannerPage from "./MealPlannerPage"; // Import your Meal Planner page

const Pages = () => {
    return (
        <Router>
            <div style={{ minHeight: '100vh' }}>
                <Header />
                <div className="pages-container" style={{ 
                    paddingTop: '80px',  
                    paddingBottom: '60px', 
                    minHeight: 'calc(100vh - 140px)'
                }}>
                    <Routes>
                        {/* ORIGINAL ROUTES - Keep exactly as they were */}
                        <Route path="/" element={[<Search />, <Category />, <Home />]} />
                        <Route path="/cuisine/:type" element={[<Search />, <Category />, <Cuisine />]} />
                        <Route path="/searched/:search" element={[<Search />, <Category />, <Searched />]} />
                        <Route path="/searched/:search/recipe/:name" element={<Recipe />} />
                        <Route path="/cuisine/:type/recipe/:name" element={<Recipe />} />
                        <Route path="/recipe/:name" element={<Recipe />} />
                        
                        {/* LOGIN ROUTE */}
                        <Route path="/login" element={<AuthPage />} />
                        
                        {/* MY FAVORITES ROUTE */}
                        <Route path="/my-favorites" element={<MyFavorites />} />

                        {/* MEAL PLANNER ROUTE */}
                        <Route path="/meal-planner" element={<MealPlannerPage />} />

                        {/* MY REVIEWS ROUTE */}
                        <Route path="/my-reviews" element={<MyReviews />} />

                        {/* MY REVIEWS ROUTE */}
                        <Route path="/recently-viewed" element={<RecentlyViewed />} />

                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
    );
};

export default Pages;