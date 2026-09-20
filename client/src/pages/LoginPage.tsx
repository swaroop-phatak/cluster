import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../features/auth/api";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    try {
      const user = await login(email, password);
      setUser(user);
      navigate("/clusters");
    } catch {
      setError("Invalid email or password");
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm border-[3px] border-black bg-white p-8 shadow-[8px_8px_0_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[10px_10px_0_#000]">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-black uppercase tracking-wide">
            Cluster
          </h2>
          <p className="text-sm font-semibold uppercase text-neutral-500">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-bold uppercase tracking-wide"
            >
              Email
            </label>
            <div className="border-2 border-black transition-all focus-within:-translate-x-0.5 focus-within:-translate-y-0.5 focus-within:shadow-[4px_4px_0_#000]">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-transparent px-4 py-3 text-base font-medium outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-bold uppercase tracking-wide"
            >
              Password
            </label>
            <div className="flex items-stretch border-2 border-black transition-all focus-within:-translate-x-0.5 focus-within:-translate-y-0.5 focus-within:shadow-[4px_4px_0_#000]">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full flex-1 bg-transparent px-4 py-3 text-base font-medium outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="bg-black px-3 text-[10px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-neutral-800"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold uppercase tracking-wide text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full border-2 border-black bg-black py-4 text-sm font-bold uppercase tracking-wide text-white transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-[4px_4px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_#000]"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-semibold text-neutral-500">
          <span>No account? </span>

          <Link
            to="/register"
            className="font-bold uppercase tracking-wide text-black underline decoration-2 underline-offset-2"
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
