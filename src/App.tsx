import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthGate } from "./AuthGate";
import { NbimPageChrome } from "./components/NbimPageChrome";
import { Search } from "./search";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NbimPageChrome>
        <AuthGate>
          <Search />
        </AuthGate>
      </NbimPageChrome>
    </QueryClientProvider>
  );
}

export default App;
