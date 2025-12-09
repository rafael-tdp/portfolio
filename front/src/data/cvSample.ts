const cvSample = {
	name: "Rafael Tavares De Pinho",
	contact: {
		email: "tavaresrafael93@gmail.com",
		phone: "06 95 22 49 32",
		github: "github.com/rafael-tdp",
		linkedin: "tavares-de-pinho-rafael",
		website: "https://rafaeltavares.fr",
	},
	formations: [
		{
			title: "Master Ingénierie du Web",
			period: "Janv 2023 - Janv 2025",
			school: "École Supérieure de Génie Informatique (ESGI) - Paris",
		},
		{
			title: "Licence Pro. Dév. Web & Mobile",
			period: "Sep 2020 - Août 2021",
			school: "IUT de Bobigny - Sorbonne Paris Nord - Bobigny",
		},
		{
			title: "DUT Informatique",
			period: "Sep 2018 - Août 2020",
			school: "IUT de Villetaneuse - Sorbonne Paris Nord - Villetaneuse",
		},
	],
	title: "DÉVELOPPEUR FULL STACK",
	experiencesSummary:
		"Ajout d’export de données, corrections de bugs sur les API <strong>Node.js</strong> (Express et NestJS), optimisation de requêtes <strong>MongoDB</strong> et tests avec <strong>Jest</strong>. Intégration de nouvelles fonctionnalités en <strong>Vue.js</strong> et création de composants. Collaboration avec l’équipe produit et participation aux réunions agiles.",
	experiences: [
		{
			company: "Ownest (Paris)",
			role: "Développeur Full Stack",
			period: "Janv 2023 - Janv 2025",
			bullets: [
				"Ajout d’export de données, corrections de bugs sur les API <strong>Node.js</strong> (Express et NestJS), optimisation de requêtes <strong>MongoDB</strong> et tests avec <strong>Jest</strong>.",
				"Intégration de nouvelles fonctionnalités en <strong>Vue.js</strong> et création de composants.",
				"Collaboration avec l’équipe produit et participation aux réunions agiles.",
			],
		},
		{
			company: "LFP Ravalement",
			role: "Développeur Full Stack - Stage",
			period: "Juin 2021 - Août 2021",
			bullets: [
				"Développement du site vitrine et d’un back-office en <strong>Vue.js</strong> et <strong>Node.js</strong>, avec un système de facturation personnalisé et des statistiques comptables.",
				"Mise en ligne du site avec configuration de l’hébergement, du nom de domaine et <strong>SEO</strong>.",
				"Migration de données vers une base <strong>PostgreSQL</strong>.",
			],
		},
		{
			company: "Sport Management System (Paris)",
			role: "Développeur Full Stack - Stage",
			period: "Juin 2020 - Août 2020",
			bullets: [
				"Optimisation et enrichissement d’un planning en ligne pour la gestion de coachs sportifs, en utilisant <strong>Vue.js</strong> pour le front-end et <strong>Laravel</strong> pour le back-end.",
				"Réalisation des améliorations en autonomie pour répondre aux besoins des utilisateurs.",
			],
		},
	],
	projects: [
		{
			name: "Application de souvenirs personnels",
			period: "Janv 2025 - Aujourd'hui",
			description: [
				"Développement d'une application de souvenirs personnels avec <strong>React</strong> et <strong>Node.js</strong>, intégrant collections, calendrier et galerie photo.",
				"Mise en cache avec <strong>Redis</strong>, déploiement de l'API avec <strong>AWS (EC2, PM2)</strong> avec automatisation du workflow via <strong>GitHub Actions</strong> et stockage sur <strong>Google Cloud Storage</strong>.",
			],
			tags: ["React", "Node.js", "Redis", "AWS", "GCS", "Frontend", "Backend", "DevOps"],
			isDefault: true,
		},
		{
			name: "Scholaria — Gestion d'établissement scolaire",
			period: "Déc 2024",
			description: [
				"Création d'une application de gestion d'établissements scolaires en <strong>Vue.js</strong> et <strong>Node.js</strong>.",
				"Mise en place d'un système de replanification des cours annulés via drag & drop.",
				"Développement d'un algorithme <strong>IA</strong> générant automatiquement le planning.",
			],
			tags: ["Vue.js", "Node.js", "IA", "Algorithme", "Drag & Drop", "Frontend", "Backend"],
			isDefault: true,
		},
		{
			name: "Pilot — Plateforme de prise de rendez-vous",
			period: "Avril 2024 - Juil 2024",
			description: [
				"Développement d'une application web de réservation de prestations automobiles.",
				"Conception d'une API sous <strong>API Platform</strong> avec gestion des rôles, des réservations, des notifications, et des demandes de prestataires.",
				"Création d'une interface intuitive en <strong>React</strong> et gestion des données avec <strong>PostgreSQL</strong>.",
			],
			tags: ["React", "API Platform", "PostgreSQL", "Gestion des rôles", "Notifications", "Frontend", "Backend"],
			isDefault: true,
		},
		{
			name: "Portfolio — Suivi de candidatures",
			period: "Déc 2024 - Janv 2025",
			description: [
				"Développement d'une application de suivi de candidatures avec <strong>Next.js</strong> et <strong>TypeScript</strong>.",
				"Système de tracking des visites, génération de lettres de motivation par IA, et création de pages publiques personnalisées avec <strong>TailwindCSS</strong>.",
				"Backend <strong>AdonisJS</strong> avec <strong>MongoDB</strong>, intégration <strong>Google Cloud Storage</strong> et <strong>API OpenAI</strong>.",
			],
			tags: ["Next.js", "TypeScript", "AdonisJS", "MongoDB", "IA", "TailwindCSS", "GCS", "Full Stack"],
			isDefault: false,
		},
		{
			name: "Site vitrine et back-office — LFP Ravalement",
			period: "Juin 2021 - Août 2021",
			description: [
				"Développement d'un site vitrine et back-office en <strong>Vue.js</strong> et <strong>Node.js</strong>.",
				"Système de facturation personnalisé avec statistiques comptables et gestion d'utilisateurs.",
				"Mise en ligne complète avec configuration du domaine, hébergement et optimisation <strong>SEO</strong>.",
			],
			tags: ["Vue.js", "Node.js", "PostgreSQL", "Facturation", "SEO", "DevOps", "E-commerce"],
			isDefault: false,
		},
		{
			name: "Planning sportif — Sport Management System",
			period: "Juin 2020 - Août 2020",
			description: [
				"Optimisation et enrichissement d'une plateforme de planning en ligne pour coachs sportifs.",
				"Développement en <strong>Vue.js</strong> (frontend) et <strong>Laravel</strong> (backend) avec gestion des disponibilités.",
				"Amélioration des performances et ajout de nouvelles fonctionnalités utilisateur.",
			],
			tags: ["Vue.js", "Laravel", "PHP", "MySQL", "Planning", "Backend", "Frontend"],
			isDefault: false,
		},
		{
			name: "E-learning — Plateforme d'apprentissage en ligne",
			period: "Déc 2023 - Mars 2024",
			description: [
				"Création d'une plateforme e-learning avec <strong>React</strong> et <strong>NestJS</strong>.",
				"Système de cours, quiz, progression utilisateur et certificats générés dynamiquement.",
				"Intégration d'un lecteur vidéo avec <strong>Vimeo API</strong> et gestion des paiements <strong>Stripe</strong>.",
			],
			tags: ["React", "NestJS", "TypeScript", "Vimeo API", "Stripe", "Paiements", "E-learning"],
			isDefault: false,
		},
	],
	availability: "DISPONIBILITÉ IMMÉDIATE",
	languages: [
		{ name: "Français", level: "langue native" },
		{ name: "Portugais", level: "langue maternelle" },
		{ name: "Anglais", level: "courant (TOEIC 885/990)" },
		{ name: "Espagnol", level: "courant" },
	],
	interests: ["Pâtisserie", "sport (musculation, football)"],
	softSkills: [
		"Esprit d’analyse",
		"Capacité d’adaptation",
		"Travail en équipe",
		"Sens des responsabilités",
		"Autonomie",
	],
	skills: {
		languages: "JavaScript / TypeScript, HTML / CSS, Sass, PHP, Java",
		devops: "Git, GitHub Actions, CI/CD, Docker, AWS (EC2, PM2), GCS",
		methodologies: "Agile, API REST, TDD, Clean Code",
		databases: "PostgreSQL, MySQL, MongoDB",
		frontend: "Vue.js, React, Next.js, Tailwind CSS",
		backend: "Node.js, NestJS, Symfony, API Platform",
		tests: "Jest, PHPUnit",
	},
};

export default cvSample;
