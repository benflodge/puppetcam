/* global chrome, MediaRecorder, FileReader */

let recorder = null;
let filename = null;

chrome.runtime.onConnect.addListener(port => {

  const logMessage = function () {
    port.postMessage({
      type: 'LOG',
      msg: arguments
    }, '*')
  };

  const logError = function (error) {
    port.postMessage({
      type: 'ERROR',
      msg: error
    }, '*')
  };

  port.onMessage.addListener(msg => {
    logMessage(msg);
    switch (msg.type) {
      case 'SET_EXPORT_PATH':
        filename = msg.filename
        break
      case 'REC_STOP':
        recorder.stop()    
        break
      case 'REC_CLIENT_PLAY':
        if(recorder){
          return
        }
        const tab = port.sender.tab
        tab.url = msg.data.url
        chrome.desktopCapture.chooseDesktopMedia(['tab', 'audio'], streamId => {
          // Get the stream
          navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: streamId,
                minWidth: msg.data.width || 480,
                maxWidth: msg.data.width || 1920,
                minHeight: msg.data.height || 270,
                maxHeight: msg.data.height|| 1080,
                minFrameRate: 30,
              }
            }
          }).then(stream => {
            var chunks = [];
            var useh264 = MediaRecorder.isTypeSupported('video/webm\;codecs=h264');
            var type = useh264 ? 'video/webm\;codecs=h264' : 'video/webm';

            recorder = new MediaRecorder(stream, {
                videoBitsPerSecond: 72134880,
                ignoreMutedMedia: true,
                mimeType: type
            });

            recorder.ondataavailable = function (event) {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = function () {
                var superBuffer = new Blob(chunks, {
                    type: type
                });

                var url = URL.createObjectURL(superBuffer);
                // var a = document.createElement('a');
                // document.body.appendChild(a);
                // a.style = 'display: none';
                // a.href = url;
                // a.download = 'test.webm';
                // a.click();

              chrome.downloads.download({
                url: url,
                filename: filename
              }, () => {});
            }

            recorder.start();
          }, error => logError('Unable to get user media', error))
        })
        break
      default:
        logMessage('Unrecognized message', msg)
    }
  })

  chrome.downloads.onChanged.addListener(function(delta) {
    if (!delta.state ||(delta.state.current != 'complete')) {
      return;
    }
    try{
      port.postMessage({downloadComplete: true})
    }
    catch(e){}
  });

})
