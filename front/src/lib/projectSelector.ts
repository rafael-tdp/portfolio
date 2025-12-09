import cvSample from "@/data/cvSample";
import { recommendProjects as apiRecommendProjects } from "@/lib/api";

interface Project {
  name: string;
  period: string;
  description: string[];
  tags: string[];
  isDefault: boolean;
}

/**
 * Sélectionne les projets à afficher selon le descriptif du poste
 * Par défaut, retourne les projets marqués comme isDefault: true
 * Si jobDescription est fourni, utilise l'IA pour recommander les projets les plus adaptés
 */
export async function selectProjectsForJob(
  jobDescription?: string
): Promise<Project[]> {
  const projects = (cvSample.projects as Project[]) || [];

  // Si pas de descriptif du poste, retourner les projets par défaut
  if (!jobDescription || jobDescription.trim() === "") {
    return projects.filter((p) => p.isDefault);
  }

  // Utiliser l'IA pour recommander les projets les plus adaptés
  try {
    const recommendations = await getProjectRecommendations(jobDescription, projects);
    // Retourner les projets recommandés + les projets par défaut
    const recommendedIds = new Set(recommendations);
    return projects.filter((p) => p.isDefault || recommendedIds.has(p.name));
  } catch (error) {
    console.error("Erreur lors de la recommandation de projets:", error);
    // En cas d'erreur, retourner les projets par défaut
    return projects.filter((p) => p.isDefault);
  }
}

/**
 * Utilise l'IA pour analyser le descriptif du poste et recommander les projets
 */
async function getProjectRecommendations(
  jobDescription: string,
  projects: Project[]
): Promise<string[]> {
  try {
    const data = await apiRecommendProjects(
      jobDescription,
      projects.map((p) => ({
        name: p.name,
        description: p.description,
        tags: p.tags,
      }))
    );
    return data.recommendedProjects || [];
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API de recommandation:", error);
    throw error;
  }
}
