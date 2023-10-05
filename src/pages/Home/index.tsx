import Footer from "./Footer";
import Hero from "./Hero";
import Navbar from "./Navbar";

export default function Home() {
  return (
    <div className="bg-primary-black overflow-hidden h-screen text-gray-100">
      <Navbar />
      <Hero />
      <Footer />
    </div >
  )
}
