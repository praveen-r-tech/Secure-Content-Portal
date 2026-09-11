import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

// Use the matching version of the PDF.js worker from a CDN.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

// Renders a single PDF page onto a canvas. Lives outside the component so both
// the initial load and the Prev/Next controls can reuse it without triggering
// the useEffect dependency warning.
function renderPageOnCanvas(canvas, pdf, page) {
  return pdf.getPage(page).then((pdfPage) => {
    const viewport = pdfPage.getViewport({ scale: 1.5 })
    canvas.height = viewport.height
    canvas.width = viewport.width
    return pdfPage.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
  })
}

function PdfViewer({ url }) {
  const canvasRef = useRef(null)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [error, setError] = useState(null)
  const pdfDocRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setError(null)
      try {
        // Fetch the signed URL as a blob so PDF.js can parse it without
        // worrying about CORS on Cloudinary's CDN.
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch PDF')
        const blob = await response.blob()
        const arrayBuffer = await blob.arrayBuffer()

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        if (cancelled) return

        pdfDocRef.current = pdf
        setNumPages(pdf.numPages)
        setPageNum(1)
        await renderPageOnCanvas(canvasRef.current, pdf, 1)
      } catch {
        if (!cancelled) setError('Unable to load PDF.')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [url])

  const goToPage = async (next) => {
    const pdf = pdfDocRef.current
    if (!pdf) return
    const clamped = Math.min(Math.max(pageNum + next, 1), numPages)
    if (clamped === pageNum) return
    setPageNum(clamped)
    await renderPageOnCanvas(canvasRef.current, pdf, clamped)
  }

  if (error) {
    return <p className="error-text">{error}</p>
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-canvas-wrap">
        <canvas ref={canvasRef} className="pdf-canvas" />
      </div>
      {numPages > 1 && (
        <div className="pdf-controls">
          <button
            type="button"
            className="btn-small"
            onClick={() => goToPage(-1)}
            disabled={pageNum <= 1}
          >
            Prev
          </button>
          <span className="pdf-page-info">
            Page {pageNum} of {numPages}
          </span>
          <button
            type="button"
            className="btn-small"
            onClick={() => goToPage(1)}
            disabled={pageNum >= numPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default PdfViewer