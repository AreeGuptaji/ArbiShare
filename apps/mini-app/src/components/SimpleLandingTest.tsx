"use client";

import { useState } from "react";

export function SimpleLandingTest() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    console.log("Simple button clicked!");
    alert("Simple button works!");
    setCount(count + 1);
  };

  console.log("SimpleLandingTest component rendering...");

  return (
    <div className="min-h-screen bg-blue-100 p-8">
      <h1 className="mb-8 text-4xl font-bold text-gray-900">
        Simple Landing Test
      </h1>

      <div className="space-y-4">
        <button
          onClick={handleClick}
          className="rounded-lg bg-red-500 px-6 py-3 font-semibold text-white hover:bg-red-600"
        >
          Test Button (Clicked: {count} times)
        </button>

        <button
          onClick={() => {
            console.log("Second button clicked!");
            localStorage.setItem("test", "value");
            alert("Second button works! LocalStorage set.");
          }}
          className="rounded-lg bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600"
        >
          Test LocalStorage
        </button>

        <button
          onClick={() => {
            console.log("Reload button clicked!");
            window.location.reload();
          }}
          className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-600"
        >
          Test Reload
        </button>
      </div>

      <div className="mt-8 rounded-lg bg-white p-4">
        <p>If you can see this and click the buttons, React is working fine.</p>
        <p>Current count: {count}</p>
        <p>
          LocalStorage test value:{" "}
          {typeof window !== "undefined" ? localStorage.getItem("test") : "N/A"}
        </p>
      </div>
    </div>
  );
}
