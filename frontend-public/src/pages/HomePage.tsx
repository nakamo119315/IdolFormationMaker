import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { membersApi } from '../api/members';
import { groupsApi } from '../api/groups';

export function HomePage() {
  const { data: members } = useQuery({ queryKey: ['members'], queryFn: membersApi.getAll });
  const { data: groups } = useQuery({ queryKey: ['groups'], queryFn: groupsApi.getAll });

  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            <span className="bg-gradient-to-r from-primary-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              IDOL☆STAGE
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl mb-8 max-w-2xl mx-auto"
          >
            アイドルのフォーメーション・セトリ・ソート
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-3 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/members" className="btn-primary">
              Members
            </Link>
            <Link
              to="/groups"
              className="btn-primary"
            >
              Groups
            </Link>
            <Link
              to="/formations"
              className="btn-primary"
            >
              Formations
            </Link>
            <Link
              to="/songs"
              className="btn-primary"
            >
              Songs
            </Link>
            <Link
              to="/setlists"
              className="btn-primary"
            >
              Setlists
            </Link>
            <Link
              to="/conversations"
              className="btn-primary"
            >
              Conversations
            </Link>
            <Link
              to="/member-sort"
              className="btn-primary"
            >
              Member-Sort
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-5xl font-bold text-primary-400">{members?.length ?? 0}</div>
              <div className="text-primary-400 mt-2">Members</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-5xl font-bold text-primary-400">{groups?.length ?? 0}</div>
              <div className="text-primary-400 mt-2">Groups</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center col-span-2 md:col-span-1"
            >
              <div className="text-5xl font-bold text-primary-400">∞</div>
              <div className="text-primary-400 mt-2">Dreams</div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
