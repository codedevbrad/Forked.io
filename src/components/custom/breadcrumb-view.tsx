"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BreadcrumbNav, type BreadcrumbItem } from "@/src/components/ui/breadcrumb";
import { getOrganisation } from "@/src/domains/organisation/db";
import { getDomain } from "@/src/domains/domain/db";
import { getWebsite } from "@/src/domains/website/db";
import { GoBackButton } from "./goBack";

interface BreadcrumbViewProps {
  orgid: string;
}

interface BreadcrumbData {
  organisationName?: string;
  domainName?: string;
  domainId?: string;
  websiteName?: string;
  websiteId?: string;
}

/**
 * BreadcrumbView component that automatically detects the current route
 * and builds breadcrumbs based on the page hierarchy.
 * 
 * Supports routes:
 * - /org/[orgid] - Organisation page
 * - /org/[orgid]/domain/[domainid] - Domain page
 * - /org/[orgid]/domain/[domainid]/website/[websiteid]/edit - Website edit page
 */
export function BreadcrumbView({ orgid }: BreadcrumbViewProps) {
  const pathname = usePathname();
  const [breadcrumbData, setBreadcrumbData] = useState<BreadcrumbData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBreadcrumbData() {
      setIsLoading(true);
      try {
        // Parse the pathname to extract route information
        const pathParts = pathname.split("/").filter(Boolean);
        
        const data: BreadcrumbData = {};
        
        // Extract domainId and websiteId from pathname
        const domainIndex = pathParts.indexOf("domain");
        if (domainIndex !== -1 && pathParts[domainIndex + 1]) {
          data.domainId = pathParts[domainIndex + 1];
        }
        
        const websiteIndex = pathParts.indexOf("website");
        if (websiteIndex !== -1 && pathParts[websiteIndex + 1]) {
          data.websiteId = pathParts[websiteIndex + 1];
        }

        // Fetch data based on what we need using server actions
        const fetchPromises: Promise<void>[] = [];
        
        // Always fetch organisation
        fetchPromises.push(
          getOrganisation(orgid)
            .then(org => {
              if (org) data.organisationName = org.name;
            })
            .catch(() => {})
        );

        // Fetch domain if we have domainId
        if (data.domainId) {
          fetchPromises.push(
            getDomain(data.domainId)
              .then(domain => {
                if (domain) {
                  data.domainName = domain.name;
                  if (!data.organisationName && domain.organisation) {
                    data.organisationName = domain.organisation.name;
                  }
                }
              })
              .catch(() => {})
          );
        }

        // Fetch website if we have websiteId
        if (data.websiteId) {
          fetchPromises.push(
            getWebsite(data.websiteId)
              .then(website => {
                if (website) {
                  data.websiteName = website.name;
                  if (!data.domainName && website.domain) {
                    data.domainName = website.domain.name;
                    data.domainId = website.domainId;
                  }
                  if (!data.organisationName && website.domain?.organisation) {
                    data.organisationName = website.domain.organisation.name;
                  }
                }
              })
              .catch(() => {})
          );
        }

        await Promise.all(fetchPromises);
        setBreadcrumbData(data);
      } catch (error) {
        console.error("Error fetching breadcrumb data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBreadcrumbData();
  }, [pathname, orgid]);

  if (isLoading || !breadcrumbData) {
    return null;
  }

  // Build breadcrumb items based on the current route
  const breadcrumbItems: BreadcrumbItem[] = [];
  
  // Always start with Home
  breadcrumbItems.push({
    label: "Home",
    href: "/",
  });

  // Add Organisation breadcrumb
  if (breadcrumbData.organisationName) {
    const isOrganisationPage = pathname === `/org/${orgid}`;
    breadcrumbItems.push({
      label: breadcrumbData.organisationName,
      href: isOrganisationPage ? undefined : `/org/${orgid}`,
    });
  }

  // Add Domain breadcrumb if we're on a domain or website page
  if (breadcrumbData.domainName && breadcrumbData.domainId) {
    const isDomainPage = pathname === `/org/${orgid}/domain/${breadcrumbData.domainId}`;
    breadcrumbItems.push({
      label: breadcrumbData.domainName,
      href: isDomainPage ? undefined : `/org/${orgid}/domain/${breadcrumbData.domainId}`,
    });
  }

  // Add Website breadcrumb if we're on a website page
  if (breadcrumbData.websiteName && breadcrumbData.websiteId && breadcrumbData.domainId) {
    const isWebsiteEditPage = pathname.includes("/edit");
    breadcrumbItems.push({
      label: breadcrumbData.websiteName,
      href: isWebsiteEditPage ? undefined : `/org/${orgid}/domain/${breadcrumbData.domainId}/website/${breadcrumbData.websiteId}`,
    });

    // Add Edit breadcrumb if we're on the edit page
    if (isWebsiteEditPage) {
      breadcrumbItems.push({
        label: "Edit",
      });
    }
  }

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-row gap-4 items-center">
      <GoBackButton variant="default" text="Back" />
      <BreadcrumbNav items={breadcrumbItems} />
    </div>
  );
}
