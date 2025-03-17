/**
 * @param {import("next/app").AppProps} props - The properties passed to the custom App component.
 * @param {React.Component} props.Component - The active page component.
 * @param {Object} props.pageProps - The initial props that were preloaded for the page.
 * @returns {JSX.Element} The custom App component.
 */
import Head from 'next/head';
import '@/styles/globals.css';

/**
 * @param {import("next/app").AppProps} props
 */
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>AIrCrawl</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;