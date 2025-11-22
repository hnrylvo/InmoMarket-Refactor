import React, { useState } from "react";

const Payments = () => {
  const [tab, setTab] = useState("payments");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 dark:border-neutral-700">
        <button
          onClick={() => setTab("payments")}
          className={`pb-2 text-sm font-medium ${
            tab === "payments"
              ? "border-b-2 border-black dark:border-white text-black dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Your Payments
        </button>
        <button
          onClick={() => setTab("methods")}
          className={`pb-2 text-sm font-medium ${
            tab === "methods"
              ? "border-b-2 border-black dark:border-white text-black dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Payment Methods
        </button>
      </div>

      {/* Tab Content */}
      {tab === "payments" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Payments
          </h3>
          <p className="text-gray-600 dark:text-neutral-400">
            Keep track of all your payments and refunds.
          </p>
          <button className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded font-medium">
            Manage Payments
          </button>
        </div>
      )}

      {tab === "methods" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Payment Methods
          </h3>
          <p className="text-gray-600 dark:text-neutral-400">
            Add payment methods using our secure payment system.
          </p>
          <button className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded font-medium">
            Add Payment Method
          </button>
        </div>
      )}

      {/* Disclaimer Card */}
      <div className="mt-6 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-4 rounded-xl">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Make all payments through InmoMarket
        </h4>
        <p className="text-sm text-gray-600 dark:text-neutral-400">
          Always pay and communicate through InmoMarket to ensure you're
          protected under our Terms of Service, Payments Terms of Service,
          cancellation, and other safeguards.{" "}
          <a
            href="#"
            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
          >
            Learn more
          </a>
        </p>
      </div>
    </div>
  );
};

export default Payments;
