import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { MembersPage } from './pages/MembersPage';
import { MemberDetailPage } from './pages/MemberDetailPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupDetailPage } from './pages/GroupDetailPage';
import { FormationsPage } from './pages/FormationsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/members/:id" element={<MemberDetailPage />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/groups/:id" element={<GroupDetailPage />} />
              <Route path="/formations" element={<FormationsPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
