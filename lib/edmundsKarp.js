var edmondsKarp;

edmondsKarp = function(edges, capacity, s, t) {
  var M, flow, i, j, n, parent, queue, sum, u, v, x, _break, _i, _j, _len, _len1, _ref, _ref1;
  n = edges.length;
  flow = (function() {
    var _i, _results;
    _results = [];
    for (i = _i = 0; _i < n; i = _i += 1) {
      _results.push((function() {
        var _j, _results1;
        _results1 = [];
        for (j = _j = 0; _j < n; j = _j += 1) {
          _results1.push(0);
        }
        return _results1;
      })());
    }
    return _results;
  })();
  while (true) {
    parent = (function() {
      var _i, _results;
      _results = [];
      for (i = _i = 0; _i < n; i = _i += 1) {
        _results.push(-1);
      }
      return _results;
    })();
    parent[s] = s;
    M = (function() {
      var _i, _results;
      _results = [];
      for (i = _i = 0; _i < n; i = _i += 1) {
        _results.push(0);
      }
      return _results;
    })();
    M[s] = Infinity;
    queue = [s];
    _break = false;
    while (queue.length && !_break) {
      u = queue.pop();
      _ref = edges[u];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        if ((capacity[u][v] - flow[u][v] > 0) && parent[v] === -1) {
          parent[v] = u;
          M[v] = Math.min(M[u], capacity[u][v] - flow[u][v]);
          if (v !== t) {
            queue.push(v);
          } else {
            while (parent[v] !== v) {
              u = parent[v];
              flow[u][v] += M[t];
              flow[v][u] -= M[t];
              v = u;
            }
            _break = true;
            break;
          }
        }
      }
    }
    if (parent[t] === -1) {
      maxFlow = 0;
      _ref1 = flow[s];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        x = _ref1[_j];
        maxFlow += x;
      }
      return {
        maxFlow: maxFlow,
        flow: flow
      };
    }
  }
};
