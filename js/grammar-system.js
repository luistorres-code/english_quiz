/**
 * Sistema de Gramática - EngliFish Quiz
 * Usa createElement siguiendo las convencion				const topicId = topicCard.getAttribute("data-topic");
			if (topicId) {onst topicId = topicCard.getAttribute("data-topic");
			if (topicId) {del proyecto
 */

/**
 * Configuración de temas de gramática - Se cargan dinámicamente
 */
let GRAMMAR_TOPICS = {};

/**
 * Variables globales
 */
let currentGrammarData = null;
let currentScrollCleanup = null;

/**
 * Inicializa el sistema de gramática
 */
async function initializeGrammarSystem() {
	// Cargar temas de gramática desde index.json
	await loadGrammarTopics();

	// Configurar event listeners
	setupGrammarEventListeners();

	// Verificar si hay un tema en la URL
	const topicFromURL = getTopicFromURL();
	if (topicFromURL) {
		loadGrammarTopic(topicFromURL);
	} else {
		// Cargar la vista inicial de temas
		showGrammarTopics();
	}
}

/**
 * Carga los temas de gramática desde index.json
 */
async function loadGrammarTopics() {
	try {
		const response = await fetch("grammar/index.json");
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		// Convertir array a objeto con id como key
		GRAMMAR_TOPICS = {};
		data.grammarTopics.forEach((topic) => {
			GRAMMAR_TOPICS[topic.id] = {
				...topic,
				title: topic.title, // Ya viene en español del JSON
				subtitle: topic.subtitle,
				estimatedTime: "15-20 min", // Default, se puede personalizar por tema
			};
		});
	} catch (error) {
		console.error("Error loading grammar topics:", error);
		// Fallback a temas básicos si falla la carga
		GRAMMAR_TOPICS = {
			simple_tenses: {
				id: "simple_tenses",
				title: "Tiempos Simples",
				subtitle: "Present, Past & Future Simple",
				level: "A2-B1",
				description: "Aprende los tiempos básicos: presente, pasado y futuro simple",
				estimatedTime: "15-20 min",
				icon: "⏰",
				color: "#3B82F6",
			},
		};
	}
}
/**
 * Configura los event listeners para el sistema de gramática
 */
function setupGrammarEventListeners() {
	const grammarContainer = document.getElementById("grammar-topics-container");
	const grammarBackButton = document.getElementById("grammar-back-button");

	if (!grammarContainer) return;

	// Delegación de eventos para botones dinámicos en la grid de temas
	grammarContainer.addEventListener("click", (event) => {
		const target = event.target;

		// Botón de estudiar tema
		if (target.classList.contains("study-topic-btn") || target.closest(".study-topic-btn")) {
			const topicCard = target.closest(".grammar-topic-card");
			if (topicCard) {
				const topicId = topicCard.getAttribute("data-topic");
				if (topicId) {
					loadGrammarTopic(topicId);
				}
			}
		}
	});

	// Event listener para el botón de volver en la vista de estudio
	if (grammarBackButton) {
		grammarBackButton.addEventListener("click", () => {
			returnToGrammarSelection();
		});
	}
}

/**
 * Regresa de la vista de estudio a la selección de temas
 */
function returnToGrammarSelection() {
	const grammarSection = document.getElementById("grammar-section");
	const grammarStudy = document.getElementById("grammar-study");
	const grammarTitle = document.getElementById("grammar-title");

	if (grammarSection && grammarStudy) {
		grammarStudy.style.display = "none";
		grammarSection.classList.add("active");
	}

	// Restaurar título por defecto
	if (grammarTitle) {
		grammarTitle.textContent = "Gramática";
	}

	// Limpiar URL
	updateGrammarURL(null);
	showGrammarTopics();
}
/**
 * Muestra la lista de temas de gramática disponibles
 */
function showGrammarTopics() {
	const container = document.getElementById("grammar-topics-container");
	if (!container) return;

	// Limpiar scroll listener previo
	if (currentScrollCleanup) {
		currentScrollCleanup();
		currentScrollCleanup = null;
	}

	// Limpiar container
	container.innerHTML = "";

	// Crear cada tarjeta de tema directamente
	Object.values(GRAMMAR_TOPICS).forEach((topic) => {
		const card = createTopicCard(topic);
		container.appendChild(card);
	});
}

