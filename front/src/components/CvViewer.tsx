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
		// CV dimensions: 794px x 1123px (A4 at 96 DPI)
		// Scale factors: mobile 0.4, sm 0.5, md 0.65, lg 1
		return (
			<div className="w-full overflow-hidden">
				{/* Container with responsive height based on scale */}
				<div className="h-[450px] sm:h-[562px] md:h-[730px] lg:h-auto overflow-hidden flex justify-center">
					<div 
						className="origin-top scale-[0.4] sm:scale-[0.5] md:scale-[0.65] lg:scale-100"
						style={{ transformOrigin: 'top center' }}
					>
						<div className="border border-gray-200 shadow-lg">
							<CvHtml data={data} theme={theme} jobTitle={jobTitle} logoUrl={logoUrl} />
						</div>
					</div>
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
