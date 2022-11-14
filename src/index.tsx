import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

function App() {
  const obj: any = {
    name: "不要秃头啊",
  };
  useEffect(() => {
    obj.abc.map((s: any) => s === "1111");
  });
  return (
    <div className="App">
      <h1>hello world</h1>
    </div>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
