"use client";

export function MinimalTest() {
  return (
    <div style={{ padding: "20px", backgroundColor: "lightblue" }}>
      <h1>Minimal Test Component</h1>
      <button
        onClick={() => alert("Minimal button works!")}
        style={{
          padding: "10px 20px",
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Click Me
      </button>
    </div>
  );
}

