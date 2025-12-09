"use client";

import React, { useState } from "react";
import { LuSparkles } from "react-icons/lu";
import Button from "./Button";

interface Project {
	name: string;
	period: string;
	description: string[];
	tags: string[];
	isDefault: boolean;
}

interface ProjectSelectorProps {
	projects: Project[];
	selectedProjects: string[];
	recommendedProjects: string[];
	onSelectionChange: (selected: string[]) => void;
	jobDescription?: string;
	onGetRecommendations?: () => Promise<void>;
	loadingRecommendations?: boolean;
}

function parseDescription(description: string[]): React.ReactNode[] {
	return description.map((text, idx) => {
		const parts = text.split(/(<strong>.*?<\/strong>)/g);
		return (
			<React.Fragment key={idx}>
				{parts.map((part, i) => {
					if (
						part.startsWith("<strong>") &&
						part.endsWith("</strong>")
					) {
						const boldText = part.replace(/<\/?strong>/g, "");
						return (
							<strong key={i} className="font-semibold">
								{boldText}
							</strong>
						);
					}
					return part;
				})}
				{idx < description.length - 1 && " "}
			</React.Fragment>
		);
	});
}

export default function ProjectSelector({
	projects,
	selectedProjects,
	recommendedProjects,
	onSelectionChange,
	jobDescription = "",
	onGetRecommendations,
	loadingRecommendations = false,
}: ProjectSelectorProps) {
	const handleToggleProject = (projectName: string) => {
		const newSelected = selectedProjects.includes(projectName)
			? selectedProjects.filter((p) => p !== projectName)
			: [...selectedProjects, projectName];
		onSelectionChange(newSelected);
	};

	return (
		<div className="flex flex-col gap-3 mb-4">
			<div>
				{recommendedProjects.length > 0 && (
					<span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded whitespace-nowrap">
						<LuSparkles className="w-3 h-3 inline mr-1" />
						{recommendedProjects.length}
					</span>
				)}
			</div>

			<div className="space-y-1">
				{projects.map((project) => {
					const isSelected = selectedProjects.includes(project.name);
					const isRecommended = recommendedProjects.includes(
						project.name
					);
					const isDefault = project.isDefault;

					return (
						<button
							key={project.name}
							type="button"
							onClick={() => handleToggleProject(project.name)}
							disabled={loadingRecommendations}
							className={`w-full text-left p-2 sm:p-3 rounded border transition-colors ${
								isSelected
									? "border-blue-500 bg-blue-50"
									: "border-gray-200 bg-white hover:border-gray-300"
							} ${
								loadingRecommendations
									? "opacity-50 cursor-not-allowed"
									: "cursor-pointer"
							}`}
						>
							<div className="flex items-start justify-between gap-2">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<h4 className="font-semibold text-gray-800 text-sm break-words">
											{project.name}
										</h4>
										{isRecommended && (
											<LuSparkles className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
										)}
										{isDefault && !isRecommended && (
											<span className="text-xs text-gray-500">
												⭐
											</span>
										)}
									</div>
									<p className="text-xs text-gray-500">
										{project.period}
									</p>
									<p className="text-xs text-gray-600 mt-1 leading-snug">
										{parseDescription(project.description)}
									</p>
								</div>
								<input
									type="checkbox"
									checked={isSelected}
									onChange={() => {}}
									disabled={loadingRecommendations}
									className="w-4 h-4 rounded cursor-pointer flex-shrink-0 mt-0.5 accent-blue-500"
								/>
							</div>
						</button>
					);
				})}
			</div>

			{projects.length === 0 && (
				<div className="text-center py-8 text-gray-400">
					<p className="text-sm">Aucun projet disponible</p>
				</div>
			)}

			{jobDescription && onGetRecommendations && (
				<Button
					type="button"
					variant="neutral"
					onClick={onGetRecommendations}
					disabled={loadingRecommendations}
					loading={loadingRecommendations}
					className="text-sm px-3 py-2"
				>
					<LuSparkles className="w-4 h-4 mr-1" />
					Sélectionner avec l'IA
				</Button>
			)}
		</div>
	);
}
