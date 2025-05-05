export default function Footer() {
  return (
    <footer className="text-center py-6 text-sm text-gray-400 dark:text-gray-600">
      Réalisé avec{" "}
      <a 
        href="https://nextjs.org"
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 dark:text-yellow-200 hover:underline"
      >
        Next.js
      </a>{" "}
      et{" "}
      <a 
        href="https://tailwindcss.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 dark:text-yellow-200 hover:underline"
      >
        Tailwind CSS
      </a>{" "}
      <br />
      © {new Date().getFullYear()} Rafael Tavares. Tous droits réservés.
    </footer>
  );
}
