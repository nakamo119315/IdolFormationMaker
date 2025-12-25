import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/common/Layout';
import { HomePage } from './pages/HomePage';
import { MembersPage } from './pages/MembersPage';
import { GroupsPage } from './pages/GroupsPage';
import { FormationsPage } from './pages/FormationsPage';
import { SongsPage } from './pages/SongsPage';
import { DataPage } from './pages/DataPage';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分間キャッシュ
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/formations" element={<FormationsPage />} />
            <Route path="/songs" element={<SongsPage />} />
            <Route path="/data" element={<DataPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
