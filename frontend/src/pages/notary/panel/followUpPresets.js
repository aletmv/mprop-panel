// Sugerencias de texto para crear una OperationalTask subtype: 'follow_up'
// desde el menú "+ seguimiento". Solo datos — no hay lógica ni envío real
// de WhatsApp/email acá (eso es AutomationSuggestion/MessageDraft a futuro,
// ver memory/OPERATIONAL_TASKS_ARCHITECTURE.md).

export const followUpPresets = (actorLabel) => [
  `Llamar a ${actorLabel}`,
  `Enviar WhatsApp a ${actorLabel}`,
  `Recordar envío de documentación a ${actorLabel}`,
  `Consultar avance con ${actorLabel}`,
];
