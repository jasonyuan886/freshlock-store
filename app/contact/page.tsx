import type { Metadata } from 'next';
import ContactPage from './_client';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with FreshLock support. We respond to all inquiries within 24 hours. Email us at support@freshlocksealer.com.',
  alternates: { canonical: '/contact' },
};

export default function Page() {
  return <ContactPage />;
}