/**
 * Crea una tarjeta de tema usando createElement
 */
function createTopicCard(topic) {
	const card = createElement("div", {
		className: "grammar-topic-card",
	});
	card.setAttribute("data-topic", topic.id);
	card.style.setProperty("--topic-color", topic.color);

	// Header
	const header = createElement("div", {
		className: "topic-header",
	});

	const icon = createElement("span", {
		className: "topic-icon",
		textContent: topic.icon,
	});

	const level = createElement("span", {
		className: "topic-level",
		textContent: topic.level,
	});

	header.appendChild(icon);
	header.appendChild(level);

	// Título
	const titleElem = createElement("h4", {
		className: "topic-title",
		textContent: topic.title,
	});

	// Subtítulo
	const subtitle = createElement("h5", {
		className: "topic-subtitle",
		textContent: topic.subtitle,
	});

	// Descripción
	const description = createElement("p", {
		className: "topic-description",
		textContent: topic.description,
	});

	// Botón
	const button = createElement("button", {
		className: "study-topic-btn",
	});

	const buttonIcon = createElement("span", {
		textContent: "📖",
	});

	const buttonText = createElement("span", {
		textContent: "Estudiar Tema",
	});

	button.appendChild(buttonIcon);
	button.appendChild(buttonText);

	// Ensamblar tarjeta
	card.appendChild(header);
	card.appendChild(titleElem);
	card.appendChild(subtitle);
	card.appendChild(description);
	card.appendChild(button);

	return card;
}

/**
 * Variable para prevenir llamadas duplicadas
 */
let isLoadingGrammarTopic = false;

/**
 * Carga y muestra un tema específico de gramática
 */
