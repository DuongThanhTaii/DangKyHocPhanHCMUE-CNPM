import { useEffect, useState } from "react";
function App() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch(import.meta.env.VITE_API_BASE_URL + "/health")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);
  return (
    <div style={{ padding: 24 }}>
      <h1>HCMUE Reg – Frontend</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
export default App;
