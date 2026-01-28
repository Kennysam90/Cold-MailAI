import { NextResponse } from 'next/server';

// Simulated integrations database
const integrations = {
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: 'message-square',
    color: '#22c55e',
    status: 'disconnected',
    connectedAt: null,
    config: {
      phoneNumber: null,
      businessAccountId: null,
    }
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram',
    icon: 'send',
    color: '#3b82f6',
    status: 'disconnected',
    connectedAt: null,
    config: {
      botToken: null,
      chatId: null,
    }
  },
  webwidget: {
    id: 'webwidget',
    name: 'Web Widget',
    icon: 'globe',
    color: '#6366f1',
    status: 'disconnected',
    connectedAt: null,
    config: {
      widgetId: null,
      embedCode: null,
    }
  }
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const integrationId = searchParams.get('id');

    if (integrationId) {
      const integration = integrations[integrationId];
      if (!integration) {
        return NextResponse.json(
          { success: false, error: 'Integration not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        integration: {
          ...integration,
          config: {
            // Don't expose sensitive config
            hasPhoneNumber: !!integration.config.phoneNumber,
            hasBotToken: !!integration.config.botToken,
            hasWidgetId: !!integration.config.widgetId,
          }
        }
      });
    }

    // Return all integrations
    return NextResponse.json({
      success: true,
      integrations: Object.values(integrations).map(i => ({
        ...i,
        config: {
          hasPhoneNumber: !!i.config.phoneNumber,
          hasBotToken: !!i.config.botToken,
          hasWidgetId: !!i.config.widgetId,
        }
      }))
    });
  } catch (err) {
    console.error('Integrations fetch error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, integration, config } = body;

    switch (action) {
      case 'connect':
        if (!integration || !integrations[integration]) {
          return NextResponse.json(
            { success: false, error: 'Invalid integration ID' },
            { status: 400 }
          );
        }

        // Simulate connection process
        const now = new Date().toISOString();
        integrations[integration].status = 'connected';
        integrations[integration].connectedAt = now;
        
        if (config) {
          integrations[integration].config = {
            ...integrations[integration].config,
            ...config,
          };
        }

        return NextResponse.json({
          success: true,
          message: `${integrations[integration].name} connected successfully`,
          integration: integrations[integration]
        });

      case 'disconnect':
        if (!integration || !integrations[integration]) {
          return NextResponse.json(
            { success: false, error: 'Invalid integration ID' },
            { status: 400 }
          );
        }

        integrations[integration].status = 'disconnected';
        integrations[integration].connectedAt = null;
        integrations[integration].config = {
          phoneNumber: null,
          businessAccountId: null,
          botToken: null,
          chatId: null,
          widgetId: null,
          embedCode: null,
        };

        return NextResponse.json({
          success: true,
          message: `${integrations[integration].name} disconnected`
        });

      case 'test':
        if (!integration || !integrations[integration]) {
          return NextResponse.json(
            { success: false, error: 'Invalid integration ID' },
            { status: 400 }
          );
        }

        if (integrations[integration].status !== 'connected') {
          return NextResponse.json(
            { success: false, error: 'Integration not connected' },
            { status: 400 }
          );
        }

        // Simulate test message
        return NextResponse.json({
          success: true,
          message: `Test message sent via ${integrations[integration].name}`,
          timestamp: new Date().toISOString()
        });

      case 'getEmbedCode':
        if (!integration || integration !== 'webwidget') {
          return NextResponse.json(
            { success: false, error: 'Invalid integration for embed code' },
            { status: 400 }
          );
        }

        const embedCode = `<script src="https://cold-mail-ai.widget.js"></script>
<script>
  ColdMailAI.init({
    apiKey: 'your-api-key',
    containerId: 'cold-mail-widget'
  });
</script>`;

        return NextResponse.json({
          success: true,
          embedCode,
          instructions: 'Add this code to your website just before the closing </body> tag'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error('Integrations action error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

