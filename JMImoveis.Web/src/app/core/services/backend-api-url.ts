import { environment } from 'src/environments/environment';

const rawUrl = environment.backendApiUrl || '/api/';
const configuredUrl = rawUrl.replace(/\/+$/, '');
const normalizedUrl = configuredUrl.endsWith('/api') ? configuredUrl.slice(0, -4) : configuredUrl;

export const BACKEND_API_URL = `${normalizedUrl}/`;
