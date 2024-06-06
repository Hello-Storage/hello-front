import { useEffect } from "react";
import { Footer } from "../Footer";
import { Navbar } from "../Navbar";
import { Hero } from "../components/Hero";
import ParticleAnimation from "../../../utils/one-page/particles";
import { Helmet } from "react-helmet";

const OnePage = () => {
  useEffect(() => {
    const canvasElements = document.querySelectorAll(
      "[data-particle-animation]"
    );
    canvasElements.forEach((canvas1) => {
      const canvas = canvas1 as HTMLCanvasElement;
      const options = {
        quantity: canvas.dataset.particleQuantity ? parseFloat(canvas.dataset.particleQuantity) : undefined,
        staticity: canvas.dataset.particleStaticity ? parseFloat(canvas.dataset.particleStaticity) : undefined,
        ease: canvas.dataset.particleEase ? parseFloat(canvas.dataset.particleEase) : undefined,
      };

      new ParticleAnimation(canvas, options);
    });
  }, []);

  return (
    <>
      <Helmet>
        <link rel="canonical" href="https://hello.app" />
      </Helmet>
      <div className="relative overflow-hidden h-full text-gray-100 bg-slate-950">
        <div  className="absolute h-full inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
        <canvas
          data-particle-animation
          data-particle-quantity="200"
          data-particle-staticity="50"
          data-particle-ease="50"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 0
          }}
        />
        <Navbar />
        <Hero />
        <Footer />
      </div></>
  );
};

export default OnePage;
