import { useEffect, useState } from "react";
import "./Spinner3.css"

export default function Spinner3() {
  const [dots, setDots] = useState<string>('.');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : '.'));
    }, 500); // Adjust the interval time to make it faster or slower

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen flex flex-col  justify-center items-center">
      <div className="spinner flip">
      </div>
      <p>{dots}</p>
      <p>LOADING</p>
    </div>
  );
}
