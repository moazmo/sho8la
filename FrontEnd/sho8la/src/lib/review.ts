// Reviews and Ratings system

export interface Review {
  id: string;
  jobId: string;
  proposalId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: number;
}

const REVIEWS_KEY = 'sho8la_reviews';

export const reviewUtils = {
  submitReview: (
    jobId: string,
    proposalId: string,
    fromUserId: string,
    fromUserName: string,
    toUserId: string,
    toUserName: string,
    rating: number,
    comment: string
  ): Review => {
    if (typeof window === 'undefined') return {} as Review;

    const review: Review = {
      id: `review_${Date.now()}`,
      jobId,
      proposalId,
      fromUserId,
      fromUserName,
      toUserId,
      toUserName,
      rating,
      comment,
      createdAt: Date.now(),
    };

    const reviews: Review[] = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
    reviews.push(review);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));

    return review;
  },

  getReviewsByUser: (userId: string): Review[] => {
    if (typeof window === 'undefined') return [];
    const reviews: Review[] = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
    return reviews.filter((r) => r.toUserId === userId);
  },

  getUserRating: (userId: string): { average: number; count: number; reviews: Review[] } => {
    if (typeof window === 'undefined') return { average: 0, count: 0, reviews: [] };
    const reviews = reviewUtils.getReviewsByUser(userId);
    const average = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    return { average, count: reviews.length, reviews };
  },

  getJobReview: (jobId: string): Review | undefined => {
    if (typeof window === 'undefined') return undefined;
    const reviews: Review[] = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
    return reviews.find((r) => r.jobId === jobId);
  },

  hasUserReviewedJob: (jobId: string, userId: string): boolean => {
    if (typeof window === 'undefined') return false;
    const reviews: Review[] = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
    return reviews.some((r) => r.jobId === jobId && r.fromUserId === userId);
  },
};
