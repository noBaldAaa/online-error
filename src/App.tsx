import React, { useEffect } from "react";
import "./App.css";

function App() {
  useEffect(() => {
    ["1"].find((s: any) => s.aaaa.bbbb === "1111");
  });
  return (
    <div className="App">
      <header className="App-header">不要秃头啊</header>
    </div>
  );
}

export default App;
