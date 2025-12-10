export interface IDVerification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  documentUrl: string;
  university: string;
  studentId: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: number;
  verifiedAt?: number;
  rejectionReason?: string;
}

const VERIFICATION_KEY = 'sho8la_id_verifications';

export const verificationUtils = {
  submitVerification(userId: string, userName: string, userEmail: string, university: string, studentId: string, documentUrl: string) {
    const verification: IDVerification = {
      id: `ver_${Date.now()}`,
      userId,
      userName,
      userEmail,
      documentUrl,
      university,
      studentId,
      status: 'pending',
      submittedAt: Date.now(),
    };
    const verifications: IDVerification[] = JSON.parse(localStorage.getItem(VERIFICATION_KEY) || '[]');
    verifications.push(verification);
    localStorage.setItem(VERIFICATION_KEY, JSON.stringify(verifications));
    return verification;
  },

  getUserVerification(userId: string) {
    const verifications: IDVerification[] = JSON.parse(localStorage.getItem(VERIFICATION_KEY) || '[]');
    return verifications.find((v) => v.userId === userId);
  },

  getPendingVerifications() {
    const verifications: IDVerification[] = JSON.parse(localStorage.getItem(VERIFICATION_KEY) || '[]');
    return verifications.filter((v) => v.status === 'pending').sort((a, b) => b.submittedAt - a.submittedAt);
  },

  approveVerification(verificationId: string) {
    const verifications: IDVerification[] = JSON.parse(localStorage.getItem(VERIFICATION_KEY) || '[]');
    const verification = verifications.find((v) => v.id === verificationId);
    if (!verification) return null;
    
    verification.status = 'verified';
    verification.verifiedAt = Date.now();
    localStorage.setItem(VERIFICATION_KEY, JSON.stringify(verifications));
    return verification;
  },

  rejectVerification(verificationId: string, reason: string) {
    const verifications: IDVerification[] = JSON.parse(localStorage.getItem(VERIFICATION_KEY) || '[]');
    const verification = verifications.find((v) => v.id === verificationId);
    if (!verification) return null;
    
    verification.status = 'rejected';
    verification.rejectionReason = reason;
    localStorage.setItem(VERIFICATION_KEY, JSON.stringify(verifications));
    return verification;
  },

  isUserVerified(userId: string) {
    const verification = verificationUtils.getUserVerification(userId);
    return verification?.status === 'verified';
  },
};
