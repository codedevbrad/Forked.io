export type UnsplashPhoto = {
  id: string;
  url: string;
  thumbUrl: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
};

/**
 * Searches Unsplash for photos matching a query string.
 * Requires UNSPLASH_ACCESS_KEY env variable.
 */
export async function searchUnsplashPhotos(
  query: string,
  perPage = 12
): Promise<UnsplashPhoto[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    throw new Error("UNSPLASH_ACCESS_KEY is not configured");
  }

  const params = new URLSearchParams({
    query,
    per_page: String(perPage),
    orientation: "landscape",
  });

  const response = await fetch(
    `https://api.unsplash.com/search/photos?${params.toString()}`,
    {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.status}`);
  }

  const data = await response.json();

  return data.results.map(
    (photo: {
      id: string;
      urls: { regular: string; small: string };
      alt_description: string | null;
      user: { name: string; links: { html: string } };
    }) => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbUrl: photo.urls.small,
      alt: photo.alt_description || query,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
    })
  );
}
