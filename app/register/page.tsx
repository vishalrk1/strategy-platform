"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { RegisterCredentials } from "@/types/user";
import AuthRedirect from "@/components/AuthRedirect";

export default function Register() {
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    email: "",
    password: "",
    name: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else if (name === "first_name" || name === "last_name") {
      const otherNameField = name === "first_name" ? "last_name" : "first_name";
      const otherValue =
        (e.target.form?.elements.namedItem(otherNameField) as HTMLInputElement)
          ?.value || "";
      const fullName =
        name === "first_name"
          ? `${value} ${otherValue}`.trim()
          : `${otherValue} ${value}`.trim();
      setCredentials((prev) => ({ ...prev, name: fullName }));
    } else {
      setCredentials((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (credentials.password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const result = await register(credentials);
      if (!result.success) {
        setError(result.message || "Registration failed");
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <AuthRedirect>
      <div className="flex min-h-[80vh] flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
            Create your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          {error && (
            <div className="mb-4 p-3 text-sm text-white bg-destructive rounded-md">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium leading-6"
                >
                  First Name
                </label>
                <div className="mt-2">
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    onChange={handleChange}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium leading-6"
                >
                  Last Name
                </label>
                <div className="mt-2">
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    onChange={handleChange}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={credentials.email}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium leading-6"
              >
                Confirm Password
              </label>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center"
              >
                {isLoading ? "Creating account..." : "Register"}
              </Button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button
              variant="link"
              className="font-semibold p-0"
              onClick={() => router.push("/login")}
            >
              Sign in
            </Button>{" "}
          </p>
        </div>
      </div>
    </AuthRedirect>
  );
}
