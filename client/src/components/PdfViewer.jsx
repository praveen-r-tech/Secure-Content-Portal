import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

// Use local bundled worker so PDF rendering is completely reliable and offline-ready.
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

// Renders a single PDF page onto canvas with dynamic security watermarking.
function renderPageOnCanvas(canvas, pdf, page, watermarkText, renderTaskRef) {
  if (!canvas || !pdf) return Promise.resolve()

  // Cancel previous render task if active on the canvas
  if (renderTaskRef?.current) {
    try {
      renderTaskRef.current.cancel()
    } catch {
      // Ignore cancellation exceptions
    }
  }

  return pdf.getPage(page).then((pdfPage) => {
    const viewport = pdfPage.getViewport({ scale: 1.5 })
    canvas.height = viewport.height
    canvas.width = viewport.width
    const ctx = canvas.getContext('2d')

    const renderTask = pdfPage.render({ canvasContext: ctx, viewport })
    if (renderTaskRef) {
      renderTaskRef.current = renderTask
    }

    return renderTask.promise
      .then(() => {
        if (renderTaskRef) renderTaskRef.current = null
        // Draw security watermark overlay
        if (watermarkText) {
          ctx.save()
          ctx.font = 'bold 20px system-ui, sans-serif'
          ctx.fillStyle = 'rgba(120, 120, 120, 0.18)'
          ctx.textAlign = 'center'
          ctx.translate(viewport.width / 2, viewport.height / 2)
          ctx.rotate(-0.4)
          ctx.fillText(watermarkText, 0, -40)
          ctx.fillText('CONFIDENTIAL • PROTECTED VIEW', 0, 0)
          ctx.fillText(new Date().toLocaleString(), 0, 40)
          ctx.restore()
        }
      })
      .catch((err) => {
        if (err?.name === 'RenderingCancelledException') {
          return
        }
        throw err
      })
  })
}

function PdfViewer({ url, watermarkText }) {
  const canvasRef = useRef(null)
  const renderTaskRef = useRef(null)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [error, setError] = useState(null)
  const pdfDocRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setError(null)
      try {
        // Fetch stream with credentials
        const response = await fetch(url, { credentials: 'include' })
        if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`)
        const blob = await response.blob()
        const arrayBuffer = await blob.arrayBuffer()

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        if (cancelled) return

        pdfDocRef.current = pdf
        setNumPages(pdf.numPages)
        setPageNum(1)
        await renderPageOnCanvas(canvasRef.current, pdf, 1, watermarkText, renderTaskRef)
      } catch (err) {
        console.error('PDF loading error:', err)
        if (!cancelled) setError('Unable to load PDF document.')
      }
    }

    load()
    return () => {
      cancelled = true
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel()
        } catch {
          // Ignore
        }
      }
    }
  }, [url, watermarkText])

  const goToPage = async (next) => {
    const pdf = pdfDocRef.current
    if (!pdf) return
    const clamped = Math.min(Math.max(pageNum + next, 1), numPages)
    if (clamped === pageNum) return
    setPageNum(clamped)
    try {
      await renderPageOnCanvas(canvasRef.current, pdf, clamped, watermarkText, renderTaskRef)
    } catch (err) {
      console.error('PDF page render error:', err)
    }
  }

  if (error) {
    return <p className="error-text">{error}</p>
  }

  return (
    <div className="pdf-viewer" onContextMenu={(e) => e.preventDefault()}>
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