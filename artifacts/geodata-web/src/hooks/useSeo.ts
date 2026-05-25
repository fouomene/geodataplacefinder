import { useEffect } from "react";

interface SeoOptions {
  title: string;
  description: string;
  canonical?: string;
}

export function useSeo({ title, description, canonical }: SeoOptions) {
  useEffect(() => {
    document.title = title;

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (metaDesc) metaDesc.content = description;

    let ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = title;

    let ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = description;

    let twitterTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.content = title;

    let twitterDesc = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.content = description;

    if (canonical) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (link) link.href = canonical;
    }
  }, [title, description, canonical]);
}
