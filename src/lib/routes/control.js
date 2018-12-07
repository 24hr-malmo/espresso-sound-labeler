const gatherer = require('../gatherer');
const labeler = require('../labeler');

module.exports = async (ctx, next) => {
    ctx.body = `
        <html>
            <script src="/socket.io/socket.io.js"></script>
            <script type="text/javascript"> 
var socket = io('http://localhost:9999');
  socket.on('connect', function(){ console.log('tjena') });
  socket.on('event', function(data){});
  socket.on('disconnect', function(){});
            </script>
            <body>
                <h2>Labler status: ${labeler.getState()}</h2>
                <h2>Gatherer status: ${gatherer.getState()}</h2>
            </body>
        </html>
    `;
    await next();
};
