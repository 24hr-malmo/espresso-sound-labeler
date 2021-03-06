(function() {

    const socketUrl = '//' + window.location.hostname + (window.location.port.match(/(80|443)/) ? '' : ':' + window.location.port);
    const socket = io(socketUrl);

    const main = document.querySelector('.main');
    const loading = document.querySelector('.loading');
    const toggleButton = document.querySelector('[data-id="toggle-button"]');
    const predictions = document.querySelector('[data-id="predictions"]');

    let predictionLog = [];

    socket.on('connect', function() { 
        loading.classList.add('loading--loaded');
        main.classList.add('main--loaded');
        toggleButton.addEventListener('click', function() {
            socket.emit('toggle');
        });
    });

    function updateStates(data) {
        document.querySelector('[data-id="labeler-status"]').innerHTML = data.labeler.state;
        document.querySelector('[data-id="gatherer-status"]').innerHTML = data.gatherer.state;
        document.querySelector('[data-id="gatherer-count"]').innerHTML = '(' + data.gatherer.count + ')';
    }

    function showPredictions(payload) {
        predictionLog.unshift(payload);
        predictions.innerHTML = predictionLog
            .map(item => {
                
                let color = '#aaa';
                switch (item.label) {
                    case 1:
                        color = '#795548';
                        break;
                    case 2: 
                        color = '#9a3b19';
                        break;
                }
                return `
                    <div class="log-item">
                        <div class="log-item--date">${new Date(item.date).toTimeString().substr(0, 8)}</div>
                        <div class="log-item--prediction" style="color: ${color}">${item.humanReadableLabel}</div>
                    </div>
                `;
            })
            .join('');
        predictionLog = predictionLog.slice(0, 100);
    }

    function updateCounter(data) {
        document.querySelector('[data-id="gatherer-count"]').innerHTML = '(' + data.counter + ')';
    }

    socket.on('states.update', updateStates);
    socket.on('prediction.update', showPredictions);
    socket.on('gatherer.counter.update', updateCounter);

    socket.on('event', function(data){});
    socket.on('disconnect', function(){});

})();

