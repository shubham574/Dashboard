import { ClerkProvider } from '@clerk/nextjs';
import Layout from '../components/Layout';
import '../app/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
    <Component {...pageProps} />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ClerkProvider>
  );
}

export default MyApp;