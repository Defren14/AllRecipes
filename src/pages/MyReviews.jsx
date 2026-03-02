// AllRecipes/src/pages/MyReviews.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReviewItem from '../components/reviews/ReviewItem';
import ReviewForm from '../components/reviews/ReviewForm';
import { reviewService } from '../services/reviewService';
import './MyReviews.css';

const MyReviews = () => {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [editingReview, setEditingReview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [reviewReplies, setReviewReplies] = useState({});
  const [initialLoad, setInitialLoad] = useState(true); 
  const navigate = useNavigate();

  // Get user from localStorage
  const getLocalStorageUser = () => {
    console.log("TEST3")
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

  useEffect(() => {
    const currentUser = getLocalStorageUser();
    
    if (!currentUser) {

      navigate('/login');
      return;
    }

    setUser(currentUser);
    setInitialLoad(false);

    console.log('Setting up reviews listener for user:', currentUser.uid || currentUser.email);

    // Set up real-time listener for user's reviews
    const unsubscribe = reviewService.getUserReviews(
      currentUser.uid || currentUser.email,
      (reviewsData) => {
        console.log('My Reviews - Received reviews data:', reviewsData);
        setReviews(reviewsData);

        // Set up listeners for replies to each review
        reviewsData.forEach(review => {
          reviewService.getReviewReplies(review.id, (repliesData) => {
            setReviewReplies(prev => ({
              ...prev,
              [review.id]: repliesData
            }));
          });
        });
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigate]);

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleDeleteReview = async (reviewId) => {

    setLoading(true);
    
    try {
      const result = await reviewService.deleteReview(reviewId);
      if (!result.success) {
        alert('Error deleting review: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (reviewId, replyData) => {
    if (!user) return;

    try {
      const submissionData = {
        ...replyData,
        reviewId: reviewId,
        userId: user.uid || user.email,
        userName: user.name || user.email.split('@')[0],
        userEmail: user.email,
        userProfilePicture: user.profilePicture || null
      };

      const result = await reviewService.addReply(submissionData);
      if (!result.success) {
        alert('Error adding reply: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Error adding reply. Please try again.');
    }
  };

  const handleEditReply = async (replyId, replyData) => {
    try {
      const result = await reviewService.updateReply(replyId, replyData);
      if (!result.success) {
        alert('Error updating reply: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating reply:', error);
      alert('Error updating reply. Please try again.');
    }
  };

  const handleDeleteReply = async (replyId) => {

    try {
      const result = await reviewService.deleteReply(replyId);
      if (!result.success) {
        alert('Error deleting reply: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Error deleting reply. Please try again.');
    }
  };

  const handleSubmitReview = async (reviewData) => {
    if (!editingReview) return;

    setLoading(true);
    
    try {
      const result = await reviewService.updateReview(editingReview.id, reviewData);
      
      if (result.success) {
        setShowForm(false);
        setEditingReview(null);
      } else {
        alert('Error updating review: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Error updating review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  if (initialLoad || (loading && !user)) {
    return (
      <div className="my-reviews-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="my-reviews-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>My Reviews</h1>
          <p className="page-description">
            Manage all your recipe reviews in one place
          </p>
        </div>
      </div>

      {/* Edit Form */}
      {showForm && editingReview && (
        <div className="edit-form-section">
          <h2>Edit Review for "{editingReview.recipeTitle}"</h2>
          <ReviewForm
            onSubmit={handleSubmitReview}
            onCancel={handleCancelForm}
            initialData={editingReview}
            isEditing={true}
            loading={loading}
          />
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-content">
        {reviews.length === 0 ? (
          <div className="no-reviews-state">
            <div className="no-reviews-icon">
              <svg viewBox="0 0 24 24" className="icon">
                <path d="M9 22a1 1 0 01-1-1v-3H4a2 2 0 01-2-2V4a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2h-6.1l-3.7 3.71c-.2.19-.45.29-.7.29H9z"/>
              </svg>
            </div>
            <h2>No reviews yet</h2>
            <p>Start exploring recipes and share your cooking experiences!</p>
            <button 
              onClick={() => navigate('/')}
              className="explore-btn"
            >
              Explore Recipes
            </button>
          </div>
        ) : (
          <div className="reviews-list">
            <h2 className="reviews-list-title">
              Your Reviews ({reviews.length})
            </h2>
            {reviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                currentUser={user}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
                isOwner={true}
                showRecipeInfo={true}
                replies={reviewReplies[review.id] || []}
                onReply={handleReply}
                onEditReply={handleEditReply}
                onDeleteReply={handleDeleteReply}
              />
            ))}
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {loading && user && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default MyReviews;