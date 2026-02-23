import { auth } from "@/auth";
import { searchGoogleImages } from "@/src/services/googleimages";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || !query.trim()) {
      return Response.json({ images: [] }, { status: 400 });
    }

    const images = await searchGoogleImages(`${query} recipe food`, 5);

    return Response.json({ images });
  } catch (error) {
    console.error("Recipe image search error:", error);
    return Response.json({ images: [] }, { status: 500 });
  }
}
