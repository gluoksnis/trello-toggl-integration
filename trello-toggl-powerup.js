/* global TrelloPowerUp */

// Toggl Track API configuration
var TOGGL_API_URL = 'https://api.track.toggl.com/api/v9';

// CORS Proxy - Use this to bypass CORS restrictions
// Option 1: Use CORS Anywhere (public, may be rate limited)
var CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
// Option 2: Deploy your own proxy (recommended for production)
// See PROXY_SETUP.md for instructions

// Helper function to make API calls through proxy
function makeTogglRequest(endpoint, options, apiToken) {
  var url = CORS_PROXY + TOGGL_API_URL + endpoint;
  
  var headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa(apiToken + ':api_token')
  };
  
  // Merge with any additional headers
  if (options.headers) {
    for (var key in options.headers) {
      headers[key] = options.headers[key];
    }
  }
  
  var fetchOptions = {
    method: options.method || 'GET',
    headers: headers
  };
  
  if (options.body) {
    fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }
  
  return fetch(url, fetchOptions);
}

// Initialize the Power-Up
TrelloPowerUp.initialize({
  'card-buttons': function(t, options) {
    return t.get('board', 'shared', 'togglApiToken')
      .then(function(apiToken) {
        if (!apiToken) {
          return [{
            icon: 'https://raw.githubusercontent.com/toggl/toggl_api_docs/master/public/favicon.ico',
            text: 'Setup Toggl',
            callback: function(t) {
              return t.popup({
                title: 'Configure Toggl',
                url: './setup.html',
                height: 250
              });
            }
          }];
        }
        
        // Check if there's a running timer for this card
        return t.get('card', 'private', 'runningTimerId')
          .then(function(timerId) {
            if (timerId) {
              return [{
                icon: 'https://raw.githubusercontent.com/toggl/toggl_api_docs/master/public/favicon.ico',
                text: 'Stop Timer',
                callback: function(t) {
                  return t.get('board', 'shared', 'togglWorkspaceId')
                    .then(function(workspaceId) {
                      return stopTimer(t, apiToken, timerId, workspaceId);
                    });
                }
              }];
            } else {
              return [{
                icon: 'https://raw.githubusercontent.com/toggl/toggl_api_docs/master/public/favicon.ico',
                text: 'Start Timer',
                callback: function(t) {
                  return startTimer(t, apiToken);
                }
              }];
            }
          });
      });
  },
  
  'card-badges': function(t, options) {
    return t.get('card', 'private', 'runningTimerId')
      .then(function(timerId) {
        if (timerId) {
          return t.get('card', 'private', 'timerStartTime')
            .then(function(startTime) {
              var elapsed = Math.floor((Date.now() - startTime) / 1000);
              var hours = Math.floor(elapsed / 3600);
              var minutes = Math.floor((elapsed % 3600) / 60);
              var seconds = elapsed % 60;
              
              var hoursStr = hours.toString();
              if (hoursStr.length < 2) hoursStr = '0' + hoursStr;
              var minutesStr = minutes.toString();
              if (minutesStr.length < 2) minutesStr = '0' + minutesStr;
              var secondsStr = seconds.toString();
              if (secondsStr.length < 2) secondsStr = '0' + secondsStr;
              
              return [{
                text: hoursStr + ':' + minutesStr + ':' + secondsStr,
                color: 'red',
                refresh: 30
              }];
            });
        }
        
        // Show total time tracked
        return t.get('card', 'shared', 'totalTimeTracked')
          .then(function(totalTime) {
            if (totalTime && totalTime > 0) {
              var hours = Math.floor(totalTime / 3600);
              var minutes = Math.floor((totalTime % 3600) / 60);
              
              return [{
                text: hours + 'h ' + minutes + 'm',
                color: 'blue'
              }];
            }
            return [];
          });
      });
  },
  
  'show-settings': function(t, options) {
    return t.popup({
      title: 'Toggl Settings',
      url: './settings.html',
      height: 184
    });
  }
});

// Start a new timer
function startTimer(t, apiToken) {
  return Promise.all([
    t.card('name'),
    t.board('name'),
    t.get('board', 'shared', 'togglWorkspaceId')
  ]).then(function(values) {
    var card = values[0];
    var board = values[1];
    var workspaceId = values[2];
    
    var timerData = {
      description: card.name,
      workspace_id: parseInt(workspaceId),
      created_with: 'Trello Power-Up',
      tags: ['trello', board.name]
    };
    
    return makeTogglRequest('/me/time_entries', {
      method: 'POST',
      body: timerData
    }, apiToken)
    .then(function(response) {
      if (!response.ok) {
        return response.text().then(function(text) {
          console.error('Toggl API error:', response.status, text);
          if (response.status === 401) {
            throw new Error('Invalid API token. Please check your token in settings.');
          } else if (response.status === 403) {
            throw new Error('Access denied. Check your workspace ID and permissions.');
          } else {
            throw new Error('Toggl API error: ' + response.status);
          }
        });
      }
      return response.json();
    })
    .then(function(data) {
      return t.set('card', 'private', {
        runningTimerId: data.id,
        timerStartTime: Date.now()
      });
    })
    .then(function() {
      return t.alert({
        message: 'Timer started successfully!',
        duration: 3
      });
    })
    .catch(function(error) {
      console.error('Error starting timer:', error);
      return t.alert({
        message: error.message || 'Failed to start timer. Check console for details.',
        duration: 8
      });
    });
  });
}

// Stop the running timer
function stopTimer(t, apiToken, timerId, workspaceId) {
  return makeTogglRequest('/workspaces/' + workspaceId + '/time_entries/' + timerId + '/stop', {
    method: 'PATCH'
  }, apiToken)
  .then(function(response) {
    if (!response.ok) {
      throw new Error('Failed to stop timer');
    }
    return response.json();
  })
  .then(function(data) {
    var duration = data.duration || 0;
    
    return t.get('card', 'shared', 'totalTimeTracked')
      .then(function(totalTime) {
        var newTotal = (totalTime || 0) + Math.abs(duration);
        
        return t.set('card', 'shared', 'totalTimeTracked', newTotal);
      })
      .then(function() {
        return t.remove('card', 'private', ['runningTimerId', 'timerStartTime']);
      })
      .then(function() {
        return t.alert({
          message: 'Timer stopped!',
          duration: 3
        });
      });
  })
  .catch(function(error) {
    console.error('Error stopping timer:', error);
    return t.alert({
      message: 'Failed to stop timer. Please try again.',
      duration: 5
    });
  });
}