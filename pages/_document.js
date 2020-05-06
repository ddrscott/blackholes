import Document, { Head, Main, NextScript } from "next/document";
import { ServerStyleSheet } from 'styled-components'
import React from 'react';

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
                    <title>B.Holes</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                    <meta name="mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-capable" content="yes" />
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
                    <div id="phaser"></div>
                    <Main />
                    <NextScript />
                </body>
            </html>
        );
    }
}
