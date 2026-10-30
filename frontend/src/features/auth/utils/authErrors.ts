/**
 * Human-friendly error translation for Supabase Auth errors
 */
export function formatAuthError(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';
  const msg = error.message || String(error);

  if (msg.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please verify your credentials and try again.';
  }
  if (msg.includes('User already registered')) {
    return 'An account with this email address already exists. Please log in.';
  }
  if (msg.includes('Password should be at least')) {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Please verify your email address before signing in. Check your inbox for the confirmation link.';
  }
  if (msg.includes('rate limit')) {
    return 'Too many login attempts. Please wait a moment and try again.';
  }
  return msg;
}

