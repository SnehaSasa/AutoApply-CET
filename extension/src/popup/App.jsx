// import React, { useState, useEffect } from 'react'

// export default function App() {
//   const [status, setStatus] = useState('idle')
//   const [kbPreview, setKbPreview] = useState({})

//   useEffect(() => {
//     chrome.storage.local.get(['knowledgeBase'], (res) => {
//       setKbPreview(res.knowledgeBase || {})
//     })
//   }, [])

//   const startAutofill = () => {
//     setStatus('sending')
//     chrome.runtime.sendMessage({ type: 'POPUP_START_AUTOFILL' }, (resp) => {
//       setStatus('done')
//       console.log('autofill response', resp)
//       // fetch updated KB
//       chrome.storage.local.get(['knowledgeBase'], (res) => {
//         setKbPreview(res.knowledgeBase || {})
//       })
//     })
//   }

//   const clearKB = () => {
//     chrome.storage.local.set({ knowledgeBase: {} }, () => {
//       setKbPreview({})
//     })
//   }

//   return (
//     <div style={{ fontFamily: 'system-ui, Arial', padding: 12, width: 320 }}>
//       <h2>AutoApply</h2>
//       <p>Start autofill for the active tab (make sure you're signed in).</p>
//       <button onClick={startAutofill} style={{ padding: '8px 12px' }}>
//         Start Autofill
//       </button>
      
//       <div style={{ marginTop: 12 }}>
//         <strong>Status:</strong> {status}
//       </div>

//       <hr />

//       <div>
//         <strong>Knowledge Base (preview)</strong>
//         <pre style={{ maxHeight: 160, overflow: 'auto', background: '#f4f4f5', padding: 8 }}>
//           {JSON.stringify(kbPreview, null, 2)}
//         </pre>
//         <button onClick={clearKB}>Clear KB</button>
//       </div>
//     </div>
//   )
// }



import React, { useState, useEffect } from 'react'

export default function App() {
  const [status, setStatus] = useState('idle')
  const [kbPreview, setKbPreview] = useState({})

  useEffect(() => {
    chrome.storage.local.get(['knowledgeBase'], (res) => {
      setKbPreview(res.knowledgeBase || {})
    })
  }, [])

  const startAutofill = () => {
    setStatus('sending')
    chrome.runtime.sendMessage({ type: 'POPUP_START_AUTOFILL' }, (resp) => {
      setStatus('done')
      console.log('autofill response', resp)

      chrome.storage.local.get(['knowledgeBase'], (res) => {
        setKbPreview(res.knowledgeBase || {})
      })
    })
  }

  const clearKB = () => {
    chrome.storage.local.set({ knowledgeBase: {} }, () => {
      setKbPreview({})
    })
  }

  // 🚀 NEW — Preview Resume function
  const openResumePreview = async () => {
    const res = await chrome.storage.local.get(['knowledgeBase'])
    const kb = res.knowledgeBase || {}

    const base64 = kb.resume_pdf_base64
    if (!base64) {
      alert("No resume PDF found in knowledge base.")
      return
    }

    const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
    const blob = new Blob([byteArray], { type: "application/pdf" })
    const blobUrl = URL.createObjectURL(blob)

    // Open extension page and pass blob URL
    chrome.tabs.create({
      url: chrome.runtime.getURL(`preview.html?url=${encodeURIComponent(blobUrl)}`)
    })
  }

  return (
    <div style={{ fontFamily: 'system-ui, Arial', padding: 12, width: 320 }}>
      <h2>AutoApply</h2>
      <p>Start autofill for the active tab (make sure you're signed in).</p>

      <button onClick={startAutofill} style={{ padding: '8px 12px' }}>
        Start Autofill
      </button>

      <div style={{ marginTop: 12 }}>
        <strong>Status:</strong> {status}
      </div>

      <hr />

      {/* 🚀 NEW — Preview Resume Button */}
      <button 
        onClick={openResumePreview} 
        style={{ padding: '8px 12px', marginBottom: 10 }}
      >
        Preview Resume
      </button>

      <div>
        <strong>Knowledge Base (preview)</strong>
        <pre style={{ maxHeight: 160, overflow: 'auto', background: '#f4f4f5', padding: 8 }}>
          {JSON.stringify(kbPreview, null, 2)}
        </pre>
        <button onClick={clearKB}>Clear KB</button>
      </div>
    </div>
  )
}
