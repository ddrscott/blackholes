import Document, { Head, Main, NextScript } from "next/document";
import { ServerStyleSheet } from 'styled-components'

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: App => props => sheet.collectStyles(<App {...props} />),
        })

      const initialProps = await Document.getInitialProps(ctx)
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      }
    } finally {
      sheet.seal()
    }
  }
  render() {
    return (
      <html>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
          <meta charSet="utf-8" />
          <link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon" />
          <script async src="https://www.googletagmanager.com/gtag/js?id=UA-50126719-6"></script>
          <script dangerouslySetInnerHTML={{__html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments)}
            gtag('js', new Date());
            gtag('config', 'UA-50126719-6');
          `}} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
        <style jsx global>{`
          *, *::before, *::after { box-sizing: border-box }
          html, body {
            font-family: "Lucida Console", Monaco, monospace;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background: #33404a;
            color: #eee;
          }
          small {
            font-size: .6em;
          }
        `}</style>
      </html>
    );
  }
}
