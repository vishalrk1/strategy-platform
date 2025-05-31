"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function VerifyUserForm() {
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleVerifyUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError("User ID is required");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to verify users");
        return;
      }

      const response = await fetch("/api/auth/verify-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message || "User verified successfully");
        setUserId("");
      } else {
        setError(data.message || "Failed to verify user");
      }
    } catch (error) {
      console.error("Error verifying user:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Verify User Account
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Enter the User ID to verify their account
          </p>
        </div>

        <form onSubmit={handleVerifyUser} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="userId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              User ID
            </label>
            <Input
              type="text"
              id="userId"
              name="userId"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter the user ID to verify"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isLoading ? "Verifying..." : "Verify User"}
          </Button>
        </form>
      </div>
    </div>
  );
}
