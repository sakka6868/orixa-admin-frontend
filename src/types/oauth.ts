// OAuth 认证和授权相关常量定义

/**
 * 客户端认证方法
 */
export const CLIENT_AUTHENTICATION_METHODS = [
  { value: 'client_secret_basic', label: 'Client Secret Basic' },
  { value: 'client_secret_post', label: 'Client Secret Post' },
  { value: 'client_secret_jwt', label: 'Client Secret JWT' },
  { value: 'private_key_jwt', label: 'Private Key JWT' },
  { value: 'none', label: 'None' },
  { value: 'tls_client_auth', label: 'TLS Client Auth' },
  { value: 'self_signed_tls_client_auth', label: 'Self Signed TLS Client Auth' },
] as const;

/**
 * 授权类型
 */
export const AUTHORIZATION_GRANT_TYPES = [
  { value: 'authorization_code', label: 'Authorization Code' },
  { value: 'refresh_token', label: 'Refresh Token' },
  { value: 'client_credentials', label: 'Client Credentials' },
  { value: 'password', label: 'Password (Deprecated)' },
  { value: 'urn:ietf:params:oauth:grant-type:jwt-bearer', label: 'JWT Bearer' },
  { value: 'urn:ietf:params:oauth:grant-type:device_code', label: 'Device Code' },
  { value: 'urn:ietf:params:oauth:grant-type:token-exchange', label: 'Token Exchange' },
] as const;

/**
 * OAuth 2.0 作用域
 */
export const OAUTH_SCOPES = [
  { value: 'openid', label: 'OpenID' },
  { value: 'profile', label: 'Profile' },
  { value: 'email', label: 'Email' },
  { value: 'address', label: 'Address' },
  { value: 'phone', label: 'Phone' },
] as const;
