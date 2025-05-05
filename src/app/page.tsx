import About from "@/components/About";
import Experiences from "@/components/Experiences";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Projects from "@/components/Projects";
import ThemeSwitch from "@/components/ThemeSwitch";

export default function Home() {
  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitch />
      </div>

      <div className="flex flex-col md:grid md:grid-cols-[auto,1fr] md:gap-4 h-full">
        <div className="md:fixed md:h-full max-h-100vh md:h-screen">
          <Header />
        </div>

        <div className="md:ml-[50%]">
          <main>
            <About />
            <Experiences />
            <Projects />
            <Footer />
          </main>
        </div>
      </div>
    </>
  );
}
