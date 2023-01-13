import self from './selfThread';

// listen for messages
self.onmessage = message => {
  console.log('get message');
  // send a message, strings only
  self.postMessage('hello hahahah ehehehhe');
};
