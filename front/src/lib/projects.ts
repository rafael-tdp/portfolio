const projects = [
  {
    title: "Application App",
    description:
      "Un outil de création de candidatures personnalisées avec customisation de design.",
    image: "/img/projects/application-app.png",
    gradient: "from-blue-700 to-blue-400",
    bgGradient:
      "linear-gradient(188.62deg, rgba(12, 38, 80, 1) 49.9%, rgba(83, 132, 210, 1) 81.7%, rgba(174, 205, 255, 1) 93.88%, rgb(147, 197, 253) 113.5%)",
    accentColor: "text-blue-200",
    darkAccentColor: "text-blue-300",
    shadowColor: "#75b1ffff",
    tech: ["nextjs", "tailwind", "typescript", "node", "adonis", "git", "mongodb", "openai", "vercel", "gcp"],
    details: [
      "Outil complet pour créer des candidatures personnalisées assistées par IA.",
      "Sélection dynamique des projets pour adapter le contenu.",
      "Génération du PDF et page de partage unique pour chaque candidature.",
      "Suivi de l'état des candidatures avec statistiques détaillées.",
    ],
    imageDescription:
      "Créez des candidatures uniques et personnalisées en quelques clics.",
  },
  {
    title: "WeMemory",
    description: "Une application pour partager et conserver ses souvenirs en couple.",
    image: "/img/projects/couple-app.png",
    gradient: "from-[#C84A2D] to-[#F5A076]",
    bgGradient:
      "linear-gradient(188.62deg, rgba(149, 57, 36, 1) 49.9%, rgb(245, 160, 118) 81.7%, rgb(255, 186, 145) 93.88%, rgb(255, 210, 180) 113.5%)",
    accentColor: "text-[#FFCAB0]",
    darkAccentColor: "text-[#FFA07A]",
    shadowColor: "#ffaf9bff",
    tech: ["nextjs", "tailwind", "node", "express", "mongodb", "redux", "gcp", "gcs", "git", "vercel"],
    details: [
      "Plateforme intuitive pour partager les souvenirs du couple en temps réel.",
      "Organisation des souvenirs en collections thématiques personnalisables.",
      "Galerie photos partagée avec accès sécurisé pour les deux partenaires.",
      "Questions interactives pour renforcer la connexion du couple.",
    ],
    imageDescription:
      "Une application moderne pour préserver et célébrer vos plus beaux souvenirs en couple.",
  },
  {
    title: "Wedding Website",
    description: "Un site web de mariage moderne avec galerie photos et gestion RSVP.",
    image: "/img/projects/wedding-website.png",
    href: "https://wedding-website-portfolio.vercel.app/",
    gradient: "from-[#6B8E71] to-[#A8B896]",
    bgGradient:
      "linear-gradient(188.62deg, rgb(85, 107, 89) 49.9%, rgb(147, 170, 140) 81.7%, rgb(168, 184, 150) 93.88%, rgb(196, 207, 186) 113.5%)",
    accentColor: "text-[#D4E5C4]",
    darkAccentColor: "text-[#B8C5A6]",
    shadowColor: "#b4dabaff",
    tech: ["nextjs", "tailwind", "supabase", "vercel", "git"],
    details: [
      "Interface élégante et responsive pour les mariages modernes.",
      "Galerie photos interactive avec gestion complète des événements.",
      "Système de gestion RSVP avec Supabase pour la persistance des données.",
      "Déployé sur Vercel pour une performance optimale et une scalabilité mondiale.",
    ],
    imageDescription:
      "Un site web complet pour célébrer votre mariage avec style et élégance.",
  },
  {
    title: "LFP Ravalement",
    description: "Un site vitrine professionnel pour une entreprise de ravalement de façades.",
    image: "/img/projects/LFP.png",
    href: "https://lfp-ravalement.fr",
    gradient: "from-[#7A1C19] to-[#D84038]",
    bgGradient:
      "linear-gradient(188.62deg, rgb(122, 28, 25) 49.9%, rgb(216, 64, 56) 81.7%, rgb(231, 105, 93) 93.88%, rgb(244, 147, 137) 113.5%)",
    accentColor: "text-[#FFB3B3]",
    darkAccentColor: "text-[#FFA8A8]",
    shadowColor: "#f63730ff",
    tech: ["vue", "node", "postgresql", "render", "tailwind", "openai", "git", "docker", "gcs"],
    details: [
      "Site vitrine moderne et professionnel pour une entreprise de ravalement.",
      "Interface responsive optimisée pour tous les appareils.",
      "Intégration d'IA pour assistance à la génération de devis.",
      "Backend avec système de gestion de factures client et statistiques.",
    ],
    imageDescription:
      "Découvrez les services de ravalement de façades avec un site professionnel et moderne.",
  },
  {
    title: "Pilot",
    description: "Une application de réservation de prestations automobiles.",
    image: "/img/projects/pilot.png",
    gradient: "from-emerald-900 to-emerald-500",
    bgGradient:
      "linear-gradient(188.62deg, rgb(8, 57, 38) 49.9%, rgb(5, 150, 105) 81.7%, rgb(52, 211, 153) 93.88%, rgb(249, 215, 147) 113.5%)",
    accentColor: "text-emerald-300",
    darkAccentColor: "text-emerald-300",
    shadowColor: "#059669",
    tech: ["react", "tailwind", "apiplatform", "php", "postgresql", "docker", "git"],
    details: [
      "Développement d'une interface fluide avec React et Tailwind CSS.",
      "Utilisation d'API Platform pour la création et documentation de l'API REST.",
      "Base de données PostgreSQL pour une gestion robuste des réservations.",
      "Déploiement conteneurisé avec Docker pour une portabilité optimisée.",
    ],
    imageDescription:
      "Réservez facilement vos prestations automobiles via une interface intuitive et responsive.",
  },
  {
    title: "Cuisine Connect",
    description:
      "Une application de recherche intelligente de recettes de cuisine.",
    image: "/img/projects/cuisine-connect.png",
    href: "https://cuisineconnect-1.onrender.com/",
    gradient: "from-rose-700 to-rose-300",
    accentColor: "text-rose-300",
    darkAccentColor: "text-rose-300",
    shadowColor: "#DB2777",
    tech: ["react", "tailwind", "node", "express", "docker", "openai", "git"],
    details: [
      "Génération de recettes sur mesure grâce à l'intégration de l'API OpenAI.",
      "Interface utilisateur moderne et responsive conçue avec React et Tailwind.",
      "Backend Node.js + Express pour la logique métier et l’appel aux services IA.",
      "Infrastructure Dockerisée pour simplifier les déploiements.",
    ],
    imageDescription:
      "Découvrez des recettes originales générées par IA selon vos envies et vos ingrédients.",
  },
  {
    title: "Tic Tac Toe",
    description:
      "Un jeu de morpion multijoueur avec chat intégré en temps réel.",
    image: "/img/projects/tictactoe.png",
    href: "http://tic-tac-toe-0dpa.onrender.com/",
    gradient: "from-indigo-900 to-indigo-300",
    bgGradient:
      "linear-gradient(188.62deg, rgb(9, 0, 81) 49.9%, rgb(96, 59, 246) 81.7%, rgb(107, 172, 252) 93.88%, rgb(142, 229, 255) 113.5%)",
    accentColor: "text-indigo-300",
    darkAccentColor: "text-indigo-300",
    shadowColor: "#A855F7",
    tech: ["react", "tailwind", "node", "express", "socketio", "mongodb", "git"],
    details: [
      "Jeu multijoueur en temps réel développé avec Socket.IO.",
      "Interface conviviale et réactive grâce à React et Tailwind CSS.",
      "Système de messagerie instantanée intégré pour interagir entre joueurs.",
      "Serveur Node.js avec Express assurant la gestion des parties.",
    ],
    imageDescription:
      "Affrontez vos amis au morpion et discutez en direct dans une interface fluide et interactive.",
  },
];

export default projects;
