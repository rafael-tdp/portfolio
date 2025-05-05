import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const socials = [
  {
    name: "GitHub",
    url: "https://github.com/rafael-tdp",
    icon: FaGithub,
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/tavares-de-pinho-rafael",
    icon: FaLinkedin,
  },
  {
    name: "Twitter",
    url: "https://twitter.com/rafael-tdp",
    icon: FaTwitter,
  },
];

export default function Socials() {
  return (
    <div className="flex flex-row gap-4">
      {socials.map(({ name, url, icon: Icon }) => (
        <a
          key={name}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
        >
          <Icon className="text-2xl hover:text-gray-700 dark:hover:text-gray-300" />
        </a>
      ))}
    </div>
  );
}
