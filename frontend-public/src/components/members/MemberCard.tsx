import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Member } from '../../types';

interface MemberCardProps {
  member: Member;
  index: number;
}

export function MemberCard({ member, index }: MemberCardProps) {
  const primaryImage = member.images.find(img => img.isPrimary) ?? member.images[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/members/${member.id}`} className="block group">
        <div className="card overflow-hidden">
          <div className="relative aspect-[3/4] bg-gradient-to-br from-slate-200 to-slate-300">
            {primaryImage ? (
              <img
                src={primaryImage.url}
                alt={member.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl text-slate-400">{member.name.charAt(0)}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">
              {member.name}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{member.birthDate}</p>
            {member.birthplace && (
              <p className="text-xs text-slate-400 mt-0.5">{member.birthplace}</p>
            )}
            {member.penLightColor1 && (
              <p className="text-xs text-primary-500 mt-1">
                {member.penLightColor1}
                {member.penLightColor2 && member.penLightColor2 !== member.penLightColor1 && `×${member.penLightColor2}`}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
