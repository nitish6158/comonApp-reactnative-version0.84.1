const MAX_URL_LENGTH = 2048;
const DOMAIN_LABEL_REGEX = /^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i;
const TLD_REGEX = /^[a-z]{2,}$/i;
const IPV4_REGEX = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const PATH_REGEX = /^[-a-z\d%_.~+/]*$/i;
const QUERY_REGEX = /^[;&a-z\d%_.~+=-]*$/i;
const FRAGMENT_REGEX = /^[-a-z\d_]*$/i;

function isValidHost(host: string): boolean {
  if (!host) {
    return false;
  }
  if (IPV4_REGEX.test(host)) {
    return host.split(".").every((octet) => Number(octet) <= 255);
  }
  const labels = host.split(".");
  if (labels.length < 2) {
    return false;
  }
  const tld = labels[labels.length - 1];
  if (!TLD_REGEX.test(tld)) {
    return false;
  }
  return labels.slice(0, -1).every((label) => DOMAIN_LABEL_REGEX.test(label));
}

/**
 * Validates HTTP(S) URLs and bare hostnames in linear time (ReDoS-safe).
 */
export function isValidUrl(input: string): boolean {
  if (!input || input.length > MAX_URL_LENGTH || /\s/.test(input)) {
    return false;
  }

  let rest = input.replace(/^https?:\/\//i, "");

  const hashIdx = rest.indexOf("#");
  if (hashIdx !== -1) {
    const fragment = rest.slice(hashIdx + 1);
    if (!FRAGMENT_REGEX.test(fragment)) {
      return false;
    }
    rest = rest.slice(0, hashIdx);
  }

  const queryIdx = rest.indexOf("?");
  if (queryIdx !== -1) {
    const query = rest.slice(queryIdx + 1);
    if (!QUERY_REGEX.test(query)) {
      return false;
    }
    rest = rest.slice(0, queryIdx);
  }

  const slashIdx = rest.indexOf("/");
  if (slashIdx !== -1) {
    const path = rest.slice(slashIdx + 1);
    if (!PATH_REGEX.test(path)) {
      return false;
    }
    rest = rest.slice(0, slashIdx);
  }

  const colonIdx = rest.indexOf(":");
  let host = rest;
  if (colonIdx !== -1) {
    const port = rest.slice(colonIdx + 1);
    if (!/^\d{1,5}$/.test(port)) {
      return false;
    }
    host = rest.slice(0, colonIdx);
  }

  return isValidHost(host);
}

