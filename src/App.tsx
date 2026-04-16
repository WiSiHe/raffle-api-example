import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGate } from "./AuthGate";
import { NbimPageChrome } from "./components/NbimPageChrome";
import { Search } from "./search";
import OrchestratorPage from "./search/pages/OrchestratorPage";
import HybridPage from "./search/pages/HybridPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <NbimPageChrome>
          <AuthGate>
            <Routes>
              <Route path="/" element={<Search />} />
              <Route path="/orchestrated" element={<OrchestratorPage />} />
              <Route path="/hybrid" element={<HybridPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthGate>
        </NbimPageChrome>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;


