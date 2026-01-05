import About from "@/components/About";
import AvailabilityIndicator from "@/components/AvailabilityIndicator";
import Experiences from "@/components/Experiences";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import ThemeSwitch from "@/components/ThemeSwitch";

export default function Home() {
	return (
		<div className="max-w-screen-xl mx-auto px-4 md:px-8 scroll-smooth">
			<div className="hidden md:fixed md:block md:top-4 md:right-4 md:z-50">
				<ThemeSwitch />
			</div>

			<AvailabilityIndicator />

			<div className="flex flex-col md:grid md:grid-cols-[auto,1fr] md:gap-4 h-full">
				<div className="md:fixed md:h-full max-h-100vh md:h-screen">
					<Header />
				</div>

				<div className="md:ml-[50%]">
					<main className="flex flex-col gap-32 md:gap-40 px-4 sm:px-8">
						<section id="about" className="max-w-4xl mx-auto w-full mt-24 md:mt-14">
							<About />
						</section>
						<section id="experience" className="max-w-5xl mx-auto w-full">
							<Experiences />
						</section>
						<section id="projects" className="max-w-5xl mx-auto w-full">
							<Projects />
						</section>
						<section id="skills" className="max-w-6xl mx-auto w-full">
							<Skills />
						</section>
						<Footer />
					</main>
				</div>
			</div>
		</div>
	);
}
