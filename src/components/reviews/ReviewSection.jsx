// AllRecipes/src/components/reviews/ReviewSection.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';
import StarRating from './StarRating';
import { reviewService } from '../../services/reviewService';
import './ReviewSection.css';

const ReviewSection = ({ recipe, user }) => {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userReview, setUserReview] = useState(null);
  const [reviewReplies, setReviewReplies] = useState({});

  useEffect(() => {
    if (!recipe?.id) {
      console.log('❌ No recipe ID provided');
      return;
    }

    //console.log('🔍 Setting up review listener for recipe:', recipe.id);

    // Set up real-time listener for reviews
    const unsubscribe = reviewService.getRecipeReviews(
      recipe.id.toString(),
      (reviewsData) => {
        console.log('📨 Received reviews from Firestore:', reviewsData);
        console.log('📊 Number of reviews:', reviewsData.length);
        
        setReviews(reviewsData);
        setTotalReviews(reviewsData.length);
        
        // Calculate average rating
        if (reviewsData.length > 0) {
          const total = reviewsData.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(total / reviewsData.length);
        } else {
          setAverageRating(0);
        }

        // Find user's existing review
        if (user) {
          const userId = user.uid || user.email;
          console.log('👤 Looking for user review with ID:', userId);
          
          const existingUserReview = reviewsData.find(
            review => {
              console.log('🔍 Comparing review userId:', review.userId, 'with current userId:', userId);
              return review.userId === userId;
            }
          );
          
          console.log('✅ User review found:', existingUserReview ? 'YES' : 'NO');
          setUserReview(existingUserReview);
        } else {
          console.log('🚫 No user logged in');
          setUserReview(null);
        }

        // Set up listeners for replies to each review
        reviewsData.forEach(review => {
          console.log('💬 Setting up reply listener for review:', review.id);
          reviewService.getReviewReplies(review.id, (repliesData) => {
            console.log('📨 Received replies for review', review.id, ':', repliesData);
            setReviewReplies(prev => ({
              ...prev,
              [review.id]: repliesData
            }));
          });
        });
      }
    );

    return () => {
      //console.log('🧹 Cleaning up review listener for recipe:', recipe.id);
      if (unsubscribe) unsubscribe();
    };
  }, [recipe?.id, user]);

  const handleSubmitReview = async (reviewData) => {
    if (!user || !recipe) {
      console.error('Missing user or recipe data');
      return;
    }

    setLoading(true);
    
    try {
      
      const userId = user.uid || user.email;
      
      if (!userId) {
        console.error('No valid user ID found');
        alert('Authentication error. Please try logging in again.');
        setLoading(false);
        return;
      }

      const submissionData = {
        ...reviewData,
        recipeId: recipe.id ? recipe.id.toString() : '',
        recipeTitle: recipe.title || 'Unknown Recipe',
        userId: userId,
        userName: user.name || user.email?.split('@')[0] || 'Anonymous',
        userEmail: user.email || '',
        userProfilePicture: user.profilePicture || null
      };

      console.log('Submitting review with data:', submissionData);

      let result;
      if (editingReview) {
        result = await reviewService.updateReview(editingReview.id, reviewData);
      } else {
        result = await reviewService.addReview(submissionData);
      }

      if (result.success) {
        setShowForm(false);
        setEditingReview(null);
        console.log('Review submitted successfully!');
      } else {
        console.error('Review submission failed:', result.error);
        alert('Error submitting review: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  const handleWriteReviewClick = () => {
    if (!user) {
      alert('Please login to write a review');
      return;
    }
    setShowForm(true);
  };

  const handleReply = async (reviewId, replyData) => {
    if (!user) return;

    try {
     
      const userId = user.uid || user.email;
      
      const submissionData = {
        ...replyData,
        reviewId: reviewId,
        userId: userId,
        userName: user.name || user.email.split('@')[0],
        userEmail: user.email,
        userProfilePicture: user.profilePicture || null
      };

      console.log('Submitting reply with userId:', userId); // Debug log

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

  return (
    <div className="review-section">
      {/* Reviews Summary Header */}
      <div className="reviews-header">
        <h2>Reviews</h2>
        {totalReviews > 0 && (
          <div className="reviews-summary">
            <div className="average-rating">
              <StarRating 
                rating={averageRating} 
                interactive={false} 
                size="medium" 
                showNumber={true}
              />
              <span className="rating-text">
                ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Write Review Button */}
      {user && !userReview && !showForm && (
        <div className="write-review-section">
          <button 
            onClick={handleWriteReviewClick}
            className="write-review-btn"
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" className="write-icon">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            Write a Recipe Review
          </button>
        </div>
      )}

      {/* Login prompt for non-logged in users */}
      {!user && (
        <div className="login-prompt">
          <p>
            Please <Link to="/login" className="login-link">login</Link> to write a review for this recipe.
          </p>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          onSubmit={handleSubmitReview}
          onCancel={handleCancelForm}
          initialData={editingReview}
          isEditing={!!editingReview}
          loading={loading}
        />
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <svg viewBox="0 0 24 24" className="no-reviews-icon">
              <path d="M9 22a1 1 0 01-1-1v-3H4a2 2 0 01-2-2V4a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2h-6.1l-3.7 3.71c-.2.19-.45.29-.7.29H9z"/>
            </svg>
            <h3>No reviews yet</h3>
            <p>Be the first to share your experience with this recipe!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              currentUser={user}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              isOwner={user && (review.userId === (user.uid || user.email))}
              showRecipeInfo={false}
              replies={reviewReplies[review.id] || []}
              onReply={handleReply}
              onEditReply={handleEditReply}
              onDeleteReply={handleDeleteReply}
            />
          ))
        )}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;