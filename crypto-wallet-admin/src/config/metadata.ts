export const siteConfig = {
  name: 'Crypto Wallet',
  description: 'Gerenciador de carteira crypto com WhatsApp',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://crypto-wallet.com',
  ogImage: '/images/og.png',
  links: {
    twitter: 'https://twitter.com/cryptowallet',
    github: 'https://github.com/cryptowallet',
  },
  icons: {
    logo: '/images/logo.png',
    logoWhite: '/images/logo-white.png',
    favicon: '/favicon.ico',
  },
};