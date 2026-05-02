const BASE_URL = 'http://localhost:8000/api';

async function fetcher(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'API request failed');
  }

  return response.json();
}

export const apiService = {
  // Dashboard
  getDashboard: () => fetcher('/dashboard'),

  // Patient Experience
  getPatientExperience: () => fetcher('/patient-experience'),

  // Resources
  getResources: () => fetcher('/resources'),

  // Cost & Insurance
  getCostInsurance: () => fetcher('/cost-insurance'),

  // AI Recommendation
  getAIRecommendation: (context: string, data: any = {}) =>
    fetcher('/ai/recommend', {
      method: 'POST',
      body: JSON.stringify({ context, data }),
    }),

  // AI Health Check
  getAIHealth: () => fetcher('/ai/health'),

  // Backend Health Check
  getHealth: () => fetcher('/health'),
};
