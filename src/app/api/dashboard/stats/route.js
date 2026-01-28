import { NextResponse } from 'next/server';
import { checkOllamaHealth } from '@/lib/ai-config';

// In-memory storage for demo (in production, use a database)
let dashboardData = {
  totalGenerated: 1284,
  totalLeads: 842,
  avgOpenRate: 42.5,
  ctr: 12.8,
  campaigns: [
    { id: 1, name: "SaaS Outreach - Q1", date: "2 hours ago", status: "Active", leads: 120, createdAt: new Date().toISOString() },
    { id: 2, name: "Real Estate Agents", date: "Yesterday", status: "Draft", leads: 45, createdAt: new Date().toISOString() },
    { id: 3, name: "Tech Founders NYC", date: "Jan 24, 2026", status: "Completed", leads: 300, createdAt: new Date().toISOString() },
  ]
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const refresh = searchParams.get('refresh') === 'true';

    // Check Ollama health
    const ollamaConfig = {
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    };
    const health = await checkOllamaHealth(ollamaConfig.baseUrl);

    // Calculate dynamic stats from campaigns
    const totalLeads = dashboardData.campaigns.reduce((acc, curr) => acc + curr.leads, 0);
    const activeCampaigns = dashboardData.campaigns.filter(c => c.status === 'Active').length;

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalGenerated: dashboardData.totalGenerated,
          totalLeads: totalLeads,
          activeCampaigns: activeCampaigns,
          avgOpenRate: dashboardData.avgOpenRate,
          ctr: dashboardData.ctr,
        },
        campaigns: dashboardData.campaigns,
        system: {
          ollama: {
            status: health.ok ? 'online' : 'offline',
            baseUrl: ollamaConfig.baseUrl,
          }
        },
        lastUpdated: new Date().toISOString(),
      }
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, campaign } = body;

    switch (action) {
      case 'addCampaign':
        if (!campaign?.name || !campaign?.leads) {
          return NextResponse.json(
            { success: false, error: 'Campaign name and leads are required' },
            { status: 400 }
          );
        }
        const newCampaign = {
          id: Date.now(),
          name: campaign.name,
          date: 'Just now',
          status: 'Draft',
          leads: parseInt(campaign.leads) || 0,
          createdAt: new Date().toISOString(),
        };
        dashboardData.campaigns.unshift(newCampaign);
        dashboardData.totalGenerated += parseInt(campaign.leads) || 0;
        return NextResponse.json({ success: true, campaign: newCampaign });

      case 'updateStatus':
        if (!campaign?.id || !campaign?.status) {
          return NextResponse.json(
            { success: false, error: 'Campaign ID and status are required' },
            { status: 400 }
          );
        }
        const idx = dashboardData.campaigns.findIndex(c => c.id === campaign.id);
        if (idx !== -1) {
          dashboardData.campaigns[idx].status = campaign.status;
          return NextResponse.json({ success: true, campaign: dashboardData.campaigns[idx] });
        }
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404 }
        );

      case 'deleteCampaign':
        if (!campaign?.id) {
          return NextResponse.json(
            { success: false, error: 'Campaign ID is required' },
            { status: 400 }
          );
        }
        dashboardData.campaigns = dashboardData.campaigns.filter(c => c.id !== campaign.id);
        return NextResponse.json({ success: true });

      case 'reset':
        dashboardData = {
          totalGenerated: 0,
          totalLeads: 0,
          avgOpenRate: 0,
          ctr: 0,
          campaigns: []
        };
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error('Dashboard action error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

