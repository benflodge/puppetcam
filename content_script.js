window.onload = () => {
  if (window.recorderInjected) return
  Object.defineProperty(window, 'recorderInjected', { value: true, writable: false })

  // Setup message passing
  const port = chrome.runtime.connect(chrome.runtime.id)
  port.onMessage.addListener(msg => window.postMessage(msg, '*'))
  window.addEventListener('message', event => {
    
    // Relay client messages
    if (event.source === window && event.data.type && 
      event.data.type !== 'LOG' && event.data.type !== 'ERROR') {
      port.postMessage(event.data)
    }

    if(event.data.type === 'PLAYBACK_COMPLETE'){
      port.postMessage({ type: 'REC_STOP' }, '*')
    }
    
    if(event.data.type === 'ERROR'){
      throw new Error(event.data.msg)
    }

    if(event.data.type === 'LOG'){
      console.log(JSON.stringify(event.data.msg))
    }

    if(event.data.downloadComplete){
      document.querySelector('html').classList.add('downloadComplete')
    }
  })

  document.title = 'puppetcam'
  console.log('Script loaded')
}
