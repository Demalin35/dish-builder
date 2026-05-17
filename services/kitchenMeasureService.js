export async function convertKitchenMeasure({ ingredient, quantity, unit, language = "en" }) {
  const response = await fetch("/api/convert_measurement.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ingredient, quantity, unit, language }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }

  return payload;
}