async function loadGrammarTopic(topicId) {
	// Prevenir llamadas duplicadas
	if (isLoadingGrammarTopic) {
		return;
	}

	isLoadingGrammarTopic = true;

	const topic = GRAMMAR_TOPICS[topicId];
	if (!topic) {
		isLoadingGrammarTopic = false;
		return;
	}

	// Actualizar URL
	updateGrammarURL(topicId);

	// Ocultar la sección de selección y mostrar la vista de estudio
	const grammarSection = document.getElementById("grammar-section");
	const grammarStudy = document.getElementById("grammar-study");
	const container = document.getElementById("grammar-content");

	if (!grammarSection || !grammarStudy || !container) {
		isLoadingGrammarTopic = false;
		return;
	}

	grammarSection.classList.remove("active");
	grammarStudy.style.display = "block";

	// Mostrar loading
	showLoadingState(container, topic);

	try {
		// Cargar datos del tema
		const response = await fetch(`grammar/${topicId}.json`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const topicData = await response.json();
		currentGrammarData = { ...topicData, ...topic };

		// Mostrar contenido
		showGrammarTopicContent(currentGrammarData);
	} catch (error) {
		showGrammarError("No se pudo cargar el contenido del tema. Por favor, intenta de nuevo.");
	} finally {
		// Limpiar flag al terminar
		isLoadingGrammarTopic = false;
	}
}

/**
 * Muestra el estado de carga
 */
function showLoadingState(container, topic) {
	container.innerHTML = "";

	// Actualizar título en el header existente
	const grammarTitle = document.getElementById("grammar-title");
	if (grammarTitle) {
		grammarTitle.textContent = topic.title;
	}

	// Content con loading
	const loadingDiv = createElement("div", {
		className: "loading-state",
	});

	const spinner = createElement("div", {
		className: "spinner",
	});

	const loadingText = createElement("p", {
		textContent: "Cargando contenido de gramática...",
	});

	loadingDiv.appendChild(spinner);
	loadingDiv.appendChild(loadingText);
	container.appendChild(loadingDiv);
}

/**
 * Muestra el contenido de un tema de gramática
 */
function showGrammarTopicContent(topicData) {
	const container = document.getElementById("grammar-content");
	if (!container) return;

	// Actualizar título en el header existente
	const grammarTitle = document.getElementById("grammar-title");
	if (grammarTitle) {
		grammarTitle.textContent = topicData.title;
	}

	container.innerHTML = "";

	// Crear contenido principal sin sidebar
	const mainContent = createElement("div", {
		className: "grammar-main-content",
	});

	// Generar contenido usando createElement
	const grammarContent = createGrammarContent(topicData);
	mainContent.appendChild(grammarContent);

	container.appendChild(mainContent);
}

/**
 * Crea el contenido de gramática usando createElement
 */
function createGrammarContent(topicData) {
	const container = createElement("div", {
		className: "grammar-content-simple",
	});

	// Intro con ID para navegación
	const intro = createGrammarIntro(topicData);
	intro.id = "intro";
	container.appendChild(intro);

	// Secciones
	if (topicData.sections && topicData.sections.length > 0) {
		topicData.sections.forEach((section, index) => {
			const sectionElement = createGrammarSection(section, index);
			container.appendChild(sectionElement);

			// Separador entre secciones
			if (index < topicData.sections.length - 1) {
				const divider = createElement("div", {
					className: "section-divider",
				});
				container.appendChild(divider);
			}
		});
	}

	// Comparaciones
	if (topicData.comparison) {
		const comparison = createComparisonSection(topicData.comparison);
		container.appendChild(comparison);
	}

	// Tips
	if (topicData.tips) {
		const tips = createTipsSection(topicData.tips);
		container.appendChild(tips);
	}

	return container;
}

/**
 * Crea la introducción del tema
 */
function createGrammarIntro(topicData) {
	const intro = createElement("div", {
		className: "grammar-intro",
	});

	// Meta info
	const meta = createElement("div", {
		className: "topic-meta",
	});

	const levelBadge = createElement("span", {
		className: "topic-level-badge",
		textContent: topicData.level,
	});

	const estimatedTime = createElement("span", {
		className: "estimated-time",
		textContent: `⏱️ ${topicData.estimatedTime}`,
	});

	meta.appendChild(levelBadge);
	meta.appendChild(estimatedTime);

	// Título
	const title = createElement("h2", {
		textContent: topicData.subtitle,
	});

	intro.appendChild(meta);
	intro.appendChild(title);

	return intro;
}

/**
 * Crea una sección de gramática
 */
function createGrammarSection(section, index) {
	const sectionDiv = createElement("div", {
		className: "grammar-section",
		id: `section-${index}`,
	});

	// Header
	const header = createElement("div", {
		className: "section-header",
	});

	const title = createElement("h3", {
		className: "section-title",
	});

	const number = createElement("span", {
		className: "section-number",
		textContent: index + 1,
	});

	title.appendChild(number);
	title.appendChild(document.createTextNode(section.title));

	const structure = createElement("div", {
		className: "section-structure",
	});

	const structureLabel = createElement("strong", {
		textContent: "Estructura: ",
	});

	const structureCode = createElement("code", {
		textContent: section.structure,
	});

	structure.appendChild(structureLabel);
	structure.appendChild(structureCode);

	header.appendChild(title);
	header.appendChild(structure);

	// Description
	const description = createElement("p", {
		className: "section-description",
		textContent: section.description,
	});

	// Content
	const content = createElement("div", {
		className: "section-content",
	});

	// Uses
	if (section.uses) {
		const uses = createUsesSection(section.uses);
		content.appendChild(uses);
	}

	// Forms
	if (section.forms) {
		const forms = createFormsSection(section.forms);
		content.appendChild(forms);
	}

	// Time expressions
	if (section.timeExpressions) {
		const timeExpr = createTimeExpressionsSection(section.timeExpressions);
		content.appendChild(timeExpr);
	}

	// Irregular verbs
	if (section.irregularVerbs) {
		const irregularVerbs = createIrregularVerbsSection(section.irregularVerbs);
		content.appendChild(irregularVerbs);
	}

	sectionDiv.appendChild(header);
	sectionDiv.appendChild(description);
	sectionDiv.appendChild(content);

	return sectionDiv;
}

/**
 * Crea la sección de usos
 */
function createUsesSection(uses) {
	const section = createElement("div", {
		className: "section-uses",
	});

	const title = createElement("h4", {
		textContent: "📝 Usos principales:",
	});

	const grid = createElement("div", {
		className: "uses-grid",
	});

	uses.forEach((use) => {
		const card = createElement("div", {
			className: "use-card",
		});

		const useTitle = createElement("h5", {
			textContent: use.use,
		});

		const example = createElement("div", {
			className: "example",
		});

		const exampleEn = createElement("span", {
			className: "example-en",
			textContent: `"${use.example}"`,
		});

		const exampleEs = createElement("span", {
			className: "example-es",
			textContent: use.translation,
		});

		example.appendChild(exampleEn);
		example.appendChild(exampleEs);

		card.appendChild(useTitle);
		card.appendChild(example);

		if (use.note) {
			const note = createElement("div", {
				className: "use-note",
				textContent: `💡 ${use.note}`,
			});
			card.appendChild(note);
		}

		grid.appendChild(card);
	});

	section.appendChild(title);
	section.appendChild(grid);

	return section;
}

/**
 * Crea la sección de formas gramaticales
 */
function createFormsSection(forms) {
	const section = createElement("div", {
		className: "section-forms",
	});

	const title = createElement("h4", {
		textContent: "✏️ Formas gramaticales:",
	});

	const container = createElement("div", {
		className: "forms-container",
	});

	const formTitles = {
		affirmative: "✅ Afirmativa",
		negative: "❌ Negativa",
		interrogative: "❓ Interrogativa",
	};

	Object.entries(forms).forEach(([formType, formData]) => {
		const formDiv = createElement("div", {
			className: "grammar-form",
		});

		const formTitle = createElement("h5", {
			textContent: formTitles[formType] || formType,
		});

		const structure = createElement("div", {
			className: "form-structure",
		});

		const structureCode = createElement("code", {
			textContent: formData.structure,
		});

		structure.appendChild(structureCode);

		formDiv.appendChild(formTitle);
		formDiv.appendChild(structure);

		// Examples
		if (formData.examples && formData.examples.length > 0) {
			const examplesDiv = createElement("div", {
				className: "form-examples",
			});

			const examplesTitle = createElement("h6", {
				textContent: "Ejemplos:",
			});

			const examplesList = createElement("ul");

			formData.examples.forEach((example) => {
				const li = createElement("li", {
					textContent: example,
				});
				examplesList.appendChild(li);
			});

			examplesDiv.appendChild(examplesTitle);
			examplesDiv.appendChild(examplesList);
			formDiv.appendChild(examplesDiv);
		}

		// Rules
		if (formData.rules && formData.rules.length > 0) {
			const rulesDiv = createElement("div", {
				className: "form-rules",
			});

			const rulesTitle = createElement("h6", {
				textContent: "Reglas:",
			});

			const rulesList = createElement("ul");

			formData.rules.forEach((rule) => {
				const li = createElement("li", {
					textContent: rule,
				});
				rulesList.appendChild(li);
			});

			rulesDiv.appendChild(rulesTitle);
			rulesDiv.appendChild(rulesList);
			formDiv.appendChild(rulesDiv);
		}

		container.appendChild(formDiv);
	});

	section.appendChild(title);
	section.appendChild(container);

	return section;
}

/**
 * Crea la sección de expresiones de tiempo
 */
function createTimeExpressionsSection(expressions) {
	const section = createElement("div", {
		className: "time-expressions",
	});

	const title = createElement("h4", {
		textContent: "⏰ Expresiones de tiempo:",
	});

	const grid = createElement("div", {
		className: "time-expressions-grid",
	});

	expressions.forEach((expr) => {
		const span = createElement("span", {
			className: "time-expression",
			textContent: expr,
		});
		grid.appendChild(span);
	});

	section.appendChild(title);
	section.appendChild(grid);

	return section;
}

/**
 * Crea la sección de verbos irregulares
 */
function createIrregularVerbsSection(verbs) {
	const section = createElement("div", {
		className: "irregular-verbs",
	});

	const title = createElement("h4", {
		textContent: "📚 Verbos irregulares comunes:",
	});

	const table = createElement("div", {
		className: "irregular-verbs-table",
	});

	// Header
	const header = createElement("div", {
		className: "table-header",
	});

	["Infinitivo", "Pasado", "Significado"].forEach((text) => {
		const span = createElement("span", {
			textContent: text,
		});
		header.appendChild(span);
	});

	table.appendChild(header);

	// Rows
	verbs.forEach((verb) => {
		const row = createElement("div", {
			className: "verb-row",
		});

		const base = createElement("span", {
			className: "verb-base",
			textContent: verb.base,
		});

		const past = createElement("span", {
			className: "verb-past",
			textContent: verb.past,
		});

		const meaning = createElement("span", {
			className: "verb-meaning",
			textContent: verb.meaning,
		});

		row.appendChild(base);
		row.appendChild(past);
		row.appendChild(meaning);

		table.appendChild(row);
	});

	section.appendChild(title);
	section.appendChild(table);

	return section;
}

/**
 * Crea la sección de comparación
 */
function createComparisonSection(comparison) {
	const section = createElement("div", {
		className: "grammar-comparison",
		id: "comparison",
	});

	const header = createElement("div", {
		className: "section-header",
	});

	const title = createElement("h3", {
		className: "section-title",
	});

	const icon = createElement("span", {
		className: "section-icon",
		textContent: "⚖️",
	});

	title.appendChild(icon);
	title.appendChild(document.createTextNode(comparison.title));

	header.appendChild(title);

	const examples = createElement("div", {
		className: "comparison-examples",
	});

	comparison.examples.forEach((example) => {
		const card = createElement("div", {
			className: "comparison-card",
		});

		["present", "past", "future"].forEach((tense) => {
			const row = createElement("div", {
				className: "comparison-row",
			});

			const label = createElement("strong", {
				textContent: tense === "present" ? "Presente:" : tense === "past" ? "Pasado:" : "Futuro:",
			});

			row.appendChild(label);
			row.appendChild(document.createTextNode(` ${example[tense]}`));

			card.appendChild(row);
		});

		const translation = createElement("div", {
			className: "comparison-translation",
		});

		const translationLabel = createElement("strong", {
			textContent: "Traducción: ",
		});

		translation.appendChild(translationLabel);
		translation.appendChild(document.createTextNode(example.translation));

		card.appendChild(translation);
		examples.appendChild(card);
	});

	const divider = createElement("div", {
		className: "section-divider",
	});

	section.appendChild(header);
	section.appendChild(examples);
	section.appendChild(divider);

	return section;
}

/**
 * Crea la sección de tips
 */
function createTipsSection(tips) {
	const section = createElement("div", {
		className: "grammar-tips",
		id: "tips",
	});

	const header = createElement("div", {
		className: "section-header",
	});

	const title = createElement("h3", {
		className: "section-title",
	});

	const icon = createElement("span", {
		className: "section-icon",
		textContent: "💡",
	});

	title.appendChild(icon);
	title.appendChild(document.createTextNode("Tips importantes"));

	header.appendChild(title);

	const grid = createElement("div", {
		className: "tips-grid",
	});

	tips.forEach((tip) => {
		const card = createElement("div", {
			className: "tip-card",
		});

		const tipTitle = createElement("h4", {
			textContent: tip.title,
		});

		const content = createElement("p", {
			textContent: tip.content,
		});

		card.appendChild(tipTitle);
		card.appendChild(content);

		if (tip.example) {
			const example = createElement("div", {
				className: "tip-example",
				textContent: tip.example,
			});
			card.appendChild(example);
		}

		grid.appendChild(card);
	});

	section.appendChild(header);
	section.appendChild(grid);

	return section;
}

/**
 * Muestra un mensaje de error
 */
function showGrammarError(message) {
	const container = document.getElementById("grammar-content");
	if (!container) return;

	// Actualizar título en el header existente
	const grammarTitle = document.getElementById("grammar-title");
	if (grammarTitle) {
		grammarTitle.textContent = "Error";
	}

	container.innerHTML = "";

	const errorDiv = createElement("div", {
		className: "error-message",
	});

	const errorTitle = createElement("h3", {
		textContent: "⚠️ Oops!",
	});

	const errorText = createElement("p", {
		textContent: message,
	});

	errorDiv.appendChild(errorTitle);
	errorDiv.appendChild(errorText);
	container.appendChild(errorDiv);
}

/**
 * Función pública para cambiar a la vista de gramática
 */
function switchToGrammar() {
	showGrammarTopics();
}

/**
 * Obtiene el tema de gramática desde la URL
 */
function getTopicFromURL() {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get("topic") || urlParams.get("grammar");
}

/**
 * Actualiza la URL con el tema de gramática
 */
function updateGrammarURL(topicId) {
	const url = new URL(window.location);
	if (topicId) {
		url.searchParams.set("topic", topicId);
	} else {
		url.searchParams.delete("topic");
		url.searchParams.delete("grammar");
	}
	window.history.pushState({}, "", url);
}

// Inicialización automática cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", async () => {
	await initializeGrammarSystem();
});
