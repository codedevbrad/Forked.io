/* eslint-disable @typescript-eslint/no-explicit-any */

export type TopPage = {
  url: string;
  views: number;
};

export type TopSource = {
  source: string;
  visits: number;
};

export type DeviceStat = {
  device: string;
  views: number;
};

export type TimeseriesPoint = {
  date: string;     // e.g. "2025-11-20"
  views: number;
};

export type CityStat = {
  city: string;
  views: number;
};

export type AnalyticsResult = {
  pageviews: number;
  uniqueVisitors: number;
  topPages: TopPage[];
  topSources: TopSource[];
  devices: DeviceStat[];
  timeseries: TimeseriesPoint[];
  cities: CityStat[];
  quotePageviews: number;
};


export function formatAnalytics(rows: any[] ): AnalyticsResult {
  const formatted: AnalyticsResult = {
    pageviews: 0,
    uniqueVisitors: 0,
    topPages: [],
    topSources: [],
    devices: [],
    timeseries: [],
    cities: [],
    quotePageviews: 0,
  };

  // Helper to normalize URL paths
  function cleanUrl(fullUrl: string) {
    try {
      const parsed = new URL(fullUrl);
      let path = parsed.pathname;
      
      // If it's homepage
      if (path === "/" || path.trim() === "") return "Home";

      // Remove leading & trailing slashes: "/services/steel/" → "services/steel"
      path = path.replace(/^\/|\/$/g, "");

      return path || "Home";
    } catch {
      // Fallback for invalid URLs
      let fallback = fullUrl.replace(/^https?:\/\/[^/]+/, "") || "/";
      
      if (fallback === "/") return "Home";

      fallback = fallback.replace(/^\/|\/$/g, "");

      return fallback || "Home";
    }
  }

  for (const row of rows) {
    const [metric, label, value] = row;

    switch (metric) {
      case "pageviews":
        formatted.pageviews = value;
        break;

      case "unique_visitors":
        formatted.uniqueVisitors = value;
        break;

      case "top_pages": {
        const clean = cleanUrl(label);

        formatted.topPages.push({
          url: clean,
          views: value,
        });

        // Quote page detection with new formatting
        if (clean === "quote") {
          formatted.quotePageviews = value;
        }

        break;
      }

      case "top_sources":
        formatted.topSources.push({
          source: label,
          visits: value,
        });
        break;

      case "devices":
        formatted.devices.push({
          device: label,
          views: value,
        });
        break;

      case "cities":
        formatted.cities.push({
          city: label || "Unknown",
          views: value,
        });
        break;

      case "timeseries":
        formatted.timeseries.push({
          date: label,
          views: value,
        });
        break;
    }
  }

  return formatted;
}
