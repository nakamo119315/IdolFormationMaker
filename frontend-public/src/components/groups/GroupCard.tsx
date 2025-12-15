import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { GroupSummary } from '../../types';

interface GroupCardProps {
  group: GroupSummary;
  index: number;
}

export function GroupCard({ group, index }: GroupCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/groups/${group.id}`} className="block group">
        <div className="card p-6 bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-primary-600 transition-colors">
                {group.name}
              </h3>
              {group.debutDate && (
                <p className="text-sm text-slate-500 mt-1">
                  Debut: {group.debutDate}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-primary-500">{group.memberCount}</span>
              <p className="text-xs text-slate-500">Members</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
            <span>View Details</span>
            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
