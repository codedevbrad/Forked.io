"use server";

import { runQuery } from "../call";
import { formatAnalytics, AnalyticsResult } from "./format.all";
import { getPostHogConfig } from "@/src/domains/website/db";

export async function getAnalytics_all(
  websiteId: string,
  range: "1d" | "7d" | "30d" | "all" = "7d"
): Promise<AnalyticsResult | null> {
  // Fetch PostHog config for the website
  const config = await getPostHogConfig(websiteId);
  
  if (!config) {
    throw new Error("PostHog configuration not found for this website");
  }

  const { host, projectId, personalKey } = config.config;

  // Get website to get domainUrl - avoid circular import
  const { prisma } = await import("@/src/lib/db");
  const { auth } = await import("@/auth");
  
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const website = await prisma.website.findUnique({
    where: { id: websiteId },
    include: {
      domain: {
        include: {
          organisation: true,
        },
      },
    },
  });

  if (!website) {
    throw new Error("Website not found");
  }

  // Verify user is a member
  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
  });

  if (!user || user.organisationId !== website.domain.organisationId) {
    throw new Error("Unauthorized");
  }

  const domain = website.domainUrl;
  const cleanDomain = domain.replace("https://", "").replace("http://", "");

  const dateFilter =
    range === "all"
      ? ""
      : `AND timestamp >= now() - INTERVAL ${
          range === "1d" ? "1" :
          range === "7d" ? "7" :
          "30"
        } DAY`;

  const timeseriesLimit =
    range === "1d"
      ? "1"
      : range === "7d"
      ? "7"
      : range === "30d"
      ? "30"
      : "90";

  const result = await runQuery(`
    WITH [ ] AS blocked_hosts

    SELECT * FROM (

      -- PAGEVIEWS
      SELECT 'pageviews' AS metric, toString(NULL) AS label, count() AS value
      FROM events
      WHERE event = '$pageview'
        AND properties.$host = '${cleanDomain}'
        AND properties.$host NOT IN blocked_hosts
        ${dateFilter}

      UNION ALL

      -- UNIQUE VISITORS
      SELECT 'unique_visitors' AS metric, toString(NULL) AS label, count(distinct person_id) AS value
      FROM events
      WHERE event = '$pageview'
        AND properties.$host = '${cleanDomain}'
        AND properties.$host NOT IN blocked_hosts
        ${dateFilter}

      UNION ALL

      -- TOP PAGES
      SELECT 'top_pages' AS metric, properties.$current_url AS label, count() AS value
      FROM events
      WHERE event = '$pageview'
        AND properties.$host = '${cleanDomain}'
        AND properties.$host NOT IN blocked_hosts
        ${dateFilter}
      GROUP BY label
      ORDER BY value DESC
      LIMIT 5

      UNION ALL

      -- TOP SOURCES
      SELECT 'top_sources' AS metric, properties.$referrer AS label, count() AS value
      FROM events
      WHERE event = '$pageview'
        AND properties.$host = '${cleanDomain}'
        AND properties.$host NOT IN blocked_hosts
        ${dateFilter}
      GROUP BY label
      ORDER BY value DESC
      LIMIT 5

      UNION ALL

      -- DEVICES
      SELECT 'devices' AS metric, properties.$device_type AS label, count() AS value
      FROM events
      WHERE event = '$pageview'
        AND properties.$host = '${cleanDomain}'
        AND properties.$host NOT IN blocked_hosts
        ${dateFilter}
      GROUP BY label

      UNION ALL

      -- CITIES
      SELECT 'cities' AS metric, properties.$geoip_city_name AS label, count() AS value
      FROM events
      WHERE event = '$pageview'
        AND properties.$host = '${cleanDomain}'
        AND properties.$host NOT IN blocked_hosts
        ${dateFilter}
      GROUP BY label
      ORDER BY value DESC
      LIMIT 10

      UNION ALL

      -- TIMESERIES
      SELECT 'timeseries' AS metric, toString(toDate(timestamp)) AS label, count() AS value
      FROM events
      WHERE event = '$pageview'
        AND properties.$host = '${cleanDomain}'
        AND properties.$host NOT IN blocked_hosts
        ${dateFilter}
      GROUP BY label
      ORDER BY label DESC
      LIMIT ${timeseriesLimit}
    )
  `, host, projectId, personalKey);

  return formatAnalytics(result.results);
}
