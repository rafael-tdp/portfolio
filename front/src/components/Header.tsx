import Socials from "./Socials";
import Hero from "./Hero";
import Menu from "./Menu";

export default function Header() {
  return (
    <header className="flex flex-col md:h-screen lg:py-24 px-3 sm:px-4 md:px-8 pt-20 md:pt-0">
      <Hero />
      <Menu />
      <div className="mt-6 md:mt-auto mb-4 md:mb-0">
        <Socials />
      </div>
    </header>
  );
}
