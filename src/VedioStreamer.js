import React, { useRef, useEffect, useState } from 'react';

const VideoStreamer = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [webSocket, setWebSocket] = useState(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    // WebSocket setup
    const ws = new WebSocket('ws://localhost:5000');
    setWebSocket(ws);

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ type: 'store_user', username: 'user1' }));
    };

    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);

      switch (data.type) {
        case 'offer':
          handleOffer(data.offer);
          break;
        case 'answer':
          handleAnswer(data.answer);
          break;
        case 'candidate':
          handleCandidate(data.candidate);
          break;
        default:
          break;
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    // Clean up WebSocket on unmount
    return () => ws.close();
  }, []);

  useEffect(() => {
    // Get user media (local video stream)
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localVideoRef.current.srcObject = stream;

        // Create WebRTC peer connection
        peerConnection.current = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        // Add local stream tracks to peer connection
        stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

        // ICE candidate event handler
        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            webSocket.send(JSON.stringify({ type: 'store_candidate', candidate: event.candidate }));
          }
        };

        // Handle remote stream
        peerConnection.current.ontrack = (event) => {
          remoteVideoRef.current.srcObject = event.streams[0];
        };
      });
  }, [webSocket]);

  const handleOffer = (offer) => {
    peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer))
      .then(() => peerConnection.current.createAnswer())
      .then(answer => {
        peerConnection.current.setLocalDescription(answer);
        webSocket.send(JSON.stringify({ type: 'send_answer', answer }));
      });
  };

  const handleAnswer = (answer) => {
    peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleCandidate = (candidate) => {
    peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const initiateCall = () => {
    // Check if peerConnection is initialized
    if (!peerConnection.current) {
      peerConnection.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },  // You can add more STUN/TURN servers as needed
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
  
      // Optional: Handle ICE candidates
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          webSocket.send(JSON.stringify({ type: 'send_candidate', candidate: event.candidate }));
        }
      };
    }
  
    // Create the offer
    peerConnection.current.createOffer()
      .then(offer => {
        return peerConnection.current.setLocalDescription(offer);
      })
      .then(() => {
        // Send the offer to the signaling server
        webSocket.send(JSON.stringify({ type: 'store_offer', offer: peerConnection.current.localDescription }));
      })
      .catch(error => {
        console.error('Error creating offer:', error);
      });
  };
  

  return (
    <div>
      <h2>Live Video Streaming</h2>
      <div>
        <h3>Local Stream</h3>
        <video ref={localVideoRef} autoPlay muted style={{ width: '300px' }} />
      </div>
      <div>
        <h3>Remote Stream</h3>
        <video ref={remoteVideoRef} autoPlay style={{ width: '300px' }} />
      </div>
      <button onClick={initiateCall}>Start Call</button>
    </div>
  );
};

export default VideoStreamer;
