import { NextResponse } from 'next/server';
import { checkOllamaHealth, getOllamaConfig, getGoogleAIConfig } from '@/lib/ai-config';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const service = searchParams.get('service') || 'all';

    const ollamaConfig = getOllamaConfig();
    const googleConfig = getGoogleAIConfig();

    const response = {
      timestamp: new Date().toISOString(),
      services: {},
    };

    // Check Ollama
    if (service === 'all' || service === 'ollama') {
      const ollamaHealth = await checkOllamaHealth(ollamaConfig.baseUrl);
      response.services.ollama = {
        status: ollamaHealth.ok ? 'online' : 'offline',
        baseUrl: ollamaConfig.baseUrl,
        model: ollamaConfig.model,
        details: ollamaHealth.error || null,
      };
    }

    // Check Google AI
    if (service === 'all' || service === 'google') {
      response.services.google = {
        status: googleConfig.apiKey ? 'configured' : 'not_configured',
        model: googleConfig.model,
        hasApiKey: !!googleConfig.apiKey,
      };
    }

    // Overall system status
    response.system = {
      healthy: response.services.ollama?.status === 'online' || response.services.google?.status === 'configured',
      ready: true,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('Health check error:', err);
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        error: err.message,
        system: { healthy: false, ready: false }
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'test') {
      // Perform a quick test generation
      const ollamaConfig = getOllamaConfig();
      const health = await checkOllamaHealth(ollamaConfig.baseUrl);

      return NextResponse.json({
        success: health.ok,
        message: health.ok ? 'Ollama is responding correctly' : 'Ollama is not available',
        details: health,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (err) {
    console.error('Health action error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

