import { Navigate } from "react-router-dom";
import Footer from "./Footer";
import Hero from "./Hero";
import Navbar from "./Navbar";
import useTitle from "hooks/useTitle";

export default function Home() {

  useTitle("hello.app | Decentralized");

  {/*
    <div className="bg-primary-black overflow-hidden h-screen text-gray-100">
      <Navbar />
      <Hero />
      <Footer />
  </div >*/}
  return (
    <Navigate to="/space/my-storage" />
  )
}
