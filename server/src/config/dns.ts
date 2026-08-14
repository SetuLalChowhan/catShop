import dns from "node:dns";

/**
 * Optionally override the DNS servers Node uses for hostname resolution.
 * Reads the `DNS_SERVERS` env var as a comma-separated list, e.g.
 * `DNS_SERVERS="8.8.8.8,1.1.1.1"`.
 *
 * Needed on some machines (notably Windows) where the OS reports no usable
 * DNS servers to Node, causing every lookup to fail with
 * `querySrv ECONNREFUSED` against 127.0.0.1. Must run before any async
 * connection that resolves hostnames (e.g. MongoDB).
 */
export function configureDNS(): void {
  const raw = (process.env.DNS_SERVERS || "").trim();
  if (!raw) return;

  const servers = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (servers.length === 0) return;

  // Throws a clear error if an address is invalid — fail fast at boot.
  dns.setServers(servers);
  console.log(`DNS servers overridden → ${servers.join(", ")} 🌐`);
}
