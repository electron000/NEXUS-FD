import { API_BASE_URL } from "@/services/config";
// FIXED: Adjusted the import path to match your likely project structure
import type { DomainValuationResponse } from "@/types";

export async function fetchDomainValuation(
  domain: string,
): Promise<DomainValuationResponse> {
  const token = localStorage.getItem("nexus_token");

  return new Promise((resolve, reject) => {
    const es = new EventSource(
      `${API_BASE_URL}/api/domains/valuation-stream/${domain}?token=${token}`,
    );

    es.addEventListener("complete", (e: MessageEvent<string>) => {
      const data = JSON.parse(e.data);
      es.close();
      resolve(data);
    });

    es.onerror = (err) => {
      console.error("SSE Error during valuation fetch:", err);
      es.close();
      reject(new Error("Failed to fetch valuation from backend."));
    };

    // Timeout after 30 seconds
    setTimeout(() => {
      es.close();
      reject(new Error("Valuation request timed out."));
    }, 30000);
  });
}
