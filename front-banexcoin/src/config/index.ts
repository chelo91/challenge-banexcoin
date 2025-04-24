const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
    endpoints: {
      balance: '/accounts/balance',
      transactions: '/transactions',
      commissions: '/commissions',
      users: '/users',
      referrals: '/users/referrals',
      // Agrega más endpoints aquí según sea necesario
    }
  }
};

export const getApiUrl = (endpoint: keyof typeof config.api.endpoints) => {
  return `${config.api.baseUrl}${config.api.endpoints[endpoint]}`;
};

export default config; 