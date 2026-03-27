export const RESERVED_USERNAMES = new Set<string>([
  // App routes
  'dashboard',
  'login',
  'signup',
  'logout',
  'register',
  'auth',
  'settings',
  'account',
  'profile',

  // API paths
  'api',
  'health',
  'analytics',
  'messages',
  'links',
  'admin',
  'superadmin',

  // Generic
  'about',
  'help',
  'support',
  'contact',
  'terms',
  'privacy',
  'blog',
  'home',
  'index',
  'www',
  'mail',
  'email',
  'root',
  'user',
  'users',
  'me',
  'my',
  'null',
  'undefined',
  'test',
  'demo',
  'example',
  'linkfolio',
  'staff',
  'moderator',
  'mod',
]);

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username.toLowerCase());
}
