import Socials from "./Socials";
import Hero from "./Hero";
import Menu from "./Menu";

export default function Header() {
  return (
    <header className="flex flex-col md:h-screen lg:py-24 px-4 sm:px-8 pt-12 md:pt-0">
      <Hero />
      <Menu />
      <div className="mt-auto">
        <Socials />
      </div>
    </header>
  );
}
