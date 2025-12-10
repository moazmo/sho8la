import React, { useState } from 'react';
import Link from 'next/link';
import { Clock, Banknote, ArrowRight, Heart } from 'lucide-react';

interface JobProps {
  job: {
    _id?: string;
    id?: string;
    title: string;
    description: string;
    budget: number | string;
    category: string;
    status?: string;
    skills?: string[];
    clientId?: { name: string; profile?: { rating: number } };
    client?: string;
    createdAt?: string;
    postedAt?: string;
  };
}

const JobCard: React.FC<JobProps> = ({ job }) => {
  const [isSaved, setIsSaved] = useState(false);

  const jobId = job._id || job.id;
  const clientName = job.clientId?.name || job.client || 'Client';
  const budget = typeof job.budget === 'number' ? `${job.budget} EGP` : job.budget;
  const postedDate = job.createdAt || job.postedAt;
  const status = job.status || 'open';
  const skills = job.skills || [];

  const statusStyles: Record<string, string> = {
    'open': 'bg-green-100 text-green-700',
    'Open': 'bg-green-100 text-green-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'completed': 'bg-gray-100 text-gray-600',
    'Completed': 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 group">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {job.title}
          </h3>
          <p className="text-sm text-gray-500 font-medium">{clientName}</p>
        </div>

        <button
          onClick={(e) => { e.preventDefault(); setIsSaved(!isSaved); }}
          className={`p-2 rounded-lg transition ${isSaved ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'}`}
          title={isSaved ? 'Remove from saved' : 'Save job'}
        >
          <Heart className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
        </button>

        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[status] || 'bg-gray-100 text-gray-600'}`}>
          {status}
        </span>
      </div>

      <p className="text-gray-600 mt-3 line-clamp-2 text-sm leading-relaxed">
        {job.description}
      </p>

      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Banknote className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-gray-900">{budget}</span>
        </div>
        {postedDate && (
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>{new Date(postedDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-50 flex justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          {skills.slice(0, 3).map((skill, index) => (
            <span key={index} className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200">
              {skill}
            </span>
          ))}
        </div>

        <Link href={`/jobs/${jobId}`} className="text-blue-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
          View Details <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default JobCard;