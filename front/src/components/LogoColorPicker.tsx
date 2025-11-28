"use client";

import React, { useRef, useState, useEffect } from "react";

interface Props {
	onFileChange?: (file: File | null, url?: string) => void;
	onPickColor?: (hex: string) => void;
	initialUrl?: string | null;
	pipetteMode?: boolean;
}

function toHex(r: number, g: number, b: number) {
	return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export default function LogoColorPicker({
	onFileChange,
	onPickColor,
	initialUrl,
	pipetteMode,
}: Props) {
	const [fileUrl, setFileUrl] = useState<string | null>(null);
	const [, setFile] = useState<File | null>(null);
	const [picked, setPicked] = useState<string | null>(null);
	const [objectUrl, setObjectUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(!!initialUrl);
	const [error, setError] = useState<string | null>(null);
	const imgRef = useRef<HTMLImageElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		if (!fileUrl) return;
		const img = imgRef.current;
		const canvas = canvasRef.current;
		if (!img || !canvas) return;

		const draw = () => {
			// guard against zero-dimension images
			const w = img.naturalWidth || img.width || 0;
			const h = img.naturalHeight || img.height || 0;
			if (w <= 0 || h <= 0) return;
			canvas.width = w;
			canvas.height = h;
			const ctx = canvas.getContext("2d");
			if (ctx) {
				try {
					ctx.drawImage(img, 0, 0);
				} catch (err) {
					// eslint-disable-next-line no-console
					console.warn("[LogoColorPicker] drawImage failed", err);
				}
			}
		};

		// If image is already complete, draw immediately
		if (img.complete && img.naturalWidth) {
			draw();
		} else {
			img.onload = draw;
			img.onerror = () => {
				// eslint-disable-next-line no-console
				console.warn("[LogoColorPicker] image failed to load", fileUrl);
			};
		}

		return () => {
			if (img) {
				img.onload = null;
				img.onerror = null;
			}
		};
	}, [fileUrl]);

	// support initialUrl (e.g., already uploaded logo)
	useEffect(() => {
		if (!initialUrl) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setError(null);

		// Always fetch as blob to avoid CORS issues with canvas
		const fetchAsBlob = async () => {
			try {
				// eslint-disable-next-line no-console
				console.debug("[LogoColorPicker] fetching initialUrl as blob:", initialUrl);
				
				// Use proxy for GCS URLs to avoid CORS issues
				let fetchUrl = initialUrl;
				if (initialUrl.includes('storage.googleapis.com')) {
					const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
					fetchUrl = `${backendUrl}/api/proxy-image?url=${encodeURIComponent(initialUrl)}`;
					// eslint-disable-next-line no-console
					console.debug("[LogoColorPicker] using proxy URL:", fetchUrl);
				}
				
				const res = await fetch(fetchUrl, { mode: "cors" });
				if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
				const blob = await res.blob();
				const obj = URL.createObjectURL(blob);
				
				// Revoke previous objectUrl if exists
				if (objectUrl) {
					URL.revokeObjectURL(objectUrl);
				}
				
				setObjectUrl(obj);
				setFileUrl(obj);
				setIsLoading(false);
				onFileChange?.(null, initialUrl);
				// eslint-disable-next-line no-console
				console.debug("[LogoColorPicker] blob URL created:", obj);
			} catch (err) {
				// eslint-disable-next-line no-console
				console.warn("[LogoColorPicker] fetch-as-blob failed:", err);
				setError("Impossible de charger l'image. Vérifiez que l'image est accessible.");
				setIsLoading(false);
				// Fallback: try using the URL directly (may not work for color picking due to CORS)
				setFileUrl(initialUrl);
				onFileChange?.(null, initialUrl);
			}
		};

		fetchAsBlob();

		return () => {
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
			}
		};
	}, [initialUrl]);

	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0] || null;
		setFile(f);
		if (!f) {
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
				setObjectUrl(null);
			}
			setFileUrl(null);
			onFileChange?.(null);
			return;
		}
		const url = URL.createObjectURL(f);
		setObjectUrl(url);
		setFileUrl(url);
		onFileChange?.(f, url);
	};

	const handleClickImage = (e: React.MouseEvent) => {
		const img = imgRef.current;
		const canvas = canvasRef.current;
		if (!img || !canvas) return;

		// Use the displayed image's bounding rect (canvas is hidden), guard against 0 width
		const rect = img.getBoundingClientRect();
		const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
		const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;

		let x = Math.round((e.clientX - rect.left) * scaleX);
		let y = Math.round((e.clientY - rect.top) * scaleY);

		// Clamp coordinates inside the canvas to avoid infinite/NaN and out-of-bounds errors
		x = Math.min(Math.max(x, 0), Math.max(0, canvas.width - 1));
		y = Math.min(Math.max(y, 0), Math.max(0, canvas.height - 1));

		const ctx = canvas.getContext("2d");
		if (!ctx) {
			// eslint-disable-next-line no-console
			console.warn("[LogoColorPicker] no canvas context available");
			return;
		}

		// debug info for troubleshooting
		// eslint-disable-next-line no-console
		console.debug("[LogoColorPicker] click", {
			rect: { width: rect.width, height: rect.height },
			canvas: { w: canvas.width, h: canvas.height },
			x,
			y,
		});

		let data: Uint8ClampedArray;
		try {
			data = ctx.getImageData(x, y, 1, 1).data;
		} catch (err) {
			// defensive: log and bail if getImageData fails
			// eslint-disable-next-line no-console
			console.warn("[LogoColorPicker] getImageData failed", err);
			return;
		}
		const hex = toHex(data[0], data[1], data[2]);
		setPicked(hex);
		onPickColor?.(hex);
	};

	return (
		<div>
			{pipetteMode ? null : (
				<div className="mb-3">
					<input
						type="file"
						accept="image/*"
						onChange={handleInput}
					/>
				</div>
			)}

			{isLoading ? (
				<div className="text-sm text-gray-500">Chargement du logo...</div>
			) : error ? (
				<div className="text-sm text-red-500">{error}</div>
			) : fileUrl ? (
				<div className="flex gap-4 items-start">
					<div>
						<img
							ref={imgRef}
							src={fileUrl || undefined}
							alt="logo"
							crossOrigin="anonymous"
							style={{ maxWidth: 240, cursor: "crosshair" }}
							onClick={handleClickImage}
						/>
						{pipetteMode && (
							<div className="mt-2 text-xs text-gray-500">
								Cliquez sur l&apos;image pour prélever une couleur
							</div>
						)}
					</div>
					{!pipetteMode ? (
						<div>
							<div className="mb-2 text-sm text-gray-600">
								Clique sur l&apos;image pour prélever une couleur
							</div>
							<div className="flex items-center gap-2">
								<div
									className="w-10 h-10 rounded"
									style={{
										background: picked || "#ffffff",
										border: "1px solid #ddd",
									}}
								/>
								<input
									type="color"
									value={picked || "#ffffff"}
									onChange={(e) => {
										setPicked(e.target.value);
										onPickColor?.(e.target.value);
									}}
								/>
							</div>
							<div className="mt-3 text-xs text-gray-500">
								Couleur sélectionnée:{" "}
								<span className="font-mono">
									{picked || "—"}
								</span>
							</div>
						</div>
					) : null}
				</div>
			) : (
				<div className="text-sm text-gray-500">Aucun logo chargé</div>
			)}

			{/* hidden canvas to read pixels */}
			<canvas ref={canvasRef} style={{ display: "none" }} />
		</div>
	);
}
