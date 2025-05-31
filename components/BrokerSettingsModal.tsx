"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, AlertCircle, CheckCircle } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { generateAuthCodeURL } from "@/lib/fyersApi";

interface BrokerSettingsModalProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type DataProvider = "fyers" | "zerodha";

const brokerProviders: { value: DataProvider; label: string }[] = [
  {
    value: "fyers",
    label: "Fyers",
  },
  {
    value: "zerodha",
    label: "Zerodha",
  },
];

const getCredentialFields = (provider: DataProvider) => {
  switch (provider) {
    case "fyers":
      return [
        {
          key: "fyersClientId",
          label: "Client ID",
          type: "text",
          placeholder: "Enter Fyers Client ID",
        },
        {
          key: "fyersSecretKey",
          label: "Secret Key",
          type: "password",
          placeholder: "Enter Fyers Secret Key",
        },
      ];
    case "zerodha":
      return [
        {
          key: "zerodhaApiKey",
          label: "API Key",
          type: "text",
          placeholder: "Enter Zerodha API Key",
        },
        {
          key: "zerodhaApiSecret",
          label: "API Secret",
          type: "password",
          placeholder: "Enter Zerodha API Secret",
        },
      ];
    default:
      return [];
  }
};

export function BrokerSettingsModal({
  children,
  open,
  onOpenChange,
}: BrokerSettingsModalProps) {
  const { user, setUser } = useAuthStore();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<DataProvider>("fyers");
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [credentialsSaved, setCredentialsSaved] = useState(false);

  const isOpen = open !== undefined ? open : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;

  useEffect(() => {
    const loadCredentials = async () => {
      if (!isOpen || !user) return;
      setCredentialsSaved(false);

      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        let apiEndpoint = "";
        if (selectedProvider === "fyers") {
          apiEndpoint = "/api/fyers/credentials";
        } else if (selectedProvider === "zerodha") {
          apiEndpoint = "/api/zerodha/credentials";
        } else {
          return;
        }

        const response = await fetch(apiEndpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const loadedCredentials: Record<string, string> = {};
            if (selectedProvider === "fyers") {
              if (result.fyers_client_id) {
                try {
                  loadedCredentials.fyersClientId = atob(
                    result.fyers_client_id
                  );
                } catch {
                  loadedCredentials.fyersClientId = result.fyers_client_id;
                }
              }
              if (result.fyers_secret_key) {
                try {
                  loadedCredentials.fyersSecretKey = atob(
                    result.fyers_secret_key
                  );
                } catch {
                  loadedCredentials.fyersSecretKey = result.fyers_secret_key;
                }
              }
            } else if (selectedProvider === "zerodha") {
              if (result.zerodha_api_key)
                loadedCredentials.zerodhaApiKey = result.zerodha_api_key;
              if (result.zerodha_api_secret)
                loadedCredentials.zerodhaApiSecret = result.zerodha_api_secret;
            }

            setCredentials(loadedCredentials);
          }
        }
      } catch (error) {
        console.error("Failed to load existing credentials:", error);
      }
    };

    loadCredentials();
  }, [isOpen, selectedProvider, user]);

  const handleCredentialChange = (key: string, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [key]: value,
    }));
    if (error) setError(null);
  };

  const handleProviderChange = (value: DataProvider) => {
    setSelectedProvider(value);
    setCredentials({});
    setError(null);
    setSuccessMessage(null);
    setCredentialsSaved(false);
  };

  const areCredentialsConfigured = () => {
    if (!user) return false;

    if (selectedProvider === "fyers") {
      return !!(
        user.fyersClientId &&
        user.fyersSecretKey &&
        user.fyersClientId.trim() !== "" &&
        user.fyersSecretKey.trim() !== ""
      );
    } else if (selectedProvider === "zerodha") {
      return !!(
        user.zerodhaApiKey &&
        user.zerodhaApiSecret &&
        user.zerodhaApiKey.trim() !== "" &&
        user.zerodhaApiSecret.trim() !== ""
      );
    }

    return false;
  };

  // Check if form fields are filled properly
  const areFormFieldsFilled = () => {
    if (selectedProvider === "fyers") {
      return !!(
        credentials.fyersClientId &&
        credentials.fyersSecretKey &&
        credentials.fyersClientId.trim() !== "" &&
        credentials.fyersSecretKey.trim() !== ""
      );
    } else if (selectedProvider === "zerodha") {
      return !!(
        credentials.zerodhaApiKey &&
        credentials.zerodhaApiSecret &&
        credentials.zerodhaApiKey.trim() !== "" &&
        credentials.zerodhaApiSecret.trim() !== ""
      );
    }

    return false;
  };

  // Check if we need to show the credential form or connect button for Fyers
  const shouldShowFyersCredentialForm = () => {
    return user && selectedProvider === "fyers" && !areCredentialsConfigured();
  };

  // Check if we need to show the Connect to Fyers button
  const shouldShowFyersConnectButton = () => {
    return (
      user &&
      selectedProvider === "fyers" &&
      areCredentialsConfigured() &&
      !isValidToken(user.fyersAccessToken)
    );
  };

  const handleConnectToFyers = () => {
    try {
      const clientId = user?.fyersClientId || "";
      if (!clientId) {
        setError("Missing Fyers client ID. Please save credentials first.");
        return;
      }

      const authUrl = generateAuthCodeURL(clientId);
      window.location.href = authUrl;
    } catch (err) {
      console.error("Error generating Fyers auth URL:", err);
      setError(
        "Failed to generate Fyers authentication URL. Please try again."
      );
    }
  };

  const handleSaveCredentials = async () => {
    if (!areFormFieldsFilled()) {
      setError("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Prepare API payload based on selected provider
      let apiPayload: Record<string, string> = {};
      let apiEndpoint = "";
      if (selectedProvider === "fyers") {
        apiPayload = {
          fyers_client_id: btoa(credentials.fyersClientId || ""),
          fyers_secret_key: btoa(credentials.fyersSecretKey || ""),
        };
        apiEndpoint = "/api/fyers/credentials";
      } else if (selectedProvider === "zerodha") {
        apiPayload = {
          zerodha_api_key: credentials.zerodhaApiKey || "",
          zerodha_api_secret: credentials.zerodhaApiSecret || "",
        };
        apiEndpoint = "/api/zerodha/credentials";
      } else {
        throw new Error("Unsupported provider");
      }

      const response = await fetch(apiEndpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save credentials");
      }

      if (result.success && result.user) {
        setUser(result.user);
      }

      setSuccessMessage(
        `${
          selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)
        } credentials saved successfully!`
      );
      setCredentialsSaved(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save credentials"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isValidToken = (accessToken: string | null | undefined): boolean => {
    return typeof accessToken === "string" && accessToken.trim() !== "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {open === undefined && (
        <DialogTrigger asChild>
          {children || (
            <Button variant="outline" className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              Broker Settings
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Broker Settings</DialogTitle>
          <DialogDescription>
            Configure your broker API credentials to enable trading and data
            access.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 pb-4">
          {areCredentialsConfigured() ? (
            <div className="rounded-lg border p-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium">
                  {selectedProvider.charAt(0).toUpperCase() +
                    selectedProvider.slice(1)}{" "}
                  Configured
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Broker credentials are configured and ready to use
              </p>
            </div>
          ) : (
            <div className="rounded-lg border p-3 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium">Not Configured</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {user
                  ? `No ${selectedProvider} credentials configured for your account`
                  : "Please login to configure broker settings"}
              </p>
            </div>
          )}{" "}
          <div className="space-y-2">
            <label
              htmlFor="provider"
              className="text-sm font-medium leading-none"
            >
              Broker Provider
            </label>{" "}
            <Select
              value={selectedProvider}
              onValueChange={handleProviderChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full mt-1.5">
                <SelectValue placeholder="Select a broker provider" />
              </SelectTrigger>
              <SelectContent align="start" side="bottom" sideOffset={4}>
                {brokerProviders.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    <div className="flex flex-col items-start text-left min-w-0 w-full">
                      <span className="font-medium truncate w-full">
                        {provider.label}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {shouldShowFyersCredentialForm() && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">API Credentials</h4>
              {getCredentialFields(selectedProvider).map((field) => (
                <div key={field.key} className="space-y-2">
                  <label
                    htmlFor={field.key}
                    className="text-sm font-medium leading-none"
                  >
                    {field.label}
                  </label>
                  <Input
                    id={field.key}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={credentials[field.key] || ""}
                    onChange={(e) =>
                      handleCredentialChange(field.key, e.target.value)
                    }
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
          )}
          {user &&
            selectedProvider !== "fyers" &&
            !areCredentialsConfigured() && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">API Credentials</h4>
                {getCredentialFields(selectedProvider).map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label
                      htmlFor={field.key}
                      className="text-sm font-medium leading-none"
                    >
                      {field.label}
                    </label>
                    <Input
                      id={field.key}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={credentials[field.key] || ""}
                      onChange={(e) =>
                        handleCredentialChange(field.key, e.target.value)
                      }
                      disabled={isLoading}
                    />
                  </div>
                ))}
              </div>
            )}
          {shouldShowFyersConnectButton() && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground w-full">
                To connect to Fyers, you need to authenticate your account.
                Click the button below to initiate the connection process.
              </p>
              <Button
                onClick={handleConnectToFyers}
                disabled={isLoading}
                className="mt-2 w-full font-bold"
              >
                Connect to Fyers
              </Button>
            </div>
          )}
          {successMessage && (
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  {successMessage}
                </span>
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </span>
              </div>
            </div>
          )}{" "}
        </div>
        {(shouldShowFyersCredentialForm() ||
          (user &&
            selectedProvider !== "fyers" &&
            !areCredentialsConfigured())) && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setError(null);
                setSuccessMessage(null);
                setCredentials({});
                setCredentialsSaved(false);
              }}
              disabled={isLoading}
            >
              {credentialsSaved ? "Close" : "Cancel"}
            </Button>
            <Button onClick={handleSaveCredentials} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Credentials"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
