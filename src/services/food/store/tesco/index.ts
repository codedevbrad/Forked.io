export interface TescoSuggestion {
  query: string;
}

export interface TescoSuggestionsResponse {
  config: string;
  results: TescoSuggestion[];
}

export const tescoAutoComplete = async (query: string): Promise<string[]> => {
  if (!query.trim()) {
    return [];
  }

  try {
    const url = new URL("https://search.api.tesco.com/suggestion/");
    url.searchParams.set("distchannel", "ghs");
    url.searchParams.set("limit", "10");
    url.searchParams.set("query", query.trim());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Tesco API error: ${response.status}`);
    }

    const data: TescoSuggestionsResponse = await response.json();
    return data.results.map((result) => result.query);
  } catch (error) {
    console.error("Error fetching Tesco suggestions:", error);
    return [];
  }
};