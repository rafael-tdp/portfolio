const projects = [
  {
    title: "Pilot",
    description: "Une application de réservation de prestations automobiles.",
    image: "/img/projects/pilot.png",
    gradient: "from-emerald-900 to-emerald-500",
    bgGradient:
      "linear-gradient(188.62deg, rgb(8, 57, 38) 49.9%, rgb(5, 150, 105) 81.7%, rgb(52, 211, 153) 93.88%, rgb(249, 215, 147) 113.5%)",
    accentColor: "text-emerald-500",
    darkAccentColor: "text-emerald-300",
    shadowColor: "#059669",
    tech: ["react", "tailwind", "apiplatform", "php", "postgresql", "docker"],
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
    gradient: "from-rose-700 to-rose-300",
    accentColor: "text-rose-500",
    darkAccentColor: "text-rose-300",
    shadowColor: "#DB2777",
    tech: ["react", "tailwind", "node", "express", "docker", "openai"],
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
    accentColor: "text-indigo-500",
    darkAccentColor: "text-indigo-300",
    shadowColor: "#A855F7",
    tech: ["react", "tailwind", "node", "express", "socketio", "mongodb"],
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
