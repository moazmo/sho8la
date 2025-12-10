import { useState, useCallback } from 'react';
import { jobsApi, proposalsApi, reviewsApi, messagesApi, verificationsApi, paymentsApi, walletsApi } from '@/lib/apiServices';

export const useJobs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getJobs = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      return await jobsApi.getAll(filters);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getJobById = useCallback(async (jobId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await jobsApi.getById(jobId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      return await jobsApi.create(data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateJob = useCallback(async (jobId: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      return await jobsApi.update(jobId, data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteJob = useCallback(async (jobId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await jobsApi.delete(jobId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getJobs, getJobById, createJob, updateJob, deleteJob, loading, error };
};

export const useProposals = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      return await proposalsApi.submit(data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const accept = useCallback(async (proposalId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await proposalsApi.accept(proposalId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reject = useCallback(async (proposalId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await proposalsApi.reject(proposalId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submit, accept, reject, loading, error };
};

export const useReviews = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      return await reviewsApi.create(data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
};

export const useMessages = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      return await messagesApi.send(data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { send, loading, error };
};

export const useWallet = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withdraw = useCallback(async (userId: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      return await walletsApi.withdraw(userId, data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { withdraw, loading, error };
};
