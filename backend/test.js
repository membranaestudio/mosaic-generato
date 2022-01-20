const EventEmitter = require('events')

const emitter = new EventEmitter()

emitter.once('newListener', (event, listener) => {
    if (event === 'event') {
        // Insert a new listener in front
        emitter.on('event', () => {
            console.log('B');
        });
    }
});

emitter.addListener('event', function() {
    console.log('Relax')
})

emitter.emit('event')