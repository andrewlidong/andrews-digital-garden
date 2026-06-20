// Robustly fetch a file's text content.
//
// Loading is done lazily (when a file is opened) rather than eagerly for every
// file at once. The previous eager approach fired ~one fetch per file in
// parallel on mount, and the browser would abort some of the redundant
// requests (net::ERR_ABORTED). An aborted fetch throws, which used to get
// stored permanently as "Error loading content". Lazy loading plus a small
// retry makes transient failures self-healing — reopening a file refetches it.
export async function loadFileContent(path: string, attempts = 3): Promise<string> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${path}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) {
        // brief backoff before retrying
        await new Promise((resolve) => setTimeout(resolve, 250 * (i + 1)));
      }
    }
  }
  console.error(`Error loading file: ${path}`, lastError);
  return "Error loading content";
}
