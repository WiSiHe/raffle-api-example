import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGate } from "./AuthGate";
import { NbimPageChrome } from "./components/NbimPageChrome";
import { Search } from "./search";
import { OrchestratedSearch } from "./search/OrchestratedSearch";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <NbimPageChrome>
          <AuthGate>
            <Routes>
              <Route path="/" element={<Search />} />
              <Route path="/orchestrated" element={<OrchestratedSearch />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthGate>
        </NbimPageChrome>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;


