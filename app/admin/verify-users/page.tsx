"use client";

import React from "react";
import VerifyUserForm from "@/components/VerifyUserForm";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminVerificationPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Admin User Verification
          </h1>

          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
              Use this form to manually verify user accounts.
            </p>
          </div>

          <VerifyUserForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
