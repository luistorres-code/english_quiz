/**
 * Theme Manager - Maneja el cambio entre modo claro y oscuro
 * Implementación funcional sin clases
 */

// Estado del tema
let currentTheme = "light";
let themeToggleButton = null;
let themeIcon = null;
const storageKey = "english-quiz-theme";

/**
 * Inicializa el sistema de temas
 */
function initializeThemeManager() {
	setupThemeElements();
	loadSavedTheme();
	setupThemeEventListeners();
	updateThemeIcon();
}

/**
 * Configura las referencias a elementos DOM
 */
function setupThemeElements() {
	themeToggleButton = document.getElementById("theme-toggle");
	themeIcon = themeToggleButton?.querySelector(".theme-icon");

	if (!themeToggleButton) {
		console.warn("Theme toggle button not found");
		return;
	}
}

/**
 * Configura los event listeners
 */
function setupThemeEventListeners() {
	if (themeToggleButton) {
		themeToggleButton.addEventListener("click", () => {
			toggleTheme();
		});
	}

	// Listen for system theme changes
	if (window.matchMedia) {
		window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
			if (!hasUserThemePreference()) {
				setTheme(e.matches ? "dark" : "light");
			}
		});
	}
}

/**
 * Carga el tema guardado o usa la preferencia del sistema
 */
function loadSavedTheme() {
	const savedTheme = localStorage.getItem(storageKey);

	if (savedTheme) {
		setTheme(savedTheme);
	} else {
		// Use system preference if no saved theme
		const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
		setTheme(prefersDark ? "dark" : "light");
	}
}

/**
 * Alterna entre tema claro y oscuro
 */
function toggleTheme() {
	const newTheme = currentTheme === "light" ? "dark" : "light";
	animateThemeTransition(() => {
		setTheme(newTheme);
		saveTheme(newTheme);
	});
}

/**
 * Anima la transición del tema con efecto ripple
 */
function animateThemeTransition(callback) {
	if (!themeToggleButton) {
		callback();
		return;
	}

	// Add transitioning class to button for pulse effect
	themeToggleButton.classList.add("transitioning");

	// Get button position for ripple origin
	const buttonRect = themeToggleButton.getBoundingClientRect();
	const buttonCenterX = buttonRect.left + buttonRect.width / 2;
	const buttonCenterY = buttonRect.top + buttonRect.height / 2;

	// Create ripple overlay
	const rippleOverlay = document.createElement("div");
	rippleOverlay.className = "theme-ripple-overlay";

	// Create multiple ripple circles for a wave effect
	const rippleCount = 3;
	const ripples = [];

	for (let i = 0; i < rippleCount; i++) {
		const ripple = document.createElement("div");
		ripple.className = "theme-ripple";

		// Calculate maximum distance to cover entire screen
		const maxDistance = Math.max(Math.sqrt(Math.pow(buttonCenterX, 2) + Math.pow(buttonCenterY, 2)), Math.sqrt(Math.pow(window.innerWidth - buttonCenterX, 2) + Math.pow(buttonCenterY, 2)), Math.sqrt(Math.pow(buttonCenterX, 2) + Math.pow(window.innerHeight - buttonCenterY, 2)), Math.sqrt(Math.pow(window.innerWidth - buttonCenterX, 2) + Math.pow(window.innerHeight - buttonCenterY, 2)));

		const rippleSize = maxDistance * 2.5;

		// Position and style each ripple
		ripple.style.width = `${rippleSize}px`;
		ripple.style.height = `${rippleSize}px`;
		ripple.style.left = `${buttonCenterX - rippleSize / 2}px`;
		ripple.style.top = `${buttonCenterY - rippleSize / 2}px`;

		// Delay each ripple slightly
		ripple.style.animationDelay = `${i * 100}ms`;

		ripples.push(ripple);
		rippleOverlay.appendChild(ripple);
	}

	// Add overlay to DOM
	document.body.appendChild(rippleOverlay);

	// Start ripple animation
	requestAnimationFrame(() => {
		rippleOverlay.classList.add("active");
		ripples.forEach((ripple) => ripple.classList.add("expanding"));
	});

	// Change theme when the first ripple reaches about 30% expansion
	setTimeout(() => {
		callback();
	}, 300);

	// Clean up after animation completes
	setTimeout(() => {
		rippleOverlay.classList.remove("active");
		themeToggleButton.classList.remove("transitioning");

		setTimeout(() => {
			if (document.body.contains(rippleOverlay)) {
				document.body.removeChild(rippleOverlay);
			}
		}, 200);
	}, 1000);
}

/**
 * Establece el tema especificado
 */
function setTheme(theme) {
	currentTheme = theme;

	// Add theme-transforming class for extended transition
	document.body.classList.add("theme-transforming");

	// Set the new theme
	document.documentElement.setAttribute("data-theme", theme);
	updateThemeIcon();
	updateThemeAriaLabel();

	// Remove the transforming class after transition completes
	setTimeout(() => {
		document.body.classList.remove("theme-transforming");
	}, 800);

	// Trigger custom event for other components that might need to react
	window.dispatchEvent(
		new CustomEvent("themeChanged", {
			detail: { theme: theme },
		})
	);
}

/**
 * Actualiza el icono del botón de tema
 */
function updateThemeIcon() {
	if (themeIcon) {
		// Add rotation animation during icon change
		themeIcon.style.transform = "rotate(180deg) scale(0.8)";

		setTimeout(() => {
			themeIcon.textContent = currentTheme === "light" ? "🌙" : "☀️";
			themeIcon.style.transform = "rotate(0deg) scale(1)";
		}, 150);
	}
}

/**
 * Actualiza las etiquetas de accesibilidad del botón
 */
function updateThemeAriaLabel() {
	if (themeToggleButton) {
		const label = currentTheme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro";
		themeToggleButton.setAttribute("aria-label", label);
		themeToggleButton.setAttribute("title", label);
	}
}

/**
 * Guarda el tema en localStorage
 */
function saveTheme(theme) {
	localStorage.setItem(storageKey, theme);
}

/**
 * Verifica si el usuario tiene una preferencia de tema guardada
 */
function hasUserThemePreference() {
	return localStorage.getItem(storageKey) !== null;
}

/**
 * Obtiene el tema actual
 */
function getCurrentTheme() {
	return currentTheme;
}

/**
 * Métodos públicos para cambiar el tema programáticamente
 */
function setLightTheme() {
	setTheme("light");
	saveTheme("light");
}

function setDarkTheme() {
	setTheme("dark");
	saveTheme("dark");
}

// Initialize theme manager when DOM is loaded
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		initializeThemeManager();
	});
} else {
	initializeThemeManager();
}

// Export functions to global scope for use in other modules if needed
window.themeManager = {
	getCurrentTheme,
	setLightTheme,
	setDarkTheme,
	toggleTheme,
};
