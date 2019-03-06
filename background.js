/* global chrome, MediaRecorder, FileReader */

let recorder = null;
let filename = null;
chrome.runtime.onConnect.addListener(port => {

  port.onMessage.addListener(msg => {
    console.log(msg);
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
                minWidth: 1280,
                maxWidth: 1280,
                minHeight: 720,
                maxHeight: 720,
                minFrameRate: 60,
              }
            }
          }).then(stream => {
            var chunks = [];
            var useh264 = MediaRecorder.isTypeSupported('video/webm\;codecs=h264');
            var type = useh264 ? 'video/webm\;codecs=h264' : 'video/webm';

            recorder = new MediaRecorder(stream, {
                videoBitsPerSecond: 2500000,
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
              }, ()=>{
              });
            }

            recorder.start();
          }, error => console.log('Unable to get user media', error))
        })
        break
      default:
        console.log('Unrecognized message', msg)
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
