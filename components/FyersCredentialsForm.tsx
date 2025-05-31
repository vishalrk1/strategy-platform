'use client';

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useFyersStore } from "@/stores/fyersStore";
import { FyersCredentials } from "@/types/user";
import { updateFyersCredentials } from "@/lib/fyersApi";

interface FyersCredentialsFormProps {
  onSaveSuccess?: () => void;
}

export function FyersCredentialsForm({ onSaveSuccess }: FyersCredentialsFormProps) {
  const { user } = useAuthStore();
  const { setCredentials } = useFyersStore();
  const [clientId, setClientId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!user) {
      setError("User not authenticated");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication token not found");
        setIsLoading(false);
        return;
      }

      const credentials: FyersCredentials = {
        fyersClientId: clientId.trim(),
        fyersSecretKey: secretKey.trim(),
      };

      await updateFyersCredentials(token, credentials);

      // Save the credentials in the Fyers context for immediate use
      setCredentials(clientId.trim(), secretKey.trim());

      // Clear input fields on success for security
      setClientId("");
      setSecretKey("");
      setSuccess("Fyers credentials saved successfully!");
      
      // Call the success callback if provided
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err) {
      console.error("Error saving Fyers credentials:", err);
      setError("Failed to save credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fyers Client ID (App ID)
          </label>
          <input
            type="text"
            id="clientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter your Fyers App ID"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="secretKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fyers Secret Key
          </label>
          <input
            type="password"
            id="secretKey"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter your Fyers Secret Key"
            required
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !clientId.trim() || !secretKey.trim()}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            "Save Credentials"
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          How to get your Fyers API credentials:
        </h4>
        <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>1. Go to <a href="https://myapi.fyers.in" target="_blank" rel="noopener noreferrer" className="underline">Fyers API Dashboard</a></li>
          <li>2. Create a new app or select an existing one</li>
          <li>3. Copy the App ID (Client ID) and Secret Key</li>
          <li>4. Set the redirect URI to: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{typeof window !== 'undefined' ? `${window.location.origin}/fyers-verification` : '/fyers-verification'}</code></li>
        </ol>
      </div>
    </div>
  );
}
