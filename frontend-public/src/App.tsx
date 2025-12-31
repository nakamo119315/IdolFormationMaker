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
import { FormationCreatePage } from './pages/FormationCreatePage';
import { SongsPage } from './pages/SongsPage';
import { SongDetailPage } from './pages/SongDetailPage';
import { SetlistsPage } from './pages/SetlistsPage';
import { SetlistDetailPage } from './pages/SetlistDetailPage';
import { SetlistCreatePage } from './pages/SetlistCreatePage';
import { MemberSortPage } from './pages/MemberSortPage';
import { ConversationsPage } from './pages/ConversationsPage';
import { ConversationDetailPage } from './pages/ConversationDetailPage';

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
              <Route path="/formations/new" element={<FormationCreatePage />} />
              <Route path="/formations/:id/edit" element={<FormationCreatePage />} />
              <Route path="/songs" element={<SongsPage />} />
              <Route path="/songs/:id" element={<SongDetailPage />} />
              <Route path="/setlists" element={<SetlistsPage />} />
              <Route path="/setlists/new" element={<SetlistCreatePage />} />
              <Route path="/setlists/:id" element={<SetlistDetailPage />} />
              <Route path="/setlists/:id/edit" element={<SetlistCreatePage />} />
              <Route path="/member-sort" element={<MemberSortPage />} />
              <Route path="/conversations" element={<ConversationsPage />} />
              <Route path="/conversations/new" element={<ConversationDetailPage />} />
              <Route path="/conversations/:id" element={<ConversationDetailPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
