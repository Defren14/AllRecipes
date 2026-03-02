// AllRecipes/src/services/reviewService.js - FIXED VERSION

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp, 
  getDocs,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const reviewService = {
  // Adds a new review
  addReview: async (reviewData) => {
    try {
      if (!reviewData.userId || !reviewData.recipeId) {
        throw new Error('Missing required fields: userId or recipeId');
      }

      console.log('Adding review to Firestore:', reviewData);
      
      const docRef = await addDoc(collection(db, 'reviews'), {
        ...reviewData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('Review added successfully with ID:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding review:', error);
      return { success: false, error: error.message };
    }
  },

  // Adds a new reply
  addReply: async (replyData) => {
    try {
      console.log('Adding reply to Firestore:', replyData);
      
      const docRef = await addDoc(collection(db, 'replies'), {
        ...replyData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('Reply added successfully with ID:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding reply:', error);
      return { success: false, error: error.message };
    }
  },

  // Updates an existing review
  updateReview: async (reviewId, updateData) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating review:', error);
      return { success: false, error: error.message };
    }
  },

  // Updates an existing reply
  updateReply: async (replyId, updateData) => {
    try {
      const replyRef = doc(db, 'replies', replyId);
      await updateDoc(replyRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating reply:', error);
      return { success: false, error: error.message };
    }
  },

  // Updates profile picture in all user's reviews
  updateUserProfilePictureInReviews: async (userId, newProfilePicture) => {
    try {
      console.log('🔄 Updating profile picture in reviews for userId:', userId);
      
      // Get all reviews collection reference
      const reviewsRef = collection(db, 'reviews');
      
      // Query for all reviews by this user
      const q = query(reviewsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      // Batch update all reviews
      const batch = writeBatch(db);
      let updateCount = 0;
      
      querySnapshot.forEach((docSnapshot) => {
        batch.update(docSnapshot.ref, {
          userProfilePicture: newProfilePicture,
          profilePictureUpdated: serverTimestamp()
        });
        updateCount++;
      });
      
      if (updateCount > 0) {
        await batch.commit();
        console.log(`✅ Updated profile picture in ${updateCount} reviews`);
      } else {
        console.log('ℹ️ No reviews found to update');
      }
      
      return { success: true, updatedCount: updateCount };
    } catch (error) {
      console.error('❌ Error updating profile picture in reviews:', error);
      return { success: false, error: error.message };
    }
  },

  // Updates profile picture in all user's replies
  updateUserProfilePictureInReplies: async (userId, newProfilePicture) => {
    try {
      console.log('🔄 Updating profile picture in replies for userId:', userId);
      
      // Get all replies collection reference
      const repliesRef = collection(db, 'replies');
      
      // Query for all replies by this user
      const q = query(repliesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      // Batch update all replies
      const batch = writeBatch(db);
      let updateCount = 0;
      
      querySnapshot.forEach((docSnapshot) => {
        batch.update(docSnapshot.ref, {
          userProfilePicture: newProfilePicture,
          profilePictureUpdated: serverTimestamp()
        });
        updateCount++;
      });
      
      if (updateCount > 0) {
        await batch.commit();
        console.log(`✅ Updated profile picture in ${updateCount} replies`);
      } else {
        console.log('ℹ️ No replies found to update');
      }
      
      return { success: true, updatedCount: updateCount };
    } catch (error) {
      console.error('❌ Error updating profile picture in replies:', error);
      return { success: false, error: error.message };
    }
  },

  // Deletes a review
  deleteReview: async (reviewId) => {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting review:', error);
      return { success: false, error: error.message };
    }
  },

  // Deletes a reply
  deleteReply: async (replyId) => {
    try {
      await deleteDoc(doc(db, 'replies', replyId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting reply:', error);
      return { success: false, error: error.message };
    }
  },

  // Get reviews for a specific recipe
  getRecipeReviews: (recipeId, callback) => {
    //console.log('Setting up listener for recipeId:', recipeId);
    
    const reviewsRef = collection(db, 'reviews');

    return onSnapshot(reviewsRef, 
      (snapshot) => {
        try {
          console.log('Got snapshot with', snapshot.size, 'documents');
          
          const allReviews = [];
          snapshot.forEach((doc) => {
            try {
              const data = doc.data();
              allReviews.push({
                id: doc.id,
                ...data
              });
            } catch (docError) {
              console.error('Error processing document:', doc.id, docError);
            }
          });
          
          // Filter for this recipe
          const recipeReviews = allReviews.filter(review => {
            return review.recipeId === String(recipeId);
          });
          
          console.log('Found', recipeReviews.length, 'reviews for recipe', recipeId);
          
          // Sort by date for newest first
          recipeReviews.sort((a, b) => {
            try {
              const aTime = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
              const bTime = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
              return bTime - aTime;
            } catch (sortError) {
              console.error('Error sorting reviews:', sortError);
              return 0;
            }
          });
          
          callback(recipeReviews);
        } catch (error) {
          console.error('Error processing snapshot:', error);
          callback([]);
        }
      },
      (error) => {
        console.error('Firestore listener error:', error);
        callback([]);
      }
    );
  },

  // Get reviews by user
  getUserReviews: (userId, callback) => {
    console.log('Setting up user listener for userId:', userId);
    
    const reviewsRef = collection(db, 'reviews');

    return onSnapshot(reviewsRef, 
      (snapshot) => {
        try {
          const allReviews = [];
          snapshot.forEach((doc) => {
            try {
              const data = doc.data();
              allReviews.push({
                id: doc.id,
                ...data
              });
            } catch (docError) {
              console.error('Error processing user review document:', doc.id, docError);
            }
          });
          
          // Filter for this user
          const userReviews = allReviews.filter(review => review.userId === userId);
          
          console.log('Found', userReviews.length, 'reviews for user', userId);
          
          // Sort by date for newest first
          userReviews.sort((a, b) => {
            try {
              const aTime = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
              const bTime = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
              return bTime - aTime;
            } catch (sortError) {
              console.error('Error sorting user reviews:', sortError);
              return 0;
            }
          });
          
          callback(userReviews);
        } catch (error) {
          console.error('Error processing user reviews snapshot:', error);
          callback([]);
        }
      },
      (error) => {
        console.error('User reviews listener error:', error);
        callback([]);
      }
    );
  },

  // Get replies for a review
  getReviewReplies: (reviewId, callback) => {
    console.log('Setting up replies listener for reviewId:', reviewId);
    
    const repliesRef = collection(db, 'replies');

    return onSnapshot(repliesRef, 
      (snapshot) => {
        try {
          const allReplies = [];
          snapshot.forEach((doc) => {
            try {
              const data = doc.data();
              allReplies.push({
                id: doc.id,
                ...data
              });
            } catch (docError) {
              console.error('Error processing reply document:', doc.id, docError);
            }
          });
          
          // Filter for this review
          const reviewReplies = allReplies.filter(reply => reply.reviewId === reviewId);
          
          console.log('Found', reviewReplies.length, 'replies for review', reviewId);
          
          // Sort by date for oldest first for replies
          reviewReplies.sort((a, b) => {
            try {
              const aTime = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
              const bTime = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
              return aTime - bTime;
            } catch (sortError) {
              console.error('Error sorting replies:', sortError);
              return 0;
            }
          });
          
          callback(reviewReplies);
        } catch (error) {
          console.error('Error processing replies snapshot:', error);
          callback([]);
        }
      },
      (error) => {
        console.error('Replies listener error:', error);
        callback([]);
      }
    );
  },

  // Get average rating for a recipe
  getRecipeRating: async (recipeId) => {
    try {
      const snapshot = await getDocs(collection(db, 'reviews'));
      const allReviews = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        allReviews.push(data);
      });
      
      const recipeReviews = allReviews.filter(review => 
        review.recipeId === String(recipeId)
      );
      
      let totalRating = 0;
      let count = 0;
      
      recipeReviews.forEach((review) => {
        if (review.rating && typeof review.rating === 'number') {
          totalRating += review.rating;
          count++;
        }
      });
      
      const averageRating = count > 0 ? totalRating / count : 0;
      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: count
      };
    } catch (error) {
      console.error('Error getting recipe rating:', error);
      return { averageRating: 0, totalReviews: 0 };
    }
  }
};