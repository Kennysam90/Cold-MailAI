import { NextResponse } from 'next/server';
import { checkOllamaHealth, getOllamaConfigForWorkspace } from '@/lib/ai-config';
import { computeStatsFromCampaigns } from '@/lib/dashboard-store';
import { prisma } from '@/lib/prisma';
import { getWorkspaceContext } from '@/lib/workspace';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const refresh = searchParams.get('refresh') === 'true';

    // Check Ollama health
    const { workspace } = await getWorkspaceContext();
    const ollamaConfig = await getOllamaConfigForWorkspace(workspace.id, prisma);
    const health = await checkOllamaHealth(ollamaConfig.baseUrl);
    const campaigns = await prisma.campaign.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    });
    const { totalLeads, activeCampaigns, avgOpenRate, ctr } = computeStatsFromCampaigns(campaigns);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalGenerated: totalLeads,
          totalLeads: totalLeads,
          activeCampaigns: activeCampaigns,
          avgOpenRate: avgOpenRate,
          ctr: ctr,
        },
        campaigns: campaigns,
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
    const { workspace } = await getWorkspaceContext();

    switch (action) {
      case 'addCampaign':
        if (!campaign?.name || !campaign?.leads) {
          return NextResponse.json(
            { success: false, error: 'Campaign name and leads are required' },
            { status: 400 }
          );
        }
        const newCampaign = await prisma.campaign.create({
          data: {
            workspaceId: workspace.id,
            name: campaign.name,
            website: campaign.website || null,
            status: "DRAFT",
            leads: parseInt(campaign.leads) || 0,
            abEnabled: !!campaign.abEnabled,
            abVariantA: campaign.abVariantA || null,
            abVariantB: campaign.abVariantB || null,
          },
        });
        await prisma.campaignEvent.create({
          data: {
            campaignId: newCampaign.id,
            type: "GENERATED",
            meta: { count: parseInt(campaign.leads) || 0 },
          },
        });
        await prisma.activityLog.create({
          data: {
            workspaceId: workspace.id,
            action: "campaign.created",
            metadata: { campaignId: newCampaign.id, name: newCampaign.name },
          },
        });
        return NextResponse.json({ success: true, campaign: newCampaign });

      case 'updateStatus':
        if (!campaign?.id || !campaign?.status) {
          return NextResponse.json(
            { success: false, error: 'Campaign ID and status are required' },
            { status: 400 }
          );
        }
        const updated = await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: campaign.status },
        });
        if (campaign.status === "ACTIVE") {
          await prisma.campaignEvent.create({
            data: {
              campaignId: updated.id,
              type: "SENT",
              meta: { count: updated.leads || 0 },
            },
          });
        }
        await prisma.activityLog.create({
          data: {
            workspaceId: workspace.id,
            action: "campaign.status_updated",
            metadata: { campaignId: updated.id, status: updated.status },
          },
        });
        return NextResponse.json({ success: true, campaign: updated });

      case 'deleteCampaign':
        if (!campaign?.id) {
          return NextResponse.json(
            { success: false, error: 'Campaign ID is required' },
            { status: 400 }
          );
        }
        await prisma.campaign.delete({ where: { id: campaign.id } });
        await prisma.activityLog.create({
          data: {
            workspaceId: workspace.id,
            action: "campaign.deleted",
            metadata: { campaignId: campaign.id },
          },
        });
        return NextResponse.json({ success: true });

      case 'reset':
        await prisma.campaign.deleteMany({ where: { workspaceId: workspace.id } });
        await prisma.activityLog.create({
          data: {
            workspaceId: workspace.id,
            action: "campaign.reset",
          },
        });
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
