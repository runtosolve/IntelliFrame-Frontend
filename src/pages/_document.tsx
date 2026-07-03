import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs'

export default function MyDocument() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

// Inline antd cssinjs styles on the server so components render styled on first paint
MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const cache = createCache()
  const originalRenderPage = ctx.renderPage
  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => function EnhancedApp(props) {
        return (
          <StyleProvider cache={cache}>
            <App {...props} />
          </StyleProvider>
        )
      },
    })

  const initialProps = await Document.getInitialProps(ctx)
  const style = extractStyle(cache, true)
  return {
    ...initialProps,
    styles: (
      <>
        {initialProps.styles}
        <style dangerouslySetInnerHTML={{ __html: style }} />
      </>
    ),
  }
}
