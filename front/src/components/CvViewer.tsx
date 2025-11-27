"use client";

import React from "react";
import CvHtml from "./CvHtml";

type CVData = any;

export default function CvViewer({
	pdfSrc,
	data,
	showHtml = false,
	theme,
	jobTitle,
	logoUrl,
}: {
	pdfSrc?: string;
	data?: CVData;
	showHtml?: boolean;
	theme?: any;
	jobTitle?: string;
	logoUrl?: string;
}) {
	const [showHtmlState, setShowHtmlState] = React.useState<boolean>(showHtml);

	// Simple viewer: show HTML replica or embed a static PDF if provided.
	if (showHtmlState && data) {
		return (
			<div className="flex m-auto justify-center">
				<div className="border border-gray-200 shadow-lg">
					<CvHtml data={data} theme={theme} jobTitle={jobTitle} logoUrl={logoUrl} />
				</div>
			</div>
		);
	}

	if (pdfSrc) {
		return (
			<div>
				<div className="flex items-center gap-3 mb-4">
					<button
						className="px-3 py-1 bg-gray-100 border rounded text-sm"
						onClick={() => setShowHtmlState(true)}
					>
						Afficher HTML
					</button>
					<a
						href={pdfSrc}
						target="_blank"
						rel="noreferrer"
						className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
					>
						Ouvrir le PDF
					</a>
				</div>

				<div className="w-full max-w-4xl h-[1100px] border border-gray-200 shadow-sm bg-white">
					<iframe
						src={pdfSrc}
						title="CV PDF"
						className="w-full h-full bg-white"
						style={{ border: "none" }}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 text-sm text-gray-700">
			<div className="mb-3 font-medium">CV Viewer</div>
			<div>No PDF or CV data provided.</div>
			<div className="mt-2 text-xs text-gray-500">
				To embed your PDF, place the file under `public/` and pass its
				path to `pdfSrc`, for example: <code>/cv-fullstack.pdf</code>.
			</div>
		</div>
	);
}
