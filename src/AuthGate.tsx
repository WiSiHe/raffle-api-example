import { type ReactNode, useState } from "react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Input } from "./components/ui/input";

const STORAGE_KEY = "raffle-demo-auth";

const expectedPassword = import.meta.env.VITE_APP_PASSWORD as
  | string
  | undefined;

function readUnlocked(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEY) === "1";
}

export function AuthGate({ children }: Readonly<{ children: ReactNode }>) {
  const [unlocked, setUnlocked] = useState(readUnlocked);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (import.meta.env.DEV || !expectedPassword?.trim()) {
    return children;
  }

  if (!unlocked) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm border-nbim-border-subdued shadow-md">
          <CardHeader>
            <CardTitle className="font-semibold text-nbim-midnight">
              Password required
            </CardTitle>
            <CardDescription>
              Enter the app password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                if (password === expectedPassword) {
                  sessionStorage.setItem(STORAGE_KEY, "1");
                  setUnlocked(true);
                } else {
                  setError("Incorrect password.");
                }
              }}
            >
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-nbim-border-default focus-visible:ring-nbim-sea"
              />
              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
              <Button
                type="submit"
                className="w-full bg-nbim-midnight text-white hover:bg-nbim-midnight/90"
              >
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}
