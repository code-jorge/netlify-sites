import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import MembersTable from './views/MembersTable';
import ContributorsTable from './views/ContributorsTable';
import ActivityHeatmap from './views/ActivityHeatmap';
import ContributorActivityHeatmap from './views/ContributorActivityHeatmap';
import DataExport from './views/DataExport';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Router>
      <div className="h-screen bg-gray-50 overflow-hidden">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<MembersTable />} />
            <Route path="contributors" element={<ContributorsTable />} />
            <Route 
              path="member-activity" 
              element={
                <div className="h-full">
                  <ActivityHeatmap />
                </div>
              } 
            />
            <Route 
              path="contributor-activity" 
              element={
                <div className="h-full">
                  <ContributorActivityHeatmap />
                </div>
              } 
            />
            <Route 
              path="data-export" 
              element={
                <DataExport />
              } 
            />
          </Route>
        </Routes>
      </div>
    </Router>
  </QueryClientProvider>
);

export default App;