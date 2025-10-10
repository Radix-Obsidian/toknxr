// Simple vanilla JavaScript dashboard for browser compatibility
// This creates a pure HTML/CSS/JS dashboard that works without React

interface ProviderData {
  cost: number;
  interactions: number;
  avgQuality?: number;
  avgEffectiveness?: number;
  costUSD?: number;
  requestCount?: number;
}

interface Interaction {
  provider: string;
  model: string;
  qualityScore?: number;
  effectivenessScore?: number;
  userPrompt: string;
  aiResponse: string;
  timestamp: string;
  taskType?: string;
  cost: number;
  hallucination?: boolean;
}

function createDashboard() {
  const COLORS = {
    primary: '#6B5BED',
    secondary: '#9B5BED',
    accent: '#ED5B9B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textMuted: '#94A3B8'
  };

  let lastUpdated = new Date();

  // Create provider card HTML
  function createProviderChart(name: string, data: ProviderData) {
    return `
      <div style="background: ${COLORS.surface}; border-radius: 8px; padding: 16px; border: 1px solid ${COLORS.primary}20;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="margin: 0; color: ${COLORS.text}; font-size: 16px;">${name}</h3>
          <div style="font-size: 12px; color: ${COLORS.textMuted};">${(data.cost || 0).toFixed(2)}</div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
          <div style="color: ${COLORS.textMuted};">Interactions: <span style="color: ${COLORS.text};">${data.interactions || 0}</span></div>
          ${data.avgQuality ? `<div style="color: ${COLORS.textMuted};">Quality: <span style="color: ${COLORS.accent};">${data.avgQuality}/100</span></div>` : ''}
          ${data.avgEffectiveness ? `<div style="color: ${COLORS.textMuted};">Effectiveness: <span style="color: ${COLORS.secondary};">${data.avgEffectiveness}/100</span></div>` : ''}
        </div>
      </div>
    `;
  }

  // Create recent activity HTML with prompt previews
  function createRecentActivity(interactions: Interaction[]) {
    const recentHTML = interactions.slice(-10).map((interaction: any, i: number) => {
      const qualityColor = !interaction.qualityScore ? COLORS.textMuted :
        interaction.qualityScore >= 90 ? COLORS.success :
        interaction.qualityScore >= 70 ? COLORS.warning : COLORS.error;

      const effectivenessColor = !interaction.effectivenessScore ? COLORS.textMuted :
        interaction.effectivenessScore >= 90 ? COLORS.success :
        interaction.effectivenessScore >= 70 ? COLORS.warning : COLORS.error;

      const promptPreview = interaction.userPrompt ?
        (interaction.userPrompt.length > 60 ?
          interaction.userPrompt.substring(0, 60) + '...' :
          interaction.userPrompt) : 'No prompt captured';

      return `
        <div style="padding: 16px 0; border-bottom: ${i < interactions.length - 1 ? `1px solid ${COLORS.primary}10` : 'none'}; cursor: pointer; transition: background-color 0.2s;"
             onmouseover="this.style.background='${COLORS.primary}08'"
             onmouseout="this.style.background='transparent'"
             onclick="showPromptDetails('${interaction.provider}', '${interaction.model}', \`${(interaction.userPrompt || 'N/A').replace(/\\/g, '\\\\').replace(/'/g, "\\'")}\`, \`${(interaction.aiResponse || 'N/A').substring(0, 300).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}\`, ${interaction.qualityScore || 0}, ${interaction.effectivenessScore || 0}, '${interaction.taskType || 'unknown'}', ${interaction.cost || 0})">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="flex: 1;">
              <div style="color: ${COLORS.text}; font-size: 14px; font-weight: 500; margin-bottom: 4px;">
                ${interaction.provider} • ${interaction.model}
              </div>
              <div style="color: ${COLORS.textMuted}; font-size: 12px; margin-bottom: 6px;">
                ${new Date(interaction.timestamp).toLocaleTimeString()}
                ${interaction.taskType ? ` • <span style="color: ${COLORS.accent};">${interaction.taskType}</span>` : ''}
              </div>
              <div style="color: ${COLORS.textMuted}; font-size: 11px; font-style: italic; line-height: 1.3; margin-bottom: 8px;">
                💬 ${promptPreview}
              </div>
            </div>
            <div style="text-align: right; margin-left: 16px;">
              <div style="color: ${COLORS.success}; font-size: 14px; font-weight: 500; margin-bottom: 4px;">
                ${interaction.cost.toFixed(4)}
              </div>
              <div style="display: flex; gap: 8px; font-size: 12px;">
                ${interaction.qualityScore ? `<span style="color: ${qualityColor};">Q:${interaction.qualityScore}</span>` : ''}
                ${interaction.effectivenessScore ? `<span style="color: ${effectivenessColor};">E:${interaction.effectivenessScore}</span>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div style="background: ${COLORS.surface}; border-radius: 12px; padding: 24px; border: 1px solid ${COLORS.primary}20;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h2 style="margin: 0; color: ${COLORS.text};">Recent Activity</h2>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="prompt-search" placeholder="Search prompts..." style="background: ${COLORS.background}; border: 1px solid ${COLORS.primary}20; color: ${COLORS.text}; padding: 4px 8px; border-radius: 4px; font-size: 12px;" onkeyup="filterPrompts()">
            <select id="provider-filter" style="background: ${COLORS.background}; border: 1px solid ${COLORS.primary}20; color: ${COLORS.text}; padding: 4px 8px; border-radius: 4px; font-size: 12px;" onchange="filterPrompts()">
              <option value="">All Providers</option>
              <option value="Gemini-Pro">Gemini-Pro</option>
              <option value="OpenAI-GPT4">OpenAI-GPT4</option>
              <option value="Anthropic-Claude">Anthropic-Claude</option>
              <option value="Ollama-Llama3">Ollama-Llama3</option>
            </select>
          </div>
        </div>
        <div id="activity-list" style="max-height: 400px; overflow-y: auto;">
          ${recentHTML}
        </div>
      </div>
    `;
  }

  // Fetch and update stats
  async function fetchStats() {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();

      // Transform the data for display
      const totalCost = data.totals.total || 0;
      const totalInteractions = data.totals.requestCount || 0;
      const avgCostPerTask = totalInteractions ? (totalCost / totalInteractions) : 0;

      // Update stats cards
      document.getElementById('total-cost')!.innerHTML = `${totalCost.toFixed(4)}`;
      document.getElementById('total-interactions')!.innerHTML = totalInteractions.toString();
      document.getElementById('avg-cost')!.innerHTML = `${avgCostPerTask.toFixed(4)}`;
      document.getElementById('waste-rate')!.innerHTML = '0.0%';

      // Update provider cards
      const providerContainer = document.getElementById('provider-container');
      if (providerContainer && data.totals.byProvider) {
        const providerHTML = Object.entries(data.totals.byProvider).map(([name, providerData]: [string, any]) =>
          createProviderChart(name, {
            cost: (providerData as any).costUSD || 0,
            interactions: (providerData as any).requestCount || 0,
            avgQuality: (providerData as any).avgQuality,
            avgEffectiveness: (providerData as any).avgEffectiveness
          })
        ).join('');
        providerContainer.innerHTML = providerHTML;
      }

      // Update recent activity
      const activityContainer = document.getElementById('recent-activity');
      if (activityContainer) {
        activityContainer.innerHTML = createRecentActivity(data.recentInteractions || []);
      }

      // Update timestamp
      lastUpdated = new Date();
      document.getElementById('last-updated')!.textContent = lastUpdated.toLocaleTimeString();

    } catch (error) {
      console.error('Dashboard error:', error);
      document.getElementById('error-message')!.textContent = (error as Error).message;
      document.getElementById('error-container')!.style.display = 'block';
    }
  }

  // Create the complete dashboard HTML
  const dashboardHTML = `
    <div style="background: ${COLORS.background}; min-height: 100vh; color: ${COLORS.text}; font-family: system-ui, -apple-system, sans-serif;">
      <!-- Header -->
      <header style="background: ${COLORS.surface}; border-bottom: 1px solid ${COLORS.primary}20; padding: 16px 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
          <div>
            <h1 style="margin: 0; font-size: 24px; color: ${COLORS.text};">🚀 TokNXR Dashboard</h1>
            <p style="color: ${COLORS.textMuted}; margin: 4px 0 0 0; font-size: 14px;">
              Real-time AI Effectiveness & Code Quality Analytics
            </p>
          </div>
          <div style="text-align: right;">
            <div id="last-updated" style="color: ${COLORS.textMuted}; font-size: 12px;">
              Last updated: ${lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onclick="fetchStats()"
              style="background: ${COLORS.primary}; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-top: 4px;"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <!-- Error Message -->
      <div id="error-container" style="display: none; background: ${COLORS.error}; color: white; padding: 12px 16px; margin: 16px; border-radius: 8px;">
        Error: <span id="error-message"></span>
      </div>

      <!-- Main Content -->
      <main style="padding: 24px; max-width: 1200px; margin: 0 auto;">
        <!-- Stats Overview -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-bottom: 32px;">
          <div style="background: ${COLORS.surface}; border-radius: 12px; padding: 24px; border: 1px solid ${COLORS.success}20;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <p style="color: ${COLORS.textMuted}; font-size: 14px; margin: 0 0 8px 0;">Total Cost</p>
                <p id="total-cost" style="font-size: 32px; font-weight: bold; margin: 0; color: ${COLORS.text};">$0.0000</p>
              </div>
              <div style="font-size: 24px; color: ${COLORS.success}; opacity: 0.8;">💰</div>
            </div>
          </div>

          <div style="background: ${COLORS.surface}; border-radius: 12px; padding: 24px; border: 1px solid ${COLORS.primary}20;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <p style="color: ${COLORS.textMuted}; font-size: 14px; margin: 0 0 8px 0;">Total Interactions</p>
                <p id="total-interactions" style="font-size: 32px; font-weight: bold; margin: 0; color: ${COLORS.text};">0</p>
              </div>
              <div style="font-size: 24px; color: ${COLORS.primary}; opacity: 0.8;">📊</div>
            </div>
          </div>

          <div style="background: ${COLORS.surface}; border-radius: 12px; padding: 24px; border: 1px solid ${COLORS.secondary}20;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <p style="color: ${COLORS.textMuted}; font-size: 14px; margin: 0 0 8px 0;">Avg Cost per Task</p>
                <p id="avg-cost" style="font-size: 32px; font-weight: bold; margin: 0; color: ${COLORS.text};">$0.0000</p>
              </div>
              <div style="font-size: 24px; color: ${COLORS.secondary}; opacity: 0.8;">🎯</div>
            </div>
          </div>

          <div style="background: ${COLORS.surface}; border-radius: 12px; padding: 24px; border: 1px solid ${COLORS.warning}20;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <p style="color: ${COLORS.textMuted}; font-size: 14px; margin: 0 0 8px 0;">Waste Rate</p>
                <p id="waste-rate" style="font-size: 32px; font-weight: bold; margin: 0; color: ${COLORS.text};">0.0%</p>
              </div>
              <div style="font-size: 24px; color: ${COLORS.warning}; opacity: 0.8;">⚠️</div>
            </div>
          </div>
        </div>

        <!-- Provider Breakdown -->
        <div id="provider-section" style="margin-bottom: 32px;">
          <h2 style="color: ${COLORS.text}; margin: 0 0 16px 0;">Provider Breakdown</h2>
          <div id="provider-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
            <!-- Provider cards will be inserted here -->
          </div>
        </div>

        <!-- Recent Activity -->
        <div id="recent-activity">
          <!-- Recent activity will be inserted here -->
        </div>
      </main>

      <!-- Footer -->
      <footer style="background: ${COLORS.surface}; border-top: 1px solid ${COLORS.primary}20; padding: 16px 24px; text-align: center; color: ${COLORS.textMuted}; font-size: 12px;">
        <div style="max-width: 1200px; margin: 0 auto;">
          TokNXR Dashboard • Real-time AI Analytics • ${new Date().getFullYear()}
          <br>
          <span style="color: #FFD700; font-size: 11px; margin-top: 4px; display: block;">
            🐑 Powered by Golden Sheep AI
          </span>
        </div>
      </footer>
    </div>
  `;

  // Set the dashboard content
  const container = document.getElementById('dashboard-root');
  if (container) {
    container.innerHTML = dashboardHTML;

    // Start fetching stats
    fetchStats();

    // Auto-refresh every 5 seconds
    setInterval(fetchStats, 5000);
  }
}

// Modal for showing prompt details
// @ts-ignore
  function showPromptDetails(provider: string, model: string, userPrompt: string, aiResponse: string, qualityScore: number, effectivenessScore: number, taskType: string, cost: number) {
  const modal = document.createElement('div');
  modal.id = 'prompt-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    box-sizing: border-box;
  `;

  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: #1E293B;
    border-radius: 12px;
    padding: 24px;
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    color: #F8FAFC;
    border: 1px solid #6B5BED20;
  `;

  modalContent.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h3 style="margin: 0; color: #F8FAFC;">Interaction Details</h3>
      <button onclick="closePromptModal()" style="background: #6B5BED; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer;">✕ Close</button>
    </div>

    <div style="margin-bottom: 16px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px;">
        <div>
          <strong>Provider:</strong> ${provider}<br>
          <strong>Model:</strong> ${model}<br>
          <strong>Task Type:</strong> ${taskType}<br>
          <strong>Cost:</strong> $${cost.toFixed(4)}
        </div>
        <div>
          <strong>Quality Score:</strong> ${qualityScore}/100<br>
          <strong>Effectiveness:</strong> ${effectivenessScore}/100<br>
          <strong>Status:</strong> ${qualityScore >= 90 ? '🟢 Excellent' : qualityScore >= 70 ? '🟡 Good' : '🔴 Needs Improvement'}
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #F8FAFC;">📝 User Prompt:</h4>
        <div style="background: #0F172A; padding: 12px; border-radius: 6px; border: 1px solid #6B5BED20; font-family: monospace; white-space: pre-wrap;">${userPrompt}</div>
      </div>

      <div>
        <h4 style="margin: 0 0 8px 0; color: #F8FAFC;">🤖 AI Response:</h4>
        <div style="background: #0F172A; padding: 12px; border-radius: 6px; border: 1px solid #6B5BED20; font-family: monospace; white-space: pre-wrap; max-height: 200px; overflow-y: auto;">${aiResponse}${aiResponse.length > 300 ? '...' : ''}</div>
      </div>
    </div>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Close modal on outside click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closePromptModal();
    }
  });
}

function closePromptModal() {
  const modal = document.getElementById('prompt-modal');
  if (modal) {
    modal.remove();
  }
}

// Filter prompts based on search and provider filter
// @ts-ignore
function filterPrompts() {
  const searchTermValue = (document.getElementById('prompt-search') as HTMLInputElement)?.value.toLowerCase() || '';
  const providerFilterValue = (document.getElementById('provider-filter') as HTMLSelectElement)?.value || '';
  const activityItems = document.querySelectorAll('#activity-list > div');

  activityItems.forEach(item => {
    const text = item.textContent?.toLowerCase() || '';
    const provider = item.textContent?.split(' • ')[0] || '';

    const shouldShow = text.includes(searchTermValue) && 
                      (providerFilterValue === '' || text.includes(providerFilterValue.toLowerCase()));
    (item as HTMLElement).style.display = shouldShow ? 'block' : 'none';
  });
}

// Initialize dashboard when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createDashboard);
} else {
  createDashboard();
}
