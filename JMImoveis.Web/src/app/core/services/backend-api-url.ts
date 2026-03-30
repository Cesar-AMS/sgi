import { environment } from 'src/environments/environment';

const configuredUrl = environment.backendApiUrl || 'https://jmapi.ensuo.com.br/';

export const BACKEND_API_URL = configuredUrl.endsWith('/')
  ? configuredUrl
  : `${configuredUrl}/`;
