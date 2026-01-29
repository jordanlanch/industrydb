import { redirect } from 'next/navigation';

export default function LocalePage() {
  // Redirect to dashboard or landing page
  redirect('/dashboard/leads');
}
