import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "dashboard.json");

function getDefaultData() {
  return {
    totalGenerated: 0,
    avgOpenRate: 0,
    ctr: 0,
    campaigns: [],
  };
}

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(getDefaultData(), null, 2));
  }
}

export async function readDashboardData() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    const fallback = getDefaultData();
    await fs.writeFile(DATA_FILE, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

export async function writeDashboardData(data) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export function computeStatsFromCampaigns(campaigns) {
  const totalLeads = campaigns.reduce((acc, c) => acc + (c.leads || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === "Active").length;

  // Deterministic, derived stats (avoid random values)
  const avgOpenRate = Math.min(80, Math.round(15 + activeCampaigns * 3 + totalLeads / 150));
  const ctr = Math.min(30, Math.round(2 + activeCampaigns * 1 + totalLeads / 400));

  return { totalLeads, activeCampaigns, avgOpenRate, ctr };
}
